import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";

import logo from "@/assets/header/dmara_logo.png"; // ✅ 임시: 너의 좌측 로고 이미지로 교체해줘

type Props = {
  username?: string;
};

export default function Header({ username = "Sungm1nk1" }: Props) {
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

          {/* comentar / calendar는 아직 페이지 없으면 일단 # 처리 */}
          <a className={styles.navItem} href="#">
            Comment
          </a>
          <a className={styles.navItem} href="#">
            Calendar
          </a>
        </nav>

        {/* Right: user */}
        <div className={styles.right}>
          <span className={styles.avatar} />
          <span className={styles.username}>{username}</span>
        </div>
      </div>
    </header>
  );
}
