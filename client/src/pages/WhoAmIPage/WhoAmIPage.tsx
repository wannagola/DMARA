import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import WhoAmIDisplay from "./WhoAmIDisplay";
import styles from "./WhoAmIDisplay.module.css";
import viteLogo from "/vite.svg";
import type { CategoryItem } from "@/shared/types/category";
import BACKEND_URL from "@/config";

export default function WhoAmIPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // --- 상태 관리 (DB 데이터) ---
  const [username, setUsername] = useState("Loading...");
  const [iam, setIam] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(viteLogo);
  const [allItems, setAllItems] = useState<CategoryItem[]>([]);

  // --- 1. 데이터 불러오기 (프로필 & 아이템) ---
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        // (1) 프로필 가져오기
        const profileRes = await fetch(`${BACKEND_URL}/api/hobbies/profile/me/`, {
          headers: { "Authorization": `Token ${token}` },
        });

        if (profileRes.ok) {
          const pData = await profileRes.json();
          // 닉네임
          if (pData.nickname) {
            setUsername(pData.nickname);
          } else {
             // 닉네임 없으면 기본 유저 정보 조회
             const uRes = await fetch(`${BACKEND_URL}/dj-rest-auth/user/`, {
                headers: { "Authorization": `Token ${token}` },
             });
             if (uRes.ok) {
                 const uData = await uRes.json();
                 setUsername(uData.email?.split("@")[0] || "User");
             }
          }
          // 소개글 & 프로필 이미지
          setIam(pData.bio || "");
          if (pData.profile_image) setProfileImageUrl(pData.profile_image);
        }

        // (2) 아이템 목록 가져오기
        const itemsRes = await fetch(`${BACKEND_URL}/api/hobbies/items/`, {
          headers: { "Authorization": `Token ${token}` },
        });

        if (itemsRes.ok) {
          const data = await itemsRes.json();
          // 백엔드 데이터(image_url)를 프론트엔드 형식(imageUrl)으로 변환
          const formattedItems = data.map((item: any) => ({
            ...item,
            imageUrl: item.image_url || item.image || "",
          }));
          setAllItems(formattedItems);
        }

      } catch (err) {
        console.error("Data Load Error:", err);
      }
    };

    fetchAllData();
  }, []);


  // --- 2. 카테고리별 필터링 헬퍼 ---
  const getItemsByCategory = (categoryName: string) => {
    // 백엔드 코드 매핑 (OnboardingPage와 동일하게 맞춤)
    const BACKEND_CATEGORY_MAP: Record<string, string> = {
        "Music": "MUSIC",
        "Movie": "MOVIE",
        "Talent": "ACTOR", 
        "Sports": "SPORTS",
        "Matches": "MATCH",
        "Drama & OTT": "DRAMA",
        "Shows": "EXHIBITION",
    };
    
    const targetCode = BACKEND_CATEGORY_MAP[categoryName] || categoryName;
    
    // DB 코드로 저장된 것(MUSIC)과 프론트 이름(Music) 둘 다 확인
    return allItems.filter(
      (it) => it.category === targetCode || it.category === categoryName
    );
  };

  // --- 3. 캡처 및 공유 기능 ---
  useEffect(() => {
    if (isCapturing) {
      const elementToCapture = pageRef.current;
      if (!elementToCapture) {
        setIsCapturing(false);
        return;
      }

      html2canvas(elementToCapture, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#1e1e1e",
        ignoreElements: (element) =>
          element.classList.contains("ignore-capture"),
      })
        .then((canvas) => {
          const image = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = image;
          link.download = "dmara-share.png";
          link.click();
        })
        .catch((e) => {
          console.error(e);
          alert("Capture failed.");
        })
        .finally(() => {
          setIsCapturing(false);
        });
    }
  }, [isCapturing]);

  const handleShare = () => {
    if (isCapturing) return;
    setIsCapturing(true);
  };

  return (
    <div ref={pageRef} className={styles.page}>
      {/* DB에서 가져온 데이터를 카테고리별로 나눠서 전달 */}
      <WhoAmIDisplay
        username={username}
        profileImageUrl={profileImageUrl}
        iam={iam}
        musicItems={getItemsByCategory("Music")}
        movieItems={getItemsByCategory("Movie")}
        talentItems={getItemsByCategory("Talent")}
        sportsItems={getItemsByCategory("Sports")}
        matchesItems={getItemsByCategory("Matches")}
        dramaItems={getItemsByCategory("Drama & OTT")}
        showsItems={getItemsByCategory("Shows")}
        isCapturing={isCapturing} 
      />

      <button
        className={`${styles.shareButton} ignore-capture`}
        type="button"
        onClick={handleShare}
      >
        Share
      </button>

      <footer className={styles.footer}>
        © 2026 D_MARA. All Rights Reserved.
      </footer>
    </div>
  );
}