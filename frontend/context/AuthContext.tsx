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

  useEffect(() => {
    // Load user from localStorage on mount
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        
        // Verify token with backend (optional)
        verifyToken(storedToken)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      })

      if (res.ok) {
        const userData = await res.json()
        // Ensure userData has id property (backend might return _id)
        const formattedUser = {
          ...userData,
          id: userData.id || userData._id
        }
        setUser(formattedUser)
        localStorage.setItem("user", JSON.stringify(formattedUser))
      } else {
        // Token invalid
        logout()
      }
    } catch (err) {
      console.log("Token verification failed", err)
      // Don't logout on network errors, just keep the user
    } finally {
      setLoading(false)
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
