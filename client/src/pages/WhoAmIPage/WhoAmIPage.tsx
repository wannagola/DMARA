import { useNavigate } from "react-router-dom";

export default function WhoAmIPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>WhoAmI 페이지</h1>
      <button onClick={() => navigate("/whoami/edit")}>Edit</button>
    </div>
  );
}
