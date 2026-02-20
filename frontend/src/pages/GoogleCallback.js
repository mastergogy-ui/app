import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function GoogleCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    fetch(`${BACKEND_URL}/api/auth/me`, {
      credentials: "include"
    })
    .then(res => {
      if(res.ok){
        navigate("/dashboard");
      }else{
        navigate("/login");
      }
    })

  }, []);

  return <h2>Logging you in...</h2>;
}

