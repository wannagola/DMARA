import { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import styles from "./OnboardingPage.module.css";
import EditCategoryModal from "@/shared/components/Modal/EditCategoryModal";
import type { CategoryItem } from "@/shared/types/category";
import { CATEGORIES, type CategoryKey } from "@/shared/constants/categories";
import viteLogo from "/vite.svg";

export default function OnboardingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  // --- 상태 관리 ---
  const [username, setUsername] = useState("Loading...");
  const [profileImageUrl, setProfileImageUrl] = useState(viteLogo);
  const [iam, setIam] = useState("");
  
  // 편집용 상태 (닉네임, 소개)
  const [usernameDraft, setUsernameDraft] = useState("");
  const [iamDraft, setIamDraft] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 카테고리 모달 상태
  const [openCategory, setOpenCategory] = useState<CategoryKey | null>(null);

  // ★ DB에서 받아온 '모든' 취향 아이템을 저장하는 곳
  const [allItems, setAllItems] = useState<CategoryItem[]>([]);

// --- 1. 내 정보 불러오기 ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        // [핵심] 1순위로 우리가 만든 'Profile' 정보를 가져옵니다.
        const profileRes = await fetch("http://127.0.0.1:8000/api/hobbies/profile/me/", {
          headers: { "Authorization": `Token ${token}` },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // 저장된 닉네임이 있으면 그것을 쓰고, 없으면 기본 유저 정보를 찾으러 갑니다.
          if (profileData.nickname) {
            setUsername(profileData.nickname);
            setIam(profileData.bio || "");
            if (profileData.profile_image) setProfileImageUrl(profileData.profile_image);
            return; 
          }
        }

        // 2순위: Profile에 닉네임이 없는 신규 유저라면 기본 이메일 정보를 가져옵니다.
        const userRes = await fetch("http://127.0.0.1:8000/dj-rest-auth/user/", {
          headers: { "Authorization": `Token ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          const initialName = userData.email?.split("@")[0] || userData.username;
          setUsername(initialName);
        }
      } catch (err) {
        console.error("프로필 로딩 실패:", err);
      }
    };
    fetchProfile();
  }, []);


  // --- 2. 내 취향 목록(아이템) 불러오기 함수 ---
  const fetchItems = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/hobbies/items/", {
        headers: { "Authorization": `Token ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllItems(data); // DB 데이터를 상태에 저장
      }
    } catch (err) {
      console.error("취향 목록 로딩 실패:", err);
    }
  };

  // 페이지 처음 켜질 때 목록 가져오기
  useEffect(() => {
    fetchItems();
  }, []);

  // --- 3. 프로필 저장 (PATCH) ---
  const saveProfile = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/hobbies/profile/me/", {
        method: "PATCH", // 부분 수정
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: usernameDraft, // ★ 필드명을 'nickname'으로 보내야 합니다.
          bio: iamDraft,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsername(data.nickname);
        setIam(data.bio || "");
        setIsEditingProfile(false);
        alert("닉네임이 저장되었습니다!");
      
        // 저장 후 헤더 등 다른 곳도 바뀌게 하려면 새로고침을 한 번 해주는 것도 방법입니다.
        // window.location.reload(); 
      } else {
        alert("닉네임 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 4. 아이템 삭제 ---
  const removeItem = async (id: number) => {
    const token = localStorage.getItem("userToken");
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/hobbies/items/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` },
      });

      if (res.ok) {
        // 성공 시 화면에서도 즉시 제거 (API 재호출 없이 빠르게 반영)
        setAllItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 화면 헬퍼 함수들 ---
  const startEditingProfile = () => {
    setIamDraft(iam);
    setUsernameDraft(username);
    setIsEditingProfile(true);
  };

  const closeCategoryModal = () => setOpenCategory(null);

  // DB 데이터 중 해당 카테고리만 필터링해서 보여주기
  const getItemsByCategory = (category: CategoryKey): CategoryItem[] => {
    return allItems.filter(item => item.category === category);
  };

  const handleSaveAndCapture = async () => {
    if (!pageRef.current) return;
    try {
      const canvas = await html2canvas(pageRef.current, {
        allowTaint: true, useCORS: true, backgroundColor: "#1e1e1e",
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

  const iamDisplay = useMemo(() => {
      return iam.trim().length > 0 ? iam : "Press 'Edit' button to introduce yourself!";
  }, [iam]);

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.header}>
        <button className={styles.editButton} onClick={startEditingProfile} type="button">
          Edit
        </button>
      </div>

      {/* 프로필 섹션 */}
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
              <button className={styles.iamSaveButton} onClick={saveProfile} type="button">
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

      {/* 카테고리별 목록 */}
      {CATEGORIES.map((category) => {
        const items = getItemsByCategory(category);
        return (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {category}
              <button className={styles.titleEditBtn} onClick={() => setOpenCategory(category)}>
                Edit
              </button>
            </h2>
            <div className={styles.itemGrid}>
              {items.length > 0 ? (
                items.map((item) => (
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
        );
      })}

      <button className={styles.saveButton} type="button" onClick={handleSaveAndCapture}>
        SAVE IMAGE
      </button>

      <footer className={styles.footer}>© 2026 D_MARA. All Rights Reserved.</footer>

      {/* 모달 연동 */}
      {openCategory && (
        <EditCategoryModal
          isOpen={true}
          category={openCategory}
          items={getItemsByCategory(openCategory)}
          onClose={closeCategoryModal}
          onRemove={(id) => removeItem(id)}
          // ★ 핵심: 모달에서 추가하면 fetchItems를 다시 불러서 화면을 새로고침함
          onItemAdded={() => fetchItems()} 
        />
      )}
    </div>
  );
}