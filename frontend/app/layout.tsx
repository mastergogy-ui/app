"use client"

import "./globals.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import LocationPrompt from "../components/LocationPrompt"
import { Toaster } from "react-hot-toast"
import { useState, useEffect } from "react"
import { FiMapPin } from "react-icons/fi"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userLocation, setUserLocation] = useState<{ city?: string; lat?: number; lng?: number }>({});

  // Store location in localStorage and update ads when location changes
  const handleLocationSet = (city: string, lat?: number, lng?: number) => {
    setUserLocation({ city, lat, lng });
    
    // Store in localStorage for persistence
    if (city) {
      localStorage.setItem('user-city', city);
      if (lat && lng) {
        localStorage.setItem('user-coordinates', JSON.stringify({ lat, lng }));
      }
    }
    
    // Trigger a custom event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('location-changed', { 
        detail: { city, lat, lng } 
      }));
    }
  };

  // Load saved location on mount
  useEffect(() => {
    const savedCity = localStorage.getItem('user-city');
    const savedCoords = localStorage.getItem('user-coordinates');
    
    if (savedCity) {
      setUserLocation({ 
        city: savedCity,
        ...(savedCoords ? JSON.parse(savedCoords) : {})
      });
    }
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
        >
          <AuthProvider>
            <Navbar />
            
            {/* Location Prompt - shows automatically for new users */}
            <LocationPrompt onLocationSet={handleLocationSet} />
            
            {/* Location Badge - shows current city if location is set */}
            {userLocation.city && (
              <div className="fixed top-20 left-4 z-40 bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 text-sm flex items-center space-x-2 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                   onClick={() => {
                     // You can add a click handler to change location
                     const prompt = document.getElementById('location-prompt-trigger');
                     if (prompt) (prompt as HTMLButtonElement).click();
                   }}
              >
                <FiMapPin className="text-[#23e5db] group-hover:scale-110 transition-transform" />
                <span className="text-gray-700 font-medium">{userLocation.city}</span>
              </div>
            )}
            
            <main className="min-h-screen">
              {children}
            </main>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '10px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
