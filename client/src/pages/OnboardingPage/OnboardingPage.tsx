import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import styles from "./OnboardingPage.module.css";
import EditCategoryModal from "@/shared/components/Modal/EditCategoryModal";
import { CATEGORIES, type CategoryKey } from "@/shared/constants/categories";
import viteLogo from "/vite.svg";
import { useProfile } from "@/shared/context/useProfile.ts";

export default function OnboardingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  // Get data and functions from the global context
  const {
    username,
    iam,
    setUsername,
    setIam,
    getItemsByCategory,
    addItemToCategory,
    removeItemFromCategory,
  } = useProfile();

  // Local UI state
  const [profileImageUrl] = useState(viteLogo); // This is not in context yet
  const [usernameDraft, setUsernameDraft] = useState("");
  const [iamDraft, setIamDraft] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [openCategory, setOpenCategory] = useState<CategoryKey | null>(null);

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
          onRemove={(id) => removeItemFromCategory(openCategory, id)}
          onAddItem={(item) => addItemToCategory(openCategory, item)}
        />
      )}
    </div>
  );
}
