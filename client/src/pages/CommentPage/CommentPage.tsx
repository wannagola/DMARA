import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CommentPage.module.css";
import Modal from "@/shared/components/Modal/Modal";

type CommentItem = {
  id: number;
  category: string;
  title: string;
  date: string; // YYYY.MM.DD
  preview: string;
  imageUrl: string;
};

const formatDateToDots = (value: string) => {
  // "2026-01-17" -> "2026.01.17"
  if (!value) return "";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${y}.${m}.${d}`;
};

export default function CommentPage() {
  const [activeTab, setActiveTab] = useState<"my" | "friends">("my");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // ✅ Add Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState("Exhibitions & Shows");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDate, setDraftDate] = useState(""); // input: yyyy-mm-dd
  const [draftContent, setDraftContent] = useState("");
  const [draftImageUrl, setDraftImageUrl] = useState("");
  const [draftImageFileUrl, setDraftImageFileUrl] = useState<string | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 목업 데이터 (나중에 API로 교체)
  const [items, setItems] = useState<CommentItem[]>([
    {
      id: 1,
      category: "Exhibitions & Shows",
      title: "Wicked",
      date: "2026.01.16",
      preview:
        "오늘 뮤지컬 Wicked를 보고 왔다. 생각보다 내용이 무거워서 조금 놀랐다. 엘파바가 단순히 나쁜 ...",
      imageUrl: "/src/assets/items/wicked.png",
    },
    {
      id: 2,
      category: "Exhibitions & Shows",
      title: "DEADLINE : WORLD TOUR...",
      date: "2025.07.05",
      preview:
        "오늘은 바로 기다리고 기다리던 콘서트를 다녀온 날이다! 아침 일찍부터 준비를 하고 셔틀버스를...",
      imageUrl: "/src/assets/items/deadline.png",
    },
  ]);

  const visibleItems = useMemo(() => {
    if (activeTab === "friends") return [];
    return items;
  }, [activeTab, items]);

  // 바깥 클릭 시 "DELETE" 메뉴 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!openMenuId) return;
      const target = e.target as HTMLElement;
      if (target.closest(`[data-menu-root="true"]`)) return;
      setOpenMenuId(null);
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenuId]);

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setOpenMenuId(null);
  };

  // ===== Add Modal handlers =====
  const openAddModal = () => {
    setDraftCategory("Exhibitions & Shows");
    setDraftTitle("");
    setDraftDate("");
    setDraftContent("");
    setDraftImageUrl("");

    // 이전 파일 미리보기 URL 정리
    if (draftImageFileUrl) URL.revokeObjectURL(draftImageFileUrl);
    setDraftImageFileUrl(null);

    setIsAddOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
  };

  const onPickImage = () => {
    fileInputRef.current?.click();
  };

  const onImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 기존 objectURL 정리
    if (draftImageFileUrl) URL.revokeObjectURL(draftImageFileUrl);

    const url = URL.createObjectURL(file);
    setDraftImageFileUrl(url);

    // URL 입력보다 파일이 우선하도록 URL 입력은 비워둠(원하면 유지해도 됨)
    setDraftImageUrl("");
  };

  const canSave =
    draftCategory.trim().length > 0 &&
    draftTitle.trim().length > 0 &&
    draftDate.trim().length > 0 &&
    draftContent.trim().length > 0 &&
    (draftImageFileUrl || draftImageUrl.trim().length > 0);

  const saveNewComment = () => {
    if (!canSave) return;

    const imageUrlFinal = draftImageFileUrl
      ? draftImageFileUrl
      : draftImageUrl.trim();

    const newItem: CommentItem = {
      id: Date.now(),
      category: draftCategory.trim(),
      title: draftTitle.trim(),
      date: formatDateToDots(draftDate.trim()),
      preview: draftContent.trim(),
      imageUrl: imageUrlFinal,
    };

    // 최신이 위로 오게
    setItems((prev) => [newItem, ...prev]);
    setIsAddOpen(false);
  };

  return (
    <div className={styles.page}>
      {/* 상단 토글 바 (My Comment / Friends) */}
      <div className={styles.segmentWrap}>
        <div className={styles.segment}>
          <button
            type="button"
            className={`${styles.segmentBtn} ${
              activeTab === "my" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("my")}
          >
            My Comment
          </button>

          <button
            type="button"
            className={`${styles.segmentBtn} ${
              activeTab === "friends" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("friends")}
          >
            Friends
          </button>
        </div>
      </div>

      {/* 리스트 */}
      <div className={styles.list}>
        {visibleItems.map((it) => {
          const isMenuOpen = openMenuId === it.id;

          return (
            <div key={it.id} className={styles.card} data-menu-root="true">
              {/* 이미지 */}
              <img className={styles.thumb} src={it.imageUrl} alt={it.title} />

              {/* 내용 */}
              <div className={styles.content}>
                <div className={styles.topRow}>
                  <div className={styles.category}>{it.category}</div>

                  <div className={styles.menuArea}>
                    {isMenuOpen && (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => deleteItem(it.id)}
                      >
                        DELETE
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.moreBtn}
                      onClick={() => toggleMenu(it.id)}
                      aria-label="more"
                    >
                      •••
                    </button>
                  </div>
                </div>

                <div className={styles.title}>{it.title}</div>
                <div className={styles.date}>{it.date}</div>

                <p className={styles.preview}>{it.preview}</p>
              </div>

              {/* 카드 오른쪽 “바” */}
              <div className={styles.rightBar} />
            </div>
          );
        })}

        {activeTab === "friends" && (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>Friends</div>
            <div className={styles.emptySub}>아직 표시할 코멘트가 없어요.</div>
          </div>
        )}
      </div>

      {/* Add 버튼 */}
      <button type="button" className={styles.fab} onClick={openAddModal}>
        Add
      </button>

      <footer className={styles.footer}>
        © 2026 D_MARA. All Rights Reserved.
      </footer>

      {/* ✅ Add Modal */}
      <Modal isOpen={isAddOpen} title="코멘트 추가" onClose={closeAddModal}>
        <div className={styles.addBody}>
          <label className={styles.addLabel}>
            Category
            <input
              className={styles.addInput}
              value={draftCategory}
              onChange={(e) => setDraftCategory(e.target.value)}
              placeholder="예: Exhibitions & Shows"
            />
          </label>

          <label className={styles.addLabel}>
            Title
            <input
              className={styles.addInput}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="예: Wicked"
              autoFocus
            />
          </label>

          <label className={styles.addLabel}>
            Date
            <input
              className={styles.addInput}
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
            />
          </label>

          <label className={styles.addLabel}>
            Comment
            <textarea
              className={styles.addTextarea}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="코멘트를 입력하세요"
            />
          </label>

          <div className={styles.addRow}>
            <div className={styles.addCol}>
              <div className={styles.addLabelText}>Image</div>

              <div className={styles.imageActions}>
                <button
                  type="button"
                  className={styles.pickBtn}
                  onClick={onPickImage}
                >
                  Upload
                </button>

                <input
                  ref={fileInputRef}
                  className={styles.hiddenFile}
                  type="file"
                  accept="image/*"
                  onChange={onImageFileChange}
                />
              </div>

              <div className={styles.orLine}>or</div>

              <input
                className={styles.addInput}
                value={draftImageUrl}
                onChange={(e) => setDraftImageUrl(e.target.value)}
                placeholder="이미지 URL 붙여넣기"
              />
            </div>

            <div className={styles.previewBox}>
              <div className={styles.previewTitle}>Preview</div>
              <div className={styles.previewFrame}>
                {draftImageFileUrl || draftImageUrl ? (
                  <img
                    className={styles.previewImg}
                    src={draftImageFileUrl || draftImageUrl}
                    alt="preview"
                  />
                ) : (
                  <div className={styles.previewEmpty}>No image</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.addActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={closeAddModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={saveNewComment}
              disabled={!canSave}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
