import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AddCommentModal.module.css";
import CustomDatePicker from "@/shared/components/CustomDatePicker/CustomDatePicker";
import DateInputWithIcon from "./DateInputWithIcon";

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
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // =========================
  // ✅ AutoComplete State
  // =========================
  const [isListOpen, setIsListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filteredSuggestions = useMemo(() => {
    const q = title.trim().toLowerCase();

    const inCategory = CONTENT_LIBRARY.filter((it) => it.category === category);

    if (q.length === 0) return inCategory;

    return inCategory.filter((it) => it.title.toLowerCase().includes(q));
  }, [category, title]);

  const applySuggestion = (it: LibraryItem) => {
    setTitle(it.title);

    // ✅ Date 자동 세팅
    setDate(it.date);

    // (선택) 이미지도 자동 세팅하고 싶으면, url로 File 만들기는 브라우저 보안상 번거로움.
    // 지금은 "제목/날짜 자동세팅"까지만 확정.
    setIsListOpen(false);
    setActiveIndex(-1);

    // UX: 입력 포커스 유지
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // ✅ title을 타이핑하다가 "정확히 일치"하면 date 자동 세팅 (원하면 유지)
  useEffect(() => {
    const q = title.trim().toLowerCase();
    if (!q) return;

    const exact = CONTENT_LIBRARY.find(
      (it) => it.category === category && it.title.toLowerCase() === q,
    );

    if (exact) {
      setDate(exact.date);
    }
  }, [title, category, setDate]);

  // ✅ 모달 닫힐 때 자동완성 상태 리셋
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isOpen) {
      setIsListOpen(false);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // ✅ 바깥 클릭하면 자동완성 리스트 닫기
  useEffect(() => {
    if (!isOpen) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inputEl = inputRef.current;
      const listEl = listRef.current;

      if (!inputEl || !listEl) return;

      const clickedInput = inputEl.contains(target);
      const clickedList = listEl.contains(target);

      if (!clickedInput && !clickedList) {
        setIsListOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [isOpen]);

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
                onChange={(e) => {
                  setCategory(e.target.value);
                  // ✅ 카테고리 바꾸면 자동완성 상태 초기화
                  setIsListOpen(false);
                  setActiveIndex(-1);
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

          {/* Title (✅ 자동완성) */}
          <div className={styles.row}>
            <div className={styles.label}>Title</div>

            <div className={styles.control}>
              <input
                ref={inputRef}
                className={styles.input}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsListOpen(true);
                  setActiveIndex(-1);
                }}
                onFocus={() => {
                  setIsListOpen(true);
                }}
                onKeyDown={(e) => {
                  if (!isListOpen) return;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (filteredSuggestions.length === 0) return;

                    setActiveIndex((prev) => {
                      const next = prev + 1;
                      return next >= filteredSuggestions.length ? 0 : next;
                    });
                    return;
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (filteredSuggestions.length === 0) return;

                    setActiveIndex((prev) => {
                      const next = prev - 1;
                      return next < 0 ? filteredSuggestions.length - 1 : next;
                    });
                    return;
                  }

                  if (e.key === "Enter") {
                    if (filteredSuggestions.length === 0) return;

                    // ✅ activeIndex가 없으면 0번째 선택
                    const idx =
                      activeIndex >= 0
                        ? activeIndex
                        : Math.min(0, filteredSuggestions.length - 1);
                    const picked = filteredSuggestions[idx];
                    if (!picked) return;

                    e.preventDefault();
                    applySuggestion(picked);
                    return;
                  }

                  if (e.key === "Escape") {
                    setIsListOpen(false);
                    setActiveIndex(-1);
                  }
                }}
                placeholder=""
                autoComplete="off"
              />

              {/* ✅ 자동완성 리스트 */}
              {isListOpen && filteredSuggestions.length > 0 && (
                <div ref={listRef} className={styles.autoList} role="listbox">
                  {filteredSuggestions.map((it, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        className={`${styles.autoItem} ${
                          isActive ? styles.autoItemActive : ""
                        }`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => applySuggestion(it)}
                      >
                        <img
                          className={styles.autoThumb}
                          src={it.imageUrl}
                          alt={it.title}
                        />
                        <div className={styles.autoText}>
                          <div className={styles.autoTitle} title={it.title}>
                            {it.title}
                          </div>
                          <div className={styles.autoSub}>{it.category}</div>
                        </div>
                        <div className={styles.autoRight}>
                          <span className={styles.autoDate}>
                            {`${it.date.getFullYear()}.${String(
                              it.date.getMonth() + 1,
                            ).padStart(
                              2,
                              "0",
                            )}.${String(it.date.getDate()).padStart(2, "0")}`}
                          </span>
                          <span className={styles.autoChev} aria-hidden="true">
                            ▾
                          </span>
                        </div>
                      </button>
                    );
                  })}
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
                placeholderText="YYYY.MM.dd"
                dateFormat="yyyy.MM.dd"
                customInput={<DateInputWithIcon />}
              />
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
