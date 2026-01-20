import { useEffect, useState } from "react";
import styles from "./NeighborPage.module.css";
import BACKEND_URL from "@/config";
import FollowerModal from "./components/FollowerModal";

type User = {
  id: number;
  username: string;
  profile_image: string | null;
};

async function fetchFollowing(token: string): Promise<User[]> {
  const res = await fetch(`${BACKEND_URL}/api/users/following/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch following list");
  return res.json();
}

async function fetchFollowers(token: string): Promise<User[]> {
  const res = await fetch(`${BACKEND_URL}/api/users/followers/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch followers list");
  return res.json();
}

export default function NeighborPage() {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalContent, setModalContent] = useState<
    "followers" | "following" | null
  >(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [followingData, followersData] = await Promise.all([
          fetchFollowing(token),
          fetchFollowers(token),
        ]);
        setFollowing(followingData);
        setFollowers(followersData);
      } catch (error) {
        console.error("Failed to load neighbor data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const closeModal = () => {
    setModalContent(null);
  };

  if (isLoading) {
    return <div className={styles.page}>Loading...</div>;
  }

  return (
    <>
      <div className={styles.page}>
        <h1>This is my Realation</h1>
        <div className={styles.statsContainer}>
          <div
            className={styles.stat}
            onClick={() => setModalContent("followers")}
          >
            <span className={styles.count}>{followers.length}</span>
            <span>followers</span>
          </div>
          <div
            className={styles.stat}
            onClick={() => setModalContent("following")}
          >
            <span className={styles.count}>{following.length}</span>
            <span>following</span>
          </div>
        </div>
      </div>

      {modalContent && (
        <FollowerModal
          title={modalContent === "followers" ? "Followers" : "Following"}
          users={modalContent === "followers" ? followers : following}
          onClose={closeModal}
        />
      )}
    </>
  );
}
