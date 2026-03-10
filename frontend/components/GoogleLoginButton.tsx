"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"

export default function GoogleLoginButton() {

  const { login } = useAuth()
  const router = useRouter()

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

        /* refresh UI so Navbar updates */
        router.refresh()

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
