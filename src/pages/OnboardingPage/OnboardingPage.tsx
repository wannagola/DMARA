import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleSave = () => {
    navigate("/whoami/edit");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>첫 회원가입 후 페이지</h1>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
