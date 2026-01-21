import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AddCommentModal.module.css";
import CustomDatePicker from "@/shared/components/CustomDatePicker/CustomDatePicker";
import BACKEND_URL from "@/config";

export type NewCommentPayload = {
  category: string;
  title: string;
  date: Date;
  comment: string;
  posterUrl: string;
  imagePreviewUrl: string | null;
  file: File | null; // ✅ 서버 전송용 파일 객체 추가
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NewCommentPayload) => void;
  category: string;
  setCategory: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  date: Date | null;
  setDate: (date: Date | null) => void;
  comment: string;
  setComment: (value: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
};

const CATEGORY_OPTIONS = [
  "Exhibitions & Shows",
  "Movie",
  "Music",
  "Sports",
  "Talent",
  "Matches",
  "TV",
  "Shows",
];

const BACKEND_CATEGORY_MAP: Record<string, string> = {
  "Exhibitions & Shows": "EXHIBITION",
  Movie: "MOVIE",
  Music: "MUSIC",
  Sports: "SPORTS",
  Talent: "ACTOR",
  Matches: "MATCH",
  TV: "DRAMA",
  Shows: "EXHIBITION",
};

export default function AddCommentModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  setCategory,
  title,
  setTitle,
  date,
  setDate,
  comment,
  setComment,
  file,
  setFile,
}: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 검색 로직
  useEffect(() => {
    const fetchSearch = async () => {
      const query = title.trim();
      if (!query) {
        setSuggestions([]);
        return;
      }
      if (suggestions.find((s) => s.title === title)) return;

      const backendCategory = BACKEND_CATEGORY_MAP[category] || "ETC";
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/hobbies/search/?category=${backendCategory}&query=${encodeURIComponent(
            query
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(
            (data.results || []).map((item: any) => ({
              title: item.title || item.name,
              subtitle: item.subtitle || item.artist || item.genre || "",
              date: item.date || item.release_date || item.first_air_date,
              imageUrl: item.image_url || item.image || "",
            }))
          );
          setIsListOpen(true);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const debounce = setTimeout(fetchSearch, 300);
    return () => clearTimeout(debounce);
  }, [title, category]);

  const handleSelect = (item: any) => {
    setTitle(item.title);
    setSelectedPoster(item.imageUrl);
    if (item.date) {
      const parsedDate = new Date(item.date);
      if (!isNaN(parsedDate.getTime())) setDate(parsedDate);
    }
    setIsListOpen(false);
  };

  const handleSave = () => {
    if (!category || !title || !date || !comment) return;
    onSubmit({
      category,
      title: title.trim(),
      date,
      comment: comment.trim(),
      posterUrl: selectedPoster,
      imagePreviewUrl: previewUrl,
      file: file, // ✅ 파일 객체 전달
    });
    setSelectedPoster("");
    setSuggestions([]);
  };

  useEffect(() => {
    if (!isOpen) setIsListOpen(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const canSave =
    category.trim().length > 0 &&
    title.trim().length > 0 &&
    date !== null &&
    comment.trim().length > 0;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button className={styles.close} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.headline}>MY COMMENT</h2>
        <div className={styles.form}>
          {/* Category */}
          <div className={styles.row}>
            <div className={styles.label}>Category</div>
            <div className={styles.control}>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setTitle("");
                  setSuggestions([]);
                }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className={styles.chev} aria-hidden="true" />
            </div>
          </div>
          {/* Title */}
          <div className={styles.row}>
            <div className={styles.label}>Title</div>
            <div className={styles.control} style={{ position: "relative" }}>
              <input
                className={styles.input}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsListOpen(true);
                }}
                placeholder="Search title..."
                autoComplete="off"
              />
              {isListOpen && suggestions.length > 0 && (
                <div
                  ref={listRef}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                    background: "#333",
                    border: "1px solid #555",
                    borderRadius: "0 0 8px 8px",
                    zIndex: 10,
                  }}
                >
                  {suggestions.map((it, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelect(it)}
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#444")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {it.imageUrl && (
                        <img
                          src={it.imageUrl}
                          alt=""
                          style={{ width: "30px", height: "40px", objectFit: "cover" }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "14px" }}>{it.title}</div>
                        <div style={{ fontSize: "12px", color: "#aaa" }}>{it.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Date */}
          <div className={styles.row}>
            <div className={styles.label}>Date</div>
            <div className={styles.control}>
              <CustomDatePicker
                selected={date}
                onChange={(newDate: Date | null) => setDate(newDate)}
                className={styles.input}
                placeholderText="YYYY.MM.dd"
                dateFormat="yyyy.MM.dd"
              />
              <span className={styles.calendarIcon} aria-hidden="true" />
            </div>
          </div>
          {/* Comment */}
          <div className={styles.rowComment}>
            <div className={styles.label}>Comment</div>
            <div className={styles.commentArea}>
              <textarea
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          {/* Image */}
          <div className={styles.rowComment}>
            <div className={styles.label}>Image</div>
            <div className={styles.commentArea}>
              <div className={styles.previewBox}>
                {previewUrl ? (
                  <img className={styles.previewImg} src={previewUrl} alt="preview" />
                ) : (
                  <div className={styles.previewEmpty} />
                )}
              </div>
              <label className={styles.uploadBtn}>
                <input
                  className={styles.file}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                Upload
              </label>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.saveBtn} ${!canSave ? styles.disabled : ""}`}
              onClick={handleSave}
              disabled={!canSave}
            >
              UPLOAD
            </button>
          </div>
        </div>
      </div>
    </>
  );
}