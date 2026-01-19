import { useEffect, useMemo } from "react";
import styles from "./AddCommentModal.module.css";
import CustomDatePicker from "@/shared/components/CustomDatePicker/CustomDatePicker";

export type NewCommentPayload = {
  category: string;
  title: string;
  date: Date;
  comment: string;
  imagePreviewUrl: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NewCommentPayload) => void;
  // Controlled component props
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
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    // Cleanup object URL when component unmounts or file changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const canSave =
    category.trim().length > 0 &&
    title.trim().length > 0 &&
    date !== null &&
    comment.trim().length > 0;
    
  const handleSave = () => {
    if (!canSave || !date) return;

    onSubmit({
      category,
      title: title.trim(),
      date,
      comment: comment.trim(),
      imagePreviewUrl: previewUrl,
    });
  };

  return (
    <>
      {/* 배경 블러/딤 */}
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal} role="dialog" aria-modal="true">
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="close"
        >
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
                onChange={(e) => setCategory(e.target.value)}
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
            <div className={styles.control}>
              <input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=""
              />
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

          <div className={styles.rowComment}>
            <div className={styles.label}>Image</div>
            <div className={styles.commentArea}>
              <div className={styles.previewBox}>
                {previewUrl ? (
                  <img
                    className={styles.previewImg}
                    src={previewUrl}
                    alt="preview"
                  />
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
