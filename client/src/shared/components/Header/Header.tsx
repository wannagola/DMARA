import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "@/assets/header/dmara_logo.png"; // ✅ 임시: 너의 좌측 로고 이미지로 교체해줘

import defaultAvatar from "/vite.svg";

export default function Header() {
  const navigate = useNavigate();
  // 1. 상태 추가 (이름, 프로필 사진)
  const [username, setUsername] = useState("Guest");
  const [profileImage, setProfileImage] = useState(defaultAvatar);

  // 2. 내 정보 가져오기 (페이지 열릴 때 한 번 실행)
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("userToken");
      
      // 로그인이 안 되어 있다면 중단
      if (!token) return;

      try {
        const res = await fetch("http://127.0.0.1:8000/dj-rest-auth/user/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // 가져온 이름으로 변경 (없으면 이메일 앞부분)
          setUsername(data.username || data.email?.split("@")[0] || "User");
          
          // 프로필 사진이 있다면 변경
          if (data.profile_image) {
            setProfileImage(data.profile_image);
          }
        }
      } catch (error) {
        console.error("헤더 정보 로딩 실패:", error);
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
