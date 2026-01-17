import { useNavigate } from "react-router-dom";

export default function WhoAmIEditPage() {
  const navigate = useNavigate();

  const handleSave = () => {
    navigate("/whoami");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>WhoAmI 등록 / 편집</h1>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
