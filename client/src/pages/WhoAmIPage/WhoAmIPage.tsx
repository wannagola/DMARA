import { useState, useEffect, useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import WhoAmIDisplay from "./WhoAmIDisplay";
import styles from "./WhoAmIDisplay.module.css";
import type { CategoryItem } from "@/shared/types/category";
import viteLogo from "/vite.svg";

export default function WhoAmIPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  
  // --- 상태 관리 (DB에서 가져올 데이터들) ---
  const [username, setUsername] = useState("Loading...");
  const [profileImageUrl, setProfileImageUrl] = useState(viteLogo);
  const [iam, setIam] = useState("");
  const [allItems, setAllItems] = useState<CategoryItem[]>([]);

  // 1. 프로필 & 취향 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        // (1) 내 프로필 가져오기 (수정된 부분)
        const profileRes = await fetch("http://127.0.0.1:8000/api/hobbies/profile/me/", {
          headers: { "Authorization": `Token ${token}` },
        });
      
        if (profileRes.ok) {
          const profileData = await profileRes.json();
        
          // 닉네임 우선순위: 수정한 닉네임 -> 없으면 이메일 앞부분
          const displayNick = profileData.nickname || profileData.user_email?.split("@")[0] || "User";
        
          setUsername(displayNick);
          setIam(profileData.bio || "");
          if (profileData.profile_image) {
            setProfileImageUrl(profileData.profile_image);
          }
        } else {
          // 프로필을 가져오지 못했을 경우 기본값 설정
          setUsername("Guest");
        }

        // (2) 내가 추가한 취향 아이템들 가져오기 (기존 로직 유지)
        const itemsRes = await fetch("http://127.0.0.1:8000/api/hobbies/items/my_items/", {
          headers: { "Authorization": `Token ${token}` },
        });
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setAllItems(itemsData);
        }
      } catch (err) {
        console.error("데이터 불러오기 에러:", err);
        setUsername("Error");
      }
    };
    fetchData();
  }, []);

  // --- 화면 표시 로직 ---

  // 한 줄 소개가 비어있을 때 기본 문구
  const iamDisplay = useMemo(() => {
    return iam.trim().length > 0 ? iam : ``;
  }, [iam, username]);

  // 카테고리별 아이템 필터링 헬퍼 함수
  // (백엔드에 저장된 category 문자열과 프론트 상수가 일치해야 함)
  const getItems = (cat: string) => allItems.filter((item) => item.category === cat);

  // 이미지 캡처 및 공유 기능
  const handleShare = async () => {
    if (!pageRef.current) return;
    try {
      const canvas = await html2canvas(pageRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#1e1e1e",
        ignoreElements: (element) => element.classList.contains("ignore-capture"),
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "dmara-share.png";
      link.click();
    } catch (e) {
      console.error(e);
      alert("Capture failed.");
    }
  };

  return (
    <div ref={pageRef} className={styles.page}>
      <WhoAmIDisplay
        username={username}
        profileImageUrl={profileImageUrl}
        iam={iamDisplay}
        // DB 데이터를 카테고리별로 꽂아줍니다
        musicItems={getItems("Music")}
        movieItems={getItems("Movie")}
        talentItems={getItems("Talent")}
        sportsItems={getItems("Sports")}
        matchesItems={getItems("Matches")}
        dramaItems={getItems("Drama & OTT")}
        showsItems={getItems("Shows")}
      />
      
      <button
        className={`${styles.shareButton} ignore-capture`}
        type="button"
        onClick={handleShare}
      >
        공유하기
      </button>
      
      <footer className={styles.footer}>
        © 2026 D_MARA. All Rights Reserved.
      </footer>
    </div>
  );
}