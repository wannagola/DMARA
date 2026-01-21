import { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "@/assets/header/dmara_logo.png";
import defaultAvatar from "/vite.svg";
import BACKEND_URL from "@/config";

type Notification = {
  id: number;
  sender: {
    id: number;
    username: string;
    nickname: string;
    profile_image: string | null;
  };
  notification_type: 'follow' | 'like';
  related_id: number | null;
  is_read: boolean;
  created_at: string;
};

export default function Header() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Guest");
  const [profileImage, setProfileImage] = useState(defaultAvatar);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ✅ [추가] 이미지 URL 처리 헬퍼 함수
  const getImageUrl = (path: string | null) => {
    if (!path) return defaultAvatar;
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  const fetchUserInfo = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    try {
      const profileRes = await fetch(`${BACKEND_URL}/api/hobbies/profile/me/`, {
        headers: { "Authorization": `Token ${token}` },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.nickname) setUsername(profileData.nickname);
        if (profileData.image) setProfileImage(profileData.image);
      }

      const notiRes = await fetch(`${BACKEND_URL}/api/users/notifications/`, {
        headers: { "Authorization": `Token ${token}` },
      });
      if (notiRes.ok) {
        const notiData = await notiRes.json();
        setNotifications(notiData);
      }
    } catch (error) {
      console.error("헤더 정보 불러오기 실패:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
    const handleUpdate = () => fetchUserInfo();
    window.addEventListener("profileUpdated", handleUpdate);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("profileUpdated", handleUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchUserInfo]);

  const handleNotiClick = async (noti: Notification) => {
    const token = localStorage.getItem("userToken");
    if (!noti.is_read && token) {
      await fetch(`${BACKEND_URL}/api/users/notifications/`, {
        method: 'POST',
        headers: { 
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: noti.id })
      });
      setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, is_read: true } : n));
    }
    setIsNotiOpen(false);

    if (noti.notification_type === 'follow') {
      navigate(`/whoami/${noti.sender.id}`);
    } else if (noti.notification_type === 'like' && noti.related_id) {
      navigate(`/comment/${noti.related_id}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <img className={styles.logo} src={logo} alt="logo" />
        </div>

        <nav className={styles.nav}>
          <NavLink to="/whoami" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>Who am I</NavLink>
          <NavLink to="/comment" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>Comment</NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>Calendar</NavLink>
          <NavLink to="/neighbor" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>Neighbor</NavLink>
        </nav>

        <div className={styles.right}>
          <div className={styles.notiWrapper} ref={notiRef} onClick={() => setIsNotiOpen(!isNotiOpen)}>
            <svg className={styles.bellIcon} viewBox="0 0 24 24">
               <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
            {unreadCount > 0 && (
                <div className={styles.badge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                </div>
            )}
            {isNotiOpen && (
                <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.dropdownHeader}>Notifications</div>
                    <div className={styles.notiList}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyNoti}>알림이 없습니다.</div>
                        ) : (
                            notifications.map(noti => (
                                <div 
                                    key={noti.id} 
                                    className={`${styles.notiItem} ${!noti.is_read ? styles.unread : ''}`}
                                    onClick={() => handleNotiClick(noti)}
                                >
                                    {/* ✅ [수정] getImageUrl 함수 적용 */}
                                    <img 
                                        src={getImageUrl(noti.sender.profile_image)} 
                                        alt="" 
                                        className={styles.notiAvatar} 
                                    />
                                    <div className={styles.notiText}>
                                        <strong>{noti.sender.nickname || noti.sender.username}</strong>님이 
                                        {noti.notification_type === 'follow' ? ' 회원님을 팔로우했습니다.' : ' 회원님의 게시물을 좋아합니다.'}
                                        <div className={styles.notiTime}>
                                            {new Date(noti.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
          </div>

          <div className={styles.userProfileBox} onClick={() => navigate("/onboarding")}>
            <img 
              src={profileImage} 
              alt="profile" 
              className={styles.avatar} 
              style={{ borderRadius: "50%", objectFit: "cover" }} 
            />
            <span className={styles.username}>{username}</span>
          </div>

        </div>
      </div>
    </header>
  );
}