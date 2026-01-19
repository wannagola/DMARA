// client/src/pages/LoginPage.tsx

// ★ 여기 있던 중복된 import 구문들을 하나로 합쳤습니다.
import { useGoogleLogin } from '@react-oauth/google'; 
import { useNavigate } from 'react-router-dom';       
import styles from "./LoginPage.module.css";

// 이미지 import
import leftBg from "@/assets/login/login_left.png";
import logoText from "@/assets/login/logo_text.png";
import googleBtn from "@/assets/login/google_btn.png";

export default function LoginPage() {
  const navigate = useNavigate();

  // 구글 로그인 로직
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("구글 인증 성공, 토큰:", tokenResponse.access_token);

      try {
        // (1) 구글에서 받은 토큰을 백엔드(Django)로 전송
        const response = await fetch("http://127.0.0.1:8000/api/hobbies/google/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token, 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // (2) 로그인 성공! 토큰 저장 및 이동
          // dj-rest-auth는 보통 'key'로 줍니다. 혹시 access_token으로 오면 그걸로 저장합니다.
          localStorage.setItem("userToken", data.key || data.access_token);
          
          console.log("로그인 완료:", data);
          navigate("/whoami");
        } else {
          console.error("서버 로그인 실패:", data);
          alert("로그인 처리에 실패했습니다.");
        }
      } catch (error) {
        console.error("통신 에러:", error);
        alert("서버와 연결할 수 없습니다.");
      }
    },
    onError: () => {
      console.error("구글 로그인 실패");
    },
  });

  return (
    <div className={styles.page}>
      <section className={styles.left}>
        <img className={styles.leftBg} src={leftBg} alt="left background" />
      </section>

      <section className={styles.right}>
        <div className={styles.rightInner}>
          <img className={styles.logoText} src={logoText} alt="D_MARA" />

          {/* 버튼 클릭 시 구글 로그인 실행 */}
          <button
            className={styles.googleButton}
            onClick={() => handleGoogleLogin()} 
            type="button"
          >
            <img src={googleBtn} alt="Continue with Google" />
          </button>

          <p className={styles.footer}>© 2026 D_MARA. All Rights Reserved.</p>
        </div>
      </section>
    </div>
  );
}
