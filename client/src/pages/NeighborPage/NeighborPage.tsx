import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NeighborPage.module.css";
import BACKEND_URL from "@/config";
// ✅ FollowerModal 대신 UserListModal 사용
import UserListModal, { type User } from "./components/UserListModal"; 
import logo from "@/assets/header/dmara_logo.png";

// API 호출 함수들
async function fetchFollowing(token: string): Promise<User[]> {
  const res = await fetch(`${BACKEND_URL}/api/users/following/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchFollowers(token: string): Promise<User[]> {
  const res = await fetch(`${BACKEND_URL}/api/users/followers/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function searchUsers(token: string, query: string): Promise<User[]> {
  const res = await fetch(`${BACKEND_URL}/api/users/search/?username=${query}`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export default function NeighborPage() {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  const loadData = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    try {
      const [followingData, followersData] = await Promise.all([
        fetchFollowing(token),
        fetchFollowers(token),
      ]);
      setFollowing(followingData);
      setFollowers(followersData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token || !searchQuery.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(token, searchQuery);
        setSearchResults(results);
        setIsDropdownOpen(true);
      } catch (e) { console.error(e); }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserClick = (userId: number) => {
    navigate(`/whoami/${userId}`);
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.searchContainer}>
          <img src={logo} alt="Logo" className={styles.searchLogo} />
          <input 
            type="text" 
            className={styles.searchInput}
            placeholder="Search Friends"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          />
          <button className={styles.searchButton}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none"><path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownList}>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div 
                    key={user.id} 
                    className={styles.dropdownItem}
                    onMouseDown={() => handleUserClick(user.id)}
                  >
                    <img src={user.profile_image || "/vite.svg"} alt={user.display_name} className={styles.dropdownAvatar} />
                    <span className={styles.dropdownUsername}>{user.display_name}</span>
                  </div>
                ))
              ) : (
                <div className={styles.noResult}>No users found.</div>
              )}
            </div>
          )}
        </div>

        <h1 className={styles.title}>This is my Relation</h1>
        
        <div className={styles.statsContainer}>
          <div className={styles.stat} onClick={() => setModalType("followers")}>
            <span className={styles.count}>{followers.length}</span>
            <span>followers</span>
          </div>
          <div className={styles.stat} onClick={() => setModalType("following")}>
            <span className={styles.count}>{following.length}</span>
            <span>following</span>
          </div>
        </div>
      </div>

      {modalType && (
        <UserListModal
          title={modalType === "followers" ? "Followers" : "Following"}
          users={modalType === "followers" ? followers : following}
          onClose={() => setModalType(null)}
          onRefresh={loadData}
        />
      )}
    </>
  );
}