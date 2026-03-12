"use client"

import "./globals.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import LocationPrompt from "../components/LocationPrompt"
import { Toaster } from "react-hot-toast"
import { useState, useEffect } from "react"

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
            
            {/* REMOVED: Duplicate location badge from here */}
            
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
