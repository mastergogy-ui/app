import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/auth/me`, {
      method: "GET",
      credentials: "include"
    })
      .then(res => {
        if (res.ok) {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  return <div>Logging you in...</div>;
}
