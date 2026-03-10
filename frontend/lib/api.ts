import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000 // 10 seconds timeout
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    
    // Better error message
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      console.error("Received HTML instead of JSON. Backend might be down or URL is wrong.")
    }
    
    return Promise.reject(error)
  }
)
