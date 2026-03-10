"use client"

import "./globals.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import React from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
