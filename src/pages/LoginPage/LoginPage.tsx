import styles from "./LoginPage.module.css";

import leftBg from "@/assets/login/login_left.png";
import logoText from "@/assets/login/logo_text.png";
import googleBtn from "@/assets/login/google_btn.png";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // TODO: 나중에 실제 Google OAuth 붙일 곳
    // 지금은 플로우 확인용으로 onboarding으로 이동하게만 해도 됨.
    window.location.href = "/onboarding";
  };

  return (
    <div className={styles.page}>
      {/* 좌측 영역 */}
      <section className={styles.left}>
        <img className={styles.leftBg} src={leftBg} alt="left background" />
      </section>

      {/* 우측 영역 */}
      <section className={styles.right}>
        <div className={styles.rightInner}>
          <div className={styles.content}>
            <img className={styles.logoText} src={logoText} alt="D_MARA" />

            <button
              className={styles.googleButton}
              onClick={handleGoogleLogin}
              type="button"
            >
              <img src={googleBtn} alt="Continue with Google" />
            </button>
          </div>

          <p className={styles.footer}>© 2026 D_MARA. All Rights Reserved.</p>
        </div>
      </section>
    </div>
  );
}
