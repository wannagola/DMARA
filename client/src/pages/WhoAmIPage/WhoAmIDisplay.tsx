import { useMemo } from "react";
import styles from "./WhoAmIDisplay.module.css"; // Will create this
import type { CategoryItem } from "@/shared/types/category";
import { CATEGORIES } from "@/shared/constants/categories"; // New: extract CATEGORIES to a constant file

type WhoAmIDisplayProps = {
  username: string;
  iam: string;
  profileImageUrl: string;
  musicItems: CategoryItem[];
  movieItems: CategoryItem[];
  talentItems: CategoryItem[];
  sportsItems: CategoryItem[];
  matchesItems: CategoryItem[];
  dramaItems: CategoryItem[];
  showsItems: CategoryItem[];
};

export default function WhoAmIDisplay({
  username,
  iam,
  profileImageUrl,
  musicItems,
  movieItems,
  talentItems,
  sportsItems,
  matchesItems,
  dramaItems,
  showsItems,
}: WhoAmIDisplayProps) {
  const iamDisplay = useMemo(() => {
    return iam.trim().length > 0 ? iam : "한 줄 소개가 없습니다.";
  }, [iam]);

  const getItemsByCategory = (category: string): CategoryItem[] => {
    switch (category) {
      case "Music":
        return musicItems;
      case "Movie":
        return movieItems;
      case "Talent":
        return talentItems;
      case "Sports":
        return sportsItems;
      case "Matches":
        return matchesItems;
      case "Drama & OTT":
        return dramaItems;
      case "Shows":
        return showsItems;
      default:
        return [];
    }
  };

  return (
    <div className={styles.page}>
      {/* Profile Section */}
      <section className={`${styles.section} ${styles.profileSection}`}>
        <div className={styles.profileAvatar}>
          <img src={profileImageUrl} alt="Profile" />
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileUsername}>{username}</h1>
          <p className={styles.profileIntro}>{iamDisplay}</p>
        </div>
      </section>

      {CATEGORIES.map((category) => {
        const items = getItemsByCategory(category);
        return (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>{category}</h2>
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
                <div className={styles.emptyState}>
                  표시할 {category} 아이템이 없습니다.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
