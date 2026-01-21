import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import WhoAmIDisplay from "./WhoAmIDisplay";
import styles from "./WhoAmIDisplay.module.css";
import viteLogo from "/vite.svg";
import type { CategoryItem } from "@/shared/types/category";
import BACKEND_URL from "@/config";

export default function WhoAmIPage() {
  const { userId } = useParams<{ userId: string }>();
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [username, setUsername] = useState("Loading...");
  const [iam, setIam] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(viteLogo);
  const [allItems, setAllItems] = useState<CategoryItem[]>([]);
  
  const isMyPage = !userId;

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        const profileUrl = isMyPage 
          ? `${BACKEND_URL}/api/hobbies/profile/me/` 
          : `${BACKEND_URL}/api/users/${userId}/profile/`;
        
        const itemsUrl = isMyPage
          ? `${BACKEND_URL}/api/hobbies/items/`
          : `${BACKEND_URL}/api/hobbies/user/${userId}/items/`;

        // 1. 프로필 Fetch
        const profileRes = await fetch(profileUrl, {
          headers: { "Authorization": `Token ${token}` },
        });

        if (profileRes.ok) {
          const pData = await profileRes.json();
          
          const displayName = pData.nickname || pData.username || "Anonymous";
          setUsername(displayName);
          setIam(pData.bio || pData.introduction || "");
          
          let rawImg = pData.profile_image || pData.image;
          if (rawImg) {
             // 1. 완전한 URL로 만들기
             if (!rawImg.startsWith("http")) {
                 rawImg = `${BACKEND_URL}${rawImg}`;
             }
             
             // 2. 🚀 [수정] 내 서버 이미지(nip.io)는 프록시 안 씀 (데드락 방지)
             // 외부 이미지(google, naver 등)일 때만 프록시 사용
             if (rawImg.includes("nip.io") || rawImg.includes("localhost") || rawImg.includes("127.0.0.1")) {
                 setProfileImageUrl(rawImg);
             } else {
                 const proxyUrl = `${BACKEND_URL}/api/users/proxy/image/?url=${encodeURIComponent(rawImg)}`;
                 setProfileImageUrl(proxyUrl);
             }
          } else {
             setProfileImageUrl(viteLogo);
          }
        } else {
            if (isMyPage) {
                const uRes = await fetch(`${BACKEND_URL}/dj-rest-auth/user/`, {
                    headers: { "Authorization": `Token ${token}` },
                });
                if (uRes.ok) {
                    const uData = await uRes.json();
                    setUsername(uData.email?.split("@")[0] || "User");
                }
            } else {
                setUsername("Unknown User");
            }
        }

        // 2. 아이템 목록 Fetch
        const itemsRes = await fetch(itemsUrl, {
          headers: { "Authorization": `Token ${token}` },
        });

        if (itemsRes.ok) {
          const data = await itemsRes.json();
          const formattedItems = data.map((item: any) => {
            // 1. 원본 이미지 URL 확보
            let originalUrl = item.image_url || item.image || "";
            if (originalUrl && !originalUrl.startsWith("http")) {
                originalUrl = `${BACKEND_URL}${originalUrl}`;
            }

            // 2. 🚀 [수정] 조건부 프록시 적용 (데드락 방지)
            let finalUrl = originalUrl;
            
            // 이미지가 있고, 내 서버 주소(nip.io)가 포함되지 않은 '외부 이미지'인 경우에만 프록시 적용
            if (originalUrl && 
                !originalUrl.includes("nip.io") && 
                !originalUrl.includes("localhost") && 
                !originalUrl.includes("127.0.0.1")) {
                finalUrl = `${BACKEND_URL}/api/users/proxy/image/?url=${encodeURIComponent(originalUrl)}`;
            }

            return {
              ...item,
              imageUrl: finalUrl,
            };
          });
          setAllItems(formattedItems);
        }

      } catch (err) {
        console.error("Data Load Error:", err);
        setUsername("Error Loading");
      }
    };

    fetchAllData();
  }, [userId, isMyPage]);

  // ✅ [복구] 누락되었던 함수 정의
  const getItemsByCategory = (categoryName: string) => {
    const BACKEND_CATEGORY_MAP: Record<string, string> = {
        "Music": "MUSIC", "Movie": "MOVIE", "Talent": "ACTOR", 
        "Sports": "SPORTS", "Matches": "MATCH", "Drama & OTT": "DRAMA", 
        "Shows": "EXHIBITION",
    };
    const targetCode = BACKEND_CATEGORY_MAP[categoryName] || categoryName;
    return allItems.filter(
      (it) => it.category === targetCode || it.category === categoryName
    );
  };

  useEffect(() => {
    if (isCapturing && pageRef.current) {
      html2canvas(pageRef.current, {
        useCORS: true,      
        allowTaint: false,  
        scale: 2,           
        backgroundColor: "#1e1e1e",
        ignoreElements: (element) => element.classList.contains("ignore-capture"),
      }).then((canvas) => {
          const image = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = image;
          link.download = "dmara-share.png";
          link.click();
      }).catch(err => {
          console.error("Capture failed:", err);
          alert("이미지 저장 중 오류가 발생했습니다.");
      }).finally(() => setIsCapturing(false));
    }
  }, [isCapturing]);

  return (
    <div ref={pageRef} className={styles.page}>
      <WhoAmIDisplay
        username={username}
        profileImageUrl={profileImageUrl}
        iam={iam}
        isMyPage={isMyPage}  
        musicItems={getItemsByCategory("Music")}
        movieItems={getItemsByCategory("Movie")}
        talentItems={getItemsByCategory("Talent")}
        sportsItems={getItemsByCategory("Sports")}
        dramaItems={getItemsByCategory("Drama & OTT")}
        showsItems={getItemsByCategory("Shows")}
        isCapturing={isCapturing} 
      />

      {isMyPage && (
        <button
          className={`${styles.shareButton} ignore-capture`}
          type="button"
          onClick={() => setIsCapturing(true)}
        >
          Share
        </button>
      )}

      <footer className={styles.footer}>
        © 2026 D_MARA. All Rights Reserved.
      </footer>
    </div>
  );
}