import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "@/assets/header/dmara_logo.png"; // ✅ 임시: 너의 좌측 로고 이미지로 교체해줘

import defaultAvatar from "/vite.svg";
import BACKEND_URL from "@/config";

export default function Header() {
  const navigate = useNavigate();
  // 1. 상태 추가 (이름, 프로필 사진)
  const [username, setUsername] = useState("Guest");
  const [profileImage, setProfileImage] = useState(defaultAvatar);

  // 2. 내 정보 가져오기 (페이지 열릴 때 한 번 실행)
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        // ★ 1순위: Profile 모델에서 내가 수정한 닉네임 가져오기
      const profileRes = await fetch(`${BACKEND_URL}/api/hobbies/profile/me/`, {
        headers: { "Authorization": `Token ${token}` },
      });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          
          // 사용자가 직접 수정한 닉네임이 있다면 그것을 1순위로 사용
          if (profileData.nickname) {
            setUsername(profileData.nickname);
            if (profileData.profile_image) setProfileImage(profileData.profile_image);
            return; // 닉네임을 찾았으므로 종료
          }
        }

        // 2. 만약 Profile에 닉네임이 없다면 (최초 로그인 등), 기본 유저 정보를 가져옵니다.
        const userRes = await fetch(`${BACKEND_URL}/dj-rest-auth/user/`, {
          headers: { "Authorization": `Token ${token}` },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          // 이메일 앞부분을 디폴트로 설정
          const emailPrefix = userData.email?.split("@")[0];
          setUsername(emailPrefix || userData.username || "User");
        }

      } catch (error) {
        console.error("헤더 정보 불러오기 실패:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Left: logo */}
        <div className={styles.left}>
          <img className={styles.logo} src={logo} alt="logo" />
        </div>

        {/* Center: nav */}
        <nav className={styles.nav}>
          <NavLink
            to="/whoami"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            Who am I
          </NavLink>

          <NavLink
            to="/comment"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            Comment
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            Calendar
          </NavLink>

          <NavLink
            to="/neighbor"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            Neighbor
          </NavLink>
        </nav>

        {/* Right: User Profile */}
        <div className={styles.right} onClick={() => navigate("/onboarding")}>
          {/* 3. 프로필 이미지와 이름 연동 */}
          {/* 기존 span 태그 대신 img 태그를 쓰거나, 배경이미지로 설정 */}
          <img 
            src={profileImage} 
            alt="profile" 
            className={styles.avatar} 
            style={{ borderRadius: "50%", objectFit: "cover" }} // 동그랗게 만들기
          />
          <span className={styles.username}>{username}</span>
        </div>
      </div>
    </header>
  );
}
