"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  city?: string
  memberSince: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        console.log("Auth loaded from localStorage:", parsedUser.name)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  // Optional: Verify token with backend (don't logout on failure)
  useEffect(() => {
    if (token && user) {
      verifyToken(token)
    }
  }, [token])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com"
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      })

      if (!res.ok) {
        // Token invalid but don't logout automatically
        console.warn("Token verification failed, but keeping user logged in")
      }
    } catch (err) {
      console.error("Token verification error:", err)
      // Don't logout on network errors
    }
  }

  const login = (userData: any, newToken: string) => {
    // Ensure user has id property (backend might return _id)
    const formattedUser = {
      ...userData,
      id: userData.id || userData._id
    }
    
    setUser(formattedUser)
    setToken(newToken)
    
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(formattedUser))
    
    toast.success(`Welcome, ${formattedUser.name}!`)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    toast.success("Logged out successfully")
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user && !!token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}
