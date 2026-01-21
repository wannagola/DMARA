import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserListModal.module.css"; // 기존 CSS 사용
import BACKEND_URL from "@/config";

export type User = {
  id: number;
  username: string;
  display_name: string;
  profile_image: string | null;
  is_following: boolean; // ✅ 백엔드에서 받아옴
};

type Props = {
  title: string;
  users: User[];
  onClose: () => void;
  onRefresh?: () => void;
};

export default function UserListModal({ title, users, onClose, onRefresh }: Props) {
  const navigate = useNavigate();
  const [userList, setUserList] = useState<User[]>(users);

  useEffect(() => {
    setUserList(users);
  }, [users]);

  const handleFollowToggle = async (e: React.MouseEvent, targetUser: User) => {
    e.stopPropagation();
    
    // 1. 확인창 띄우기
    const action = targetUser.is_following ? "언팔로우(Unfollow)" : "팔로우(Follow)";
    if (!window.confirm(`정말 ${targetUser.display_name}님을 ${action} 하시겠습니까?`)) {
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) return;

    // 2. UI 낙관적 업데이트
    setUserList((prev) =>
      prev.map((u) =>
        u.id === targetUser.id ? { ...u, is_following: !u.is_following } : u
      )
    );

    try {
      // 3. 서버 요청
      const res = await fetch(`${BACKEND_URL}/api/users/${targetUser.id}/follow/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) throw new Error("Failed");
      
      if (onRefresh) onRefresh();

    } catch (e) {
      console.error(e);
      // 실패 시 롤백
      setUserList((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, is_following: targetUser.is_following } : u
        )
      );
      alert("요청 처리에 실패했습니다.");
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/whoami/${userId}`);
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.list}>
          {userList.length === 0 ? (
            <div className={styles.empty}>No users found.</div>
          ) : (
            userList.map((user) => (
              <div key={user.id} className={styles.userRow} onClick={() => handleUserClick(user.id)}>
                <div className={styles.userInfo}>
                  <img 
                    src={user.profile_image || "/vite.svg"} 
                    alt={user.display_name} 
                    className={styles.avatar}
                  />
                  <div className={styles.textInfo}>
                    <span className={styles.username}>{user.display_name}</span>
                  </div>
                </div>
                
                {/* ✅ 버튼 상태 분기 처리 */}
                <button 
                  className={`${styles.followBtn} ${user.is_following ? styles.following : ''}`}
                  onClick={(e) => handleFollowToggle(e, user)}
                >
                  {user.is_following ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}