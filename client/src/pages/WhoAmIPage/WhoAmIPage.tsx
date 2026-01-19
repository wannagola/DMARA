import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import WhoAmIDisplay from "./WhoAmIDisplay";
import styles from "./WhoAmIDisplay.module.css";
import { useProfile } from "@/shared/context/useProfile.ts";
import viteLogo from "/vite.svg"; // Keep for placeholder

export default function WhoAmIPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // --- Get data from global context ---
  const {
    username,
    iam,
    musicItems,
    movieItems,
    talentItems,
    sportsItems,
    matchesItems,
    dramaItems,
    showsItems,
  } = useProfile();

  // The profile image is not in the context yet, so we use a placeholder.
  const profileImageUrl = viteLogo;

  // Effect to run capture after state update
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
          setIsCapturing(false); // Reset state after capture
        });
    }
  }, [isCapturing]);

  // 이미지 캡처 및 공유 기능
  const handleShare = () => {
    if (isCapturing) return; // Prevent multiple captures
    setIsCapturing(true); // Trigger the capture effect
  };

  return (
    <div ref={pageRef} className={styles.page}>
      <WhoAmIDisplay
        username={username}
        profileImageUrl={profileImageUrl}
        iam={iam}
        musicItems={musicItems}
        movieItems={movieItems}
        talentItems={talentItems}
        sportsItems={sportsItems}
        matchesItems={matchesItems}
        dramaItems={dramaItems}
        showsItems={showsItems}
        isCapturing={isCapturing} // Pass state to display component
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
