import { useMemo, useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import styles from "./OnboardingPage.module.css";
import EditCategoryModal from "@/shared/components/Modal/EditCategoryModal";
import { CATEGORIES, type CategoryKey } from "@/shared/constants/categories";
import type { CategoryItem } from "@/shared/types/category";
import viteLogo from "/vite.svg";
import Modal from "@/shared/components/Modal/Modal";
import ColorPalette from "@/shared/components/ColorPalette/ColorPalette";
import BACKEND_URL from "@/config";

export default function OnboardingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  // --- 상태 관리 ---
  const [allItems, setAllItems] = useState<CategoryItem[]>([]);
  const [username, setUsername] = useState("Loading...");
  const [iam, setIam] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(viteLogo);

  const [usernameDraft, setUsernameDraft] = useState("");
  const [iamDraft, setIamDraft] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [openCategory, setOpenCategory] = useState<CategoryKey | null>(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  // --- 1. 데이터 로드 ---
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        const profileRes = await fetch(`${BACKEND_URL}/api/hobbies/profile/me/`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (profileRes.ok) {
          const pData = await profileRes.json();
          setUsername(pData.nickname || "User");
          setIam(pData.bio || "");
          if (pData.profile_image) setProfileImageUrl(pData.profile_image);
        } else {
          const uRes = await fetch(`${BACKEND_URL}/dj-rest-auth/user/`, {
            headers: { Authorization: `Token ${token}` },
          });
          if (uRes.ok) {
            const uData = await uRes.json();
            setUsername(uData.email?.split("@")[0] || "User");
          }
        }
        fetchItems();
      } catch (err) {
        console.error("Data Load Error:", err);
      }
    };
    fetchAllData();
  }, []);

  const fetchItems = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/hobbies/items/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllItems(data.map((item: any) => ({ ...item, imageUrl: item.image_url || item.image || "" })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- 2. 액션 함수들 ---

  const addItemToCategory = async (category: CategoryKey, itemData: any) => {
    const token = localStorage.getItem("userToken");
    const BACKEND_CATEGORY_MAP: Record<string, string> = {
      Music: "MUSIC", Movie: "MOVIE", Talent: "ACTOR", Sports: "SPORTS",
      Matches: "MATCH", "Drama & OTT": "DRAMA", Shows: "EXHIBITION",
    };
    const backendCategory = BACKEND_CATEGORY_MAP[category] || "ETC";

    try {
      const res = await fetch(`${BACKEND_URL}/api/hobbies/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify({
          category: backendCategory, title: itemData.title,
          subtitle: itemData.subtitle, image_url: itemData.imageUrl,
        }),
      });
      if (res.ok) fetchItems();
      else alert(`추가 실패: ${JSON.stringify(await res.json())}`);
    } catch (e) {
      console.error(e);
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  const removeItemFromCategory = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch(`${BACKEND_URL}/api/hobbies/items/${id}/`, {
        method: "DELETE", headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) setAllItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error(e);
    }
  };
  
  const saveNickname = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) { alert("Authentication error."); return; }
    try {
      const res = await fetch(`${BACKEND_URL}/api/hobbies/profile/me/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify({ nickname: usernameDraft.trim() }),
      });
      const responseData = await res.json();
      if (res.ok) {
        setUsername(responseData.nickname);
        setIsEditingNickname(false);
      } else {
        alert("Failed to save nickname: " + JSON.stringify(responseData));
      }
    } catch (e) {
      console.error("Save Nickname Error: ", e);
      alert("An error occurred while saving nickname.");
    }
  };

  const saveBio = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) { alert("Authentication error."); return; }
    try {
      const res = await fetch(`${BACKEND_URL}/api/hobbies/profile/me/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify({ bio: iamDraft.trim() }),
      });
      const responseData = await res.json();
      if (res.ok) {
        setIam(responseData.bio || "");
        setIsEditingBio(false);
      } else {
        alert("Failed to save bio: " + JSON.stringify(responseData));
      }
    } catch (e) {
      console.error("Save Bio Error: ", e);
      alert("An error occurred while saving bio.");
    }
  };

  // --- 3. UI 헬퍼 ---
  const getItemsByCategory = (category: CategoryKey) => {
    const BACKEND_CATEGORY_MAP: Record<string, string> = { Music: "MUSIC", Movie: "MOVIE", Talent: "ACTOR", Sports: "SPORTS", Matches: "MATCH", "Drama & OTT": "DRAMA", Shows: "EXHIBITION" };
    const targetCode = BACKEND_CATEGORY_MAP[category] || category;
    return allItems.filter((it) => it.category === targetCode || it.category === category);
  };

  const iamDisplay = useMemo(() => iam.trim().length > 0 ? iam : "Press 'Edit' to introduce yourself!", [iam]);
  const startEditingNickname = () => { setUsernameDraft(username); setIsEditingNickname(true); setIsEditingBio(false); };
  const startEditingBio = () => { setIamDraft(iam); setIsEditingBio(true); setIsEditingNickname(false); };
  const closeCategoryModal = () => setOpenCategory(null);

  const handleSaveAndCapture = async () => {
    if (!pageRef.current) return;
    try {
      const canvas = await html2canvas(pageRef.current, { allowTaint: true, useCORS: true, backgroundColor: "#1e1e1e" });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "dmara-capture.png";
      link.click();
    } catch (e) {
      console.error(e);
      alert("Capture failed.");
    }
  };

  return (
    <>
      <div className={styles.page} ref={pageRef}>
        <div className={styles.header}>
          <button className={styles.editButton} onClick={() => setIsColorModalOpen(true)} type="button">Edit Theme</button>
        </div>

        <section className={`${styles.section} ${styles.profileSection}`}>
          <div className={styles.avatarContainer}>
            <div className={styles.profileAvatar}>
              <img src={profileImageUrl} alt="Profile" />
            </div>
            <div className={styles.profileEditBtnWrap}>
              <button
                className={styles.profileEditBtn}
                onClick={() => alert("프로필 사진 수정 기능 준비 중!")}
                type="button"
                aria-label="Edit profile picture"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.profileEditIcon}
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>
          </div>
          <div className={styles.profileInfo}>
            {isEditingNickname ? (
              <div className={styles.iamEditContainer}>
                <input className={styles.usernameInput} value={usernameDraft} onChange={(e) => setUsernameDraft(e.target.value)} placeholder="Enter your Nickname" autoFocus />
                <button className={styles.iamSaveButton} onClick={saveNickname}>Save</button>
              </div>
            ) : (
              <div className={styles.profileUsernameWrap}>
                <h1 className={styles.profileUsername}>{username}</h1>
                <button className={styles.inlineEditBtn} onClick={startEditingNickname}>Edit</button>
              </div>
            )}
            {isEditingBio ? (
              <div className={styles.iamEditContainer}>
                <input className={styles.iamInput} value={iamDraft} onChange={(e) => setIamDraft(e.target.value)} placeholder="Introduce yourself" autoFocus />
                <button className={styles.iamSaveButton} onClick={saveBio}>Save</button>
              </div>
            ) : (
              <div className={styles.profileIntroWrap}>
                <p className={styles.profileIntro}>{iamDisplay}</p>
                <button className={styles.inlineEditBtn} onClick={startEditingBio}>Edit</button>
              </div>
            )}
          </div>
        </section>

        {CATEGORIES.map((category) => (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {category}
              <button className={styles.titleEditBtn} onClick={() => setOpenCategory(category)}>Edit</button>
            </h2>
            <div className={styles.itemGrid}>
              {getItemsByCategory(category).length > 0 ? (
                getItemsByCategory(category).map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <img className={styles.thumb} src={item.imageUrl} alt={item.title} />
                    <div className={styles.info}>
                      <div className={styles.title}>{item.title}</div>
                      <div className={styles.subtitle}>{item.subtitle}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState} onClick={() => setOpenCategory(category)}>
                  Add your favorite {category}
                </div>
              )}
            </div>
          </section>
        ))}
        <button className={styles.saveButton} type="button" onClick={handleSaveAndCapture}>SAVE</button>
        <footer className={styles.footer}>© 2026 D_MARA. All Rights Reserved.</footer>
      </div>

      {openCategory && (
        <EditCategoryModal
          isOpen={true} category={openCategory} items={getItemsByCategory(openCategory)}
          onClose={closeCategoryModal} onRemove={(id) => removeItemFromCategory(id)}
          onAddItem={(item) => addItemToCategory(openCategory, item)}
        />
      )}
      <Modal isOpen={isColorModalOpen} onClose={() => setIsColorModalOpen(false)} title="Select Theme Color">
        <ColorPalette />
      </Modal>
    </>
  );
}