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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        })
      })

      const data = await res.json()

      if (data.token) {
        login(data.user, data.token)
        toast.success("Google login successful!")
        router.push("/")
        router.refresh()
      } else {
        toast.error("Google login failed")
      }
    } catch (error) {
      console.error("Google Login Error:", error)
      toast.error("Google login failed")
    }
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.error("Google Login Failed")
          toast.error("Google login failed")
        }}
        theme="filled_black"
        shape="circle"
        text="continue_with"
      />
    </div>
  )
}
