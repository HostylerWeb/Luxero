import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReferralPage() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (code) {
      navigate(`/?ref=${code}`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [code, navigate]);

  return null;
}
