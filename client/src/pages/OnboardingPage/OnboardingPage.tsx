import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import styles from "./OnboardingPage.module.css";
import EditCategoryModal from "@/shared/components/Modal/EditCategoryModal";
import type { CategoryItem } from "@/shared/types/category";
import { CATEGORIES, type CategoryKey } from "@/shared/constants/categories";
import viteLogo from "/vite.svg";
import type { LibraryItem } from "@/shared/components/ItemAutocompleteSearch/ItemAutocompleteSearch.tsx";

export default function OnboardingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  /** Profile */
  const [username, setUsername] = useState("Sungm1nk1"); // Mock
  const [profileImageUrl] = useState(viteLogo); // Mock
  const [usernameDraft, setUsernameDraft] = useState("");

  /** I AM */
  const [iam, setIam] = useState("");
  const [iamDraft, setIamDraft] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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

  const iamDisplay = useMemo(() => {
    return iam.trim().length > 0
      ? iam
      : "Press 'Edit' button to introduce yourself!";
  }, [iam]);

  const startEditingProfile = () => {
    setIamDraft(iam);
    setUsernameDraft(username);
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    setIam(iamDraft.trim());
    setUsername(usernameDraft.trim());
    setIsEditingProfile(false);
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

  const handleAddItem = (category: CategoryKey, item: LibraryItem) => {
    const newItem: CategoryItem = {
      id: item.id,
      title: item.title,
      subtitle: item.category, // Or some other detail from LibraryItem
      imageUrl: item.imageUrl,
    };

    const updater = (prev: CategoryItem[]) => {
      // Prevent duplicates
      if (prev.some((existing) => existing.id === newItem.id)) {
        return prev;
      }
      return [...prev, newItem];
    };

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
      <div className={styles.header}>
        <button
          className={styles.editButton}
          onClick={startEditingProfile}
          type="button"
        >
          Edit
        </button>
      </div>

      {/* Profile Section */}
      <section className={`${styles.section} ${styles.profileSection}`}>
        <div className={styles.profileAvatar}>
          <img src={profileImageUrl} alt="Profile" />
        </div>
        <div className={styles.profileInfo}>
          {isEditingProfile ? (
            <div className={styles.iamEditContainer}>
              <input
                className={styles.usernameInput}
                value={usernameDraft}
                onChange={(e) => setUsernameDraft(e.target.value)}
                placeholder="Enter your Nickname"
              />
              <input
                className={styles.iamInput}
                value={iamDraft}
                onChange={(e) => setIamDraft(e.target.value)}
                placeholder="Introduce yourself"
                autoFocus
              />
              <button
                className={styles.iamSaveButton}
                onClick={saveProfile}
                type="button"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h1 className={styles.profileUsername}>{username}</h1>
              <p className={styles.profileIntro}>{iamDisplay}</p>
            </>
          )}
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
                  <div key={item.id} className={styles.itemCard}>
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

      {/* Category Modal */}
      {openCategory && (
        <EditCategoryModal
          isOpen={true}
          category={openCategory}
          items={getItemsByCategory(openCategory)}
          onClose={closeCategoryModal}
          onRemove={(id) => removeItem(openCategory, id)}
          onAddItem={(item) => handleAddItem(openCategory, item)}
        />
      )}
    </div>
  );
}
