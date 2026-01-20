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
  musicItems: CategoryItem[];
  movieItems: CategoryItem[];
  talentItems: CategoryItem[];
  sportsItems: CategoryItem[];
  matchesItems: CategoryItem[];
  dramaItems: CategoryItem[];
  showsItems: CategoryItem[];
  isCapturing?: boolean;
};

async function toggleFollow(userId: string, token: string) {
  const res = await fetch(`${BACKEND_URL}/api/users/${userId}/follow/`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${token}` },
  });
  if (!res.ok) throw new Error('Failed to toggle follow');
  return res.json();
}

async function fetchFollowingList(token: string) {
  const res = await fetch(`${BACKEND_URL}/api/users/following/`, {
    headers: { 'Authorization': `Token ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch following list');
  return res.json();
}

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
  isCapturing,
}: WhoAmIDisplayProps) {
  const { userId } = useParams<{ userId: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMyPage, setIsMyPage] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token || !userId) {
      setIsMyPage(true);
      return;
    }

    // Need to get current user's ID to check if this is my page
    fetch(`${BACKEND_URL}/dj-rest-auth/user/`, {
      headers: { "Authorization": `Token ${token}` },
    }).then(res => res.json()).then(data => {
      if (data.pk.toString() === userId) {
        setIsMyPage(true);
      } else {
        setIsMyPage(false);
        // Check follow status only if it's not my page
        fetchFollowingList(token).then(followingList => {
          const isFollowingUser = followingList.some((user: any) => user.id.toString() === userId);
          setIsFollowing(isFollowingUser);
        });
      }
    });
  }, [userId]);
  
  const handleFollow = async () => {
    const token = localStorage.getItem("userToken");
    if (!token || !userId) return;
    try {
      await toggleFollow(userId, token);
      setIsFollowing(prev => !prev);
    } catch (error) {
      console.error("Failed to follow/unfollow user", error);
    }
  };

  const iamDisplay = useMemo(() => {
    return iam.trim().length > 0 ? iam : "";
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
      <section className={`${styles.section} ${styles.profileSection}`}>
        <div className={styles.profileAvatar}>
          <img src={profileImageUrl} alt="Profile" />
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

      {CATEGORIES.map((category) => {
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