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

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        const profileUrl = userId 
          ? `${BACKEND_URL}/api/users/${userId}/profile/` 
          : `${BACKEND_URL}/api/hobbies/profile/me/`;
        
        const itemsUrl = userId
          ? `${BACKEND_URL}/api/hobbies/user/${userId}/items/`
          : `${BACKEND_URL}/api/hobbies/items/`;

        // (1) 프로필 가져오기
        const profileRes = await fetch(profileUrl, {
          headers: { "Authorization": `Token ${token}` },
        });

        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.nickname) {
            setUsername(pData.nickname);
          } else if (pData.user?.username) { // Fallback for other users
            setUsername(pData.user.username);
          }
          setIam(pData.bio || pData.introduction || "");
          if (pData.profile_image || pData.image) setProfileImageUrl(pData.profile_image || pData.image);
        } else if (!userId) {
             const uRes = await fetch(`${BACKEND_URL}/dj-rest-auth/user/`, {
                headers: { "Authorization": `Token ${token}` },
             });
             if (uRes.ok) {
                 const uData = await uRes.json();
                 setUsername(uData.email?.split("@")[0] || "User");
             }
        }

        // (2) 아이템 목록 가져오기
        const itemsRes = await fetch(itemsUrl, {
          headers: { "Authorization": `Token ${token}` },
        });

        if (itemsRes.ok) {
          const data = await itemsRes.json();
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
  }, [userId]);


  const getItemsByCategory = (categoryName: string) => {
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
    
    return allItems.filter(
      (it) => it.category === targetCode || it.category === categoryName
    );
  };

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

  // Do not show share button when viewing other user's page
  const isMyPage = !userId;

  return (
    <div ref={pageRef} className={styles.page}>
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

      {isMyPage && (
        <button
          className={`${styles.shareButton} ignore-capture`}
          type="button"
          onClick={handleShare}
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
