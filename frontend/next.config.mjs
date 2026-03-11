/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better Render compatibility
  output: 'standalone', // Better for Render than 'export'
  
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: 'res.cloudinary.com' 
      },
      { 
        protocol: 'https', 
        hostname: '**.googleusercontent.com' 
      },
      { 
        protocol: 'https', 
        hostname: '**.github.com' 
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development' // Only unoptimize in dev
  },
  
  // Important: This handles client-side routing
  trailingSlash: false,
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://mahalakshmi.onrender.com'
  },
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Enable React strict mode for better development
  reactStrictMode: true,
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features (optional but helpful)
  experimental: {
    optimizeCss: false, // Set to true if you have CSS optimization issues
  }
}

export default nextConfig
