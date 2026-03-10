"use client";

import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginButton() {

  const handleSuccess = async (credentialResponse:any) => {

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
      {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential
        })
      }
    );

    const data = await res.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.reload();
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
    />
  );
}
