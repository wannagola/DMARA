import { useMemo, useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import styles from "./OnboardingPage.module.css";
import EditCategoryModal from "@/shared/components/Modal/EditCategoryModal";
import { CATEGORIES, type CategoryKey } from "@/shared/constants/categories";
import type { CategoryItem } from "@/shared/types/category";
import viteLogo from "/vite.svg";

export default function OnboardingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  // --- 상태 관리 ---
  const [allItems, setAllItems] = useState<CategoryItem[]>([]);
  const [username, setUsername] = useState("Loading...");
  const [iam, setIam] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(viteLogo);

  const [usernameDraft, setUsernameDraft] = useState("");
  const [iamDraft, setIamDraft] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [openCategory, setOpenCategory] = useState<CategoryKey | null>(null);

  // --- 1. 데이터 로드 ---
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        // (1) 프로필 가져오기
        const profileRes = await fetch(
          "http://127.0.0.1:8000/api/hobbies/profile/me/",
          {
            headers: { Authorization: `Token ${token}` },
          },
        );

        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.nickname) {
            setUsername(pData.nickname);
            setIam(pData.bio || "");
            if (pData.profile_image) setProfileImageUrl(pData.profile_image);
          } else {
            const uRes = await fetch(
              "http://127.0.0.1:8000/dj-rest-auth/user/",
              {
                headers: { Authorization: `Token ${token}` },
              },
            );
            if (uRes.ok) {
              const uData = await uRes.json();
              setUsername(uData.email?.split("@")[0] || "User");
            }
          }
        }

        // (2) 아이템 목록 가져오기
        fetchItems();
      } catch (err) {
        console.error("Data Load Error:", err);
      }
    };
    fetchAllData();
  }, []);

  // 데이터를 가져와서 imageUrl로 변환하는 핵심 부분
  const fetchItems = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/hobbies/items/", {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        const data = await res.json();

        // 백엔드(image_url) -> 프론트엔드(imageUrl) 이름 맞추기
        const formattedData = data.map((item: any) => ({
          ...item,
          // image_url이 있으면 그걸 쓰고, 없으면 image를 씀
          imageUrl: item.image_url || item.image || "",
        }));

        setAllItems(formattedData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- 2. 액션 함수들 ---

  const addItemToCategory = async (category: CategoryKey, itemData: any) => {
    const token = localStorage.getItem("userToken");

    // 프론트엔드 카테고리 -> 백엔드 DB 코드 매핑
    const BACKEND_CATEGORY_MAP: Record<string, string> = {
      Music: "MUSIC",
      Movie: "MOVIE",
      Talent: "ACTOR",
      Sports: "SPORTS",
      Matches: "MATCH",
      "Drama & OTT": "DRAMA",
      Shows: "EXHIBITION",
    };
    const backendCategory = BACKEND_CATEGORY_MAP[category] || "ETC";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/hobbies/items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          category: backendCategory,
          title: itemData.title,
          subtitle: itemData.subtitle,
          image_url: itemData.imageUrl, // 저장할 때는 image_url로 보냄
        }),
      });

      if (res.ok) {
        fetchItems(); // 저장 후 목록 갱신
      } else {
        const errorData = await res.json();
        console.error("Add Failed:", errorData);
        alert(`추가 실패: ${JSON.stringify(errorData)}`);
      }
    } catch (e) {
      console.error(e);
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  const removeItemFromCategory = async (category: CategoryKey, id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/hobbies/items/${id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (res.ok) {
        setAllItems((prev) => prev.filter((it) => it.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveProfile = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/hobbies/profile/me/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          nickname: usernameDraft.trim(),
          bio: iamDraft.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsername(data.nickname);
        setIam(data.bio || "");
        setIsEditingProfile(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- 3. UI 헬퍼 ---
  const getItemsByCategory = (category: CategoryKey) => {
    const BACKEND_CATEGORY_MAP: Record<string, string> = {
      Music: "MUSIC",
      Movie: "MOVIE",
      Talent: "ACTOR",
      Sports: "SPORTS",
      Matches: "MATCH",
      "Drama & OTT": "DRAMA",
      Shows: "EXHIBITION",
    };

    const targetCode = BACKEND_CATEGORY_MAP[category] || category;

    // DB에 저장된 코드(MUSIC)와 프론트엔드 카테고리(Music) 둘 다 확인하여 필터링
    return allItems.filter(
      (it) => it.category === targetCode || it.category === category,
    );
  };

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
      alert("Capture failed.");
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
              <button
                className={styles.titleEditBtn}
                onClick={() => setOpenCategory(category)}
              >
                Edit
              </button>
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
