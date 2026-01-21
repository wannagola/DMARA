import { useMemo, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import styles from "./WhoAmIDisplay.module.css";
import type { CategoryItem } from "@/shared/types/category";
import { CATEGORIES } from "@/shared/constants/categories";
import BACKEND_URL from "@/config";

type WhoAmIDisplayProps = {
  username: string;
  iam: string;
  profileImageUrl: string;
  isMyPage: boolean;
  musicItems: CategoryItem[];
  movieItems: CategoryItem[];
  talentItems: CategoryItem[];
  sportsItems: CategoryItem[];
  dramaItems: CategoryItem[];
  showsItems: CategoryItem[];
  isCapturing?: boolean;
};

async function fetchFollowingList(token: string) {
  const res = await fetch(`${BACKEND_URL}/api/users/following/`, {
    headers: { 'Authorization': `Token ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch following list');
  return res.json();
}

async function toggleFollow(userId: string, token: string) {
  const res = await fetch(`${BACKEND_URL}/api/users/${userId}/follow/`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${token}` },
  });
  if (!res.ok) throw new Error('Failed to toggle follow');
  return res.json();
}

export default function WhoAmIDisplay({
  username,
  iam,
  profileImageUrl,
  isMyPage,
  musicItems,
  movieItems,
  talentItems,
  sportsItems,
  dramaItems,
  showsItems,
  isCapturing,
}: WhoAmIDisplayProps) {
  const { userId } = useParams<{ userId: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token || isMyPage || !userId) return;

    fetchFollowingList(token).then(followingList => {
      const isFollowingUser = followingList.some((user: any) => user.id.toString() === userId);
      setIsFollowing(isFollowingUser);
    }).catch(err => console.error(err));
  }, [userId, isMyPage]);
  
  const handleFollow = async () => {
    const token = localStorage.getItem("userToken");
    if (!token || !userId) return;

    const action = isFollowing ? "언팔로우(Unfollow)" : "팔로우(Follow)";
    if (!window.confirm(`정말 ${action} 하시겠습니까?`)) {
      return;
    }

    try {
      await toggleFollow(userId, token);
      setIsFollowing(prev => !prev);
    } catch (error) {
      console.error("Failed to follow/unfollow user", error);
    }
  };

  const iamDisplay = useMemo(() => {
    return iam && iam.trim().length > 0 ? iam : "";
  }, [iam]);

  const getItemsByCategory = (category: string): CategoryItem[] => {
    switch (category) {
      case "Music": return musicItems;
      case "Movie": return movieItems;
      case "Talent": return talentItems;
      case "Sports": return sportsItems;
      case "Drama & OTT": return dramaItems;
      case "Shows": return showsItems;
      default: return [];
    }
  };

  return (
    <div className={styles.page}>
      <section className={`${styles.section} ${styles.profileSection}`}>
        <div className={styles.profileAvatar}>
          {/* ✅ [추가] crossOrigin="anonymous" 속성 추가 */}
          <img 
            src={profileImageUrl} 
            alt="Profile" 
            crossOrigin="anonymous" 
          />
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileUsername}>{username}</h1>
          {iamDisplay && <p className={styles.profileIntro}>{iamDisplay}</p>}
          
          {!isMyPage && (
            <button onClick={handleFollow} className={styles.followButton}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </section>

      {CATEGORIES.filter(category => category !== "Matches").map((category) => {
        const items = getItemsByCategory(category);
        return (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>{category}</h2>
            <div className={styles.itemGrid}>
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={styles.itemCard}
                    data-is-capturing={isCapturing}
                  >
                    {/* ✅ [추가] crossOrigin="anonymous" 속성 추가 */}
                    <img
                      className={styles.thumb}
                      src={item.imageUrl}
                      alt={item.title}
                      crossOrigin="anonymous"
                    />
                    <div className={styles.info}>
                      <div className={styles.title}>{item.title}</div>
                      <div className={styles.subtitle}>{item.subtitle}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  Empty
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}