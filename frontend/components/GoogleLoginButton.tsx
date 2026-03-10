"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

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
        toast.success("Google login successful!")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.log("Google Login Error:", error)
      toast.error("Google login failed")
    }
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log("Google Login Failed")
          toast.error("Google login failed")
        }}
      />
    </div>
  )
}
