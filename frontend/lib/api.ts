import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com"

console.log("🔧 API Base URL:", BASE_URL); // Debug log

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000, // 15 seconds timeout
  withCredentials: true
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log API calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }
    
    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status}`, response.data)
    }
    return response
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("❌ Response Error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      })

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = "/login"
        }
      }
      
      // Handle 404 Not Found
      if (error.response.status === 404) {
        console.error("API endpoint not found:", error.config?.url)
      }
      
      // Handle HTML response (like our root route)
      if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
        console.error("Received HTML instead of JSON. This might be the root route or a 404 page.")
      }
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error("❌ No Response:", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("❌ Request Setup Error:", error.message)
    }
    
    return Promise.reject(error)
  }
)
