import { useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import WhoAmIDisplay from "./WhoAmIDisplay";
import styles from "./WhoAmIDisplay.module.css";
import type { CategoryItem } from "@/shared/types/category";
import viteLogo from "/vite.svg";

export default function WhoAmIPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const username = "Sungm1nk1"; // New: Username for display
  const profileImageUrl = viteLogo; // New: Placeholder profile image
  const iam = "Sungm1nk1님을 한 줄로 소개해주세요.";

  const musicItems: CategoryItem[] = [
    {
      id: 1,
      title: "Dance All Night",
      subtitle: "Rose - BlackPink",
      imageUrl: new URL(
        `/src/assets/items/music1.jpeg`,
        import.meta.url
      ).href,
    },
    {
      id: 2,
      title: "Love Never Felt So Good",
      subtitle: "Michael Jackson",
      imageUrl: new URL(
        `/src/assets/items/music2.jpeg`,
        import.meta.url
      ).href,
    },
    {
      id: 3,
      title: "Versace on the Floor",
      subtitle: "Bruno Mars",
      imageUrl: new URL(
        `/src/assets/items/music3.jpeg`,
        import.meta.url
      ).href,
    },
  ];

  const movieItems: CategoryItem[] = [];
  const talentItems: CategoryItem[] = [];
  const sportsItems: CategoryItem[] = [];
  const matchesItems: CategoryItem[] = [];
  const dramaItems: CategoryItem[] = [];
  const showsItems: CategoryItem[] = [];

  const iamDisplay = useMemo(() => {
    return iam.trim().length > 0 ? iam : "한 줄 소개가 없습니다.";
  }, [iam]);

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
      alert("Something went wrong with the capture.");
    }
  };

  return (
    <div ref={pageRef} className={styles.page}>
      <WhoAmIDisplay
        username={username}
        profileImageUrl={profileImageUrl}
        iam={iamDisplay}
        musicItems={musicItems}
        movieItems={movieItems}
        talentItems={talentItems}
        sportsItems={sportsItems}
        matchesItems={matchesItems}
        dramaItems={dramaItems}
        showsItems={showsItems}
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
