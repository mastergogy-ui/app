"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useAuth } from "../context/AuthContext"

export default function GoogleLoginButton() {

  const { login } = useAuth()

  const handleSuccess = async (credentialResponse: any) => {

    try {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            credential: credentialResponse.credential
          })
        }
      )

      const data = await res.json()

      if (data.token) {

        login(data.user, data.token)

      }

    } catch (error) {
      console.log("Google Login Error:", error)
    }

  }

  return (
    <div style={{display:"flex",justifyContent:"center",marginTop:"20px"}}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Google Login Failed")}
      />
    </div>
  )
}
