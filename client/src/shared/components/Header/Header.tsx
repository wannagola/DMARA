import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

import logo from "@/assets/header/dmara_logo.png"; // ✅ 임시: 너의 좌측 로고 이미지로 교체해줘

type Props = {
  username?: string;
};

export default function Header({ username = "Sungm1nk1" }: Props) {
  const navigate = useNavigate();
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

        {/* Right: user */}
        <div className={styles.right} onClick={() => navigate("/onboarding")}>
          <span className={styles.avatar} />
          <span className={styles.username}>{username}</span>
        </div>
      </div>
    </header>
  );
}
