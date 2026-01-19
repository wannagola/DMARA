import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import styles from "./OnboardingPage.module.css";
import Modal from "@/shared/components/Modal/Modal";
import EditCategoryModal from "@/shared/components/Modal/EditCategoryModal";
import type { CategoryItem } from "@/shared/types/category";
import { CATEGORIES, type CategoryKey } from "@/shared/constants/categories";

export default function OnboardingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  /** I AM */
  const [iam, setIam] = useState("");
  const [isIamModalOpen, setIsIamModalOpen] = useState(false);
  const [iamDraft, setIamDraft] = useState("");

  /** Category modals */
  const [openCategory, setOpenCategory] = useState<CategoryKey | null>(null);

  /** 임시 mock (나중에 API/검색 붙일 자리) */
  const [musicItems, setMusicItems] = useState<CategoryItem[]>([
    {
      id: 1,
      title: "Dance All Night",
      subtitle: "Rose - BlackPink",
      imageUrl: new URL(`/src/assets/items/music1.jpeg`, import.meta.url).href,
    },
    {
      id: 2,
      title: "Love Never Felt So Good",
      subtitle: "Michael Jackson",
      imageUrl: new URL(`/src/assets/items/music2.jpeg`, import.meta.url).href,
    },
    {
      id: 3,
      title: "Versace on the Floor",
      subtitle: "Bruno Mars",
      imageUrl: new URL(`/src/assets/items/music3.jpeg`, import.meta.url).href,
    },
  ]);

  const [movieItems, setMovieItems] = useState<CategoryItem[]>([]);
  const [talentItems, setTalentItems] = useState<CategoryItem[]>([]);
  const [sportsItems, setSportsItems] = useState<CategoryItem[]>([]);
  const [matchesItems, setMatchesItems] = useState<CategoryItem[]>([]);
  const [dramaItems, setDramaItems] = useState<CategoryItem[]>([]);
  const [showsItems, setShowsItems] = useState<CategoryItem[]>([]);

  /** Flipped items state */
  const [flippedItemIds, setFlippedItemIds] = useState<Set<number>>(new Set());

  const iamDisplay = useMemo(() => {
    return iam.trim().length > 0 ? iam : "Sungm1nk1님을 한 줄로 소개해주세요.";
  }, [iam]);

  const openIamModal = () => {
    setIamDraft(iam);
    setIsIamModalOpen(true);
  };

  const closeIamModal = () => setIsIamModalOpen(false);

  const saveIam = () => {
    setIam(iamDraft.trim());
    closeIamModal();
  };

  const closeCategoryModal = () => setOpenCategory(null);

  const handleSaveAndCapture = async () => {
    if (!pageRef.current) return;

    try {
      const canvas = await html2canvas(pageRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#1e1e1e",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "dmara-capture.png";
      link.click();
    } catch (e) {
      console.error(e);
      alert("Something went wrong with the capture.");
    }
  };

  const getItemsByCategory = (category: CategoryKey): CategoryItem[] => {
    switch (category) {
      case "Music":
        return musicItems;
      case "Movie":
        return movieItems;
      case "Talent":
        return talentItems;
      case "Sports":
        return sportsItems;
      case "Matches":
        return matchesItems;
      case "Drama & OTT":
        return dramaItems;
      case "Shows":
        return showsItems;
    }
  };

  const handleItemClick = (id: number) => {
    setFlippedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const removeItem = (category: CategoryKey, id: number) => {
    const updater = (prev: CategoryItem[]) => prev.filter((it) => it.id !== id);

    switch (category) {
      case "Music":
        setMusicItems(updater);
        return;
      case "Movie":
        setMovieItems(updater);
        return;
      case "Talent":
        setTalentItems(updater);
        return;
      case "Sports":
        setSportsItems(updater);
        return;
      case "Matches":
        setMatchesItems(updater);
        return;
      case "Drama & OTT":
        setDramaItems(updater);
        return;
      case "Shows":
        setShowsItems(updater);
        return;
    }
  };

  return (
    <div className={styles.page} ref={pageRef}>
      {/* I AM */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>I AM</h2>
        <div className={styles.iamBox}>
          <span className={styles.iamText}>{iamDisplay}</span>
          <button
            className={styles.editButton}
            onClick={openIamModal}
            type="button"
          >
            Edit
          </button>
        </div>
      </section>

      {CATEGORIES.map((category) => {
        const items = getItemsByCategory(category);
        return (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {category}
              {items.length > 0 && (
                <button
                  className={styles.titleEditBtn}
                  onClick={() => setOpenCategory(category)}
                >
                  Edit
                </button>
              )}
            </h2>
            <div className={styles.itemGrid}>
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.itemCard} ${
                      flippedItemIds.has(item.id) ? styles.isFlipped : ""
                    }`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <img
                      className={styles.thumb}
                      src={item.imageUrl}
                      alt={item.title}
                    />
                    <div className={styles.info}>
                      <div className={styles.title}>{item.title}</div>
                      <div className={styles.subtitle}>{item.subtitle}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={styles.emptyState}
                  onClick={() => setOpenCategory(category)}
                >
                  Add your favorite {category}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Save */}
      <button
        className={styles.saveButton}
        type="button"
        onClick={handleSaveAndCapture}
      >
        SAVE
      </button>

      <footer className={styles.footer}>
        © 2026 D_MARA. All Rights Reserved.
      </footer>

      {/* I AM Modal */}
      <Modal isOpen={isIamModalOpen} title="I AM 편집" onClose={closeIamModal}>
        <div className={styles.modalBody}>
          <label className={styles.modalLabel}>
            한 줄 소개
            <input
              className={styles.modalInput}
              value={iamDraft}
              onChange={(e) => setIamDraft(e.target.value)}
              placeholder="예: 낮에는 개발자, 밤에는 가수"
              autoFocus
            />
          </label>
          <div className={styles.modalActions}>
            <button
              className={styles.modalGhostBtn}
              onClick={closeIamModal}
              type="button"
            >
              Cancel
            </button>
            <button
              className={styles.modalPrimaryBtn}
              onClick={saveIam}
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Category Modal */}
      {openCategory && (
        <EditCategoryModal
          isOpen={true}
          category={openCategory}
          items={getItemsByCategory(openCategory)}
          onClose={closeCategoryModal}
          onRemove={(id) => removeItem(openCategory, id)}
          onAddClick={() => {
            alert(`Add flow for ${openCategory}`);
          }}
        />
      )}
    </div>
  );
}
