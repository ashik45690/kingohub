import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Back", className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={className}
    >
      <FaArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </button>
  );
}
