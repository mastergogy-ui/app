"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiBell, FiMessageCircle, FiUser, FiLogOut, FiMapPin } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import LocationModal from "./LocationModal";
import { io, Socket } from "socket.io-client";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [recentLocations, setRecentLocations] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";

  // Connect to socket and load initial unread count
  useEffect(() => {
    if (!token || !user) return;

    // Fetch initial unread count
    fetchUnreadCount();

    // Connect to socket
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Navbar socket connected");
      newSocket.emit("join-user", user.id);
    });

    // Listen for new messages
    newSocket.on("new-message", (data) => {
      console.log("📨 New message received in navbar:", data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    // Listen for unread count updates
    newSocket.on("unread-update", (data) => {
      console.log("🔔 Unread count update:", data);
      setUnreadCount(data.unreadCount);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/unread`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Reset unread count when visiting inbox or chat
  useEffect(() => {
    if (pathname === '/inbox' || pathname.startsWith('/chat/')) {
      setUnreadCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Load user city from localStorage
    const city = localStorage.getItem('user-city');
    if (city) {
      setUserCity(city);
    }

    // Load recent locations
    const saved = localStorage.getItem('recent-locations');
    if (saved) {
      setRecentLocations(JSON.parse(saved).slice(0, 5));
    }

    // Listen for location changes
    const handleLocationChange = (event: CustomEvent) => {
      const { city } = event.detail;
      setUserCity(city);
    };

    window.addEventListener('location-changed', handleLocationChange as EventListener);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('location-changed', handleLocationChange as EventListener);
    };
  }, []);

  const handleLocationSelect = (location: any) => {
    const displayName = location.city || location.state || location.country || location.displayName;
    setUserCity(displayName);
    
    localStorage.setItem('user-city', displayName);
    if (location.lat && location.lon) {
      localStorage.setItem('user-coordinates', JSON.stringify({ 
        lat: location.lat, 
        lon: location.lon 
      }));
    }
    
    localStorage.setItem('user-location', JSON.stringify(location));
    
    const updatedRecent = [location, ...recentLocations.filter(l => l.displayName !== location.displayName)].slice(0, 5);
    setRecentLocations(updatedRecent);
    localStorage.setItem('recent-locations', JSON.stringify(updatedRecent));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('location-changed', { 
        detail: { 
          city: location.city,
          state: location.state,
          country: location.country,
          displayName: displayName,
          lat: location.lat,
          lon: location.lon
        } 
      }));
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg" : "bg-gradient-to-r from-[#002f34] to-[#004d55]"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Location - Left Side */}
            <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
              <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-primary font-bold text-xl">R</span>
                </motion.div>
                <span className={`font-bold text-xl ${
                  scrolled ? "text-primary" : "text-white"
                }`}>
                  RentWala
                </span>
              </Link>

              {/* Location Badge */}
              {userCity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setIsLocationModalOpen(true)}
                  className={`flex items-center space-x-1 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm cursor-pointer transition-all hover:scale-105 ${
                    scrolled 
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                      : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  }`}
                >
                  <FiMapPin className={`w-3 h-3 md:w-4 md:h-4 flex-shrink-0 ${
                    scrolled ? "text-[#23e5db]" : "text-[#23e5db]"
                  }`} />
                  <span className="font-medium">{userCity}</span>
                </motion.div>
              )}
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-all duration-300 hover:scale-105 ${
                    pathname === link.href
                      ? scrolled
                        ? "text-secondary border-b-2 border-secondary"
                        : "text-accent border-b-2 border-accent"
                      : scrolled
                      ? "text-gray-600 hover:text-primary"
                      : "text-white hover:text-accent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side - User menu / Auth with Notification Bell */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notification Bell - Now dynamic */}
                  <Link href="/inbox">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <FiBell className={`w-5 h-5 ${
                        scrolled ? "text-gray-600" : "text-white"
                      }`} />
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-xs text-white flex items-center justify-center px-1"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </motion.button>
                  </Link>

                  <Link href="/inbox">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <FiMessageCircle className={`w-5 h-5 ${
                        scrolled ? "text-gray-600" : "text-white"
                      }`} />
                    </motion.div>
                  </Link>

                  <div className="relative group">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center space-x-2"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-secondary"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                          <span className="text-primary font-bold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className={`font-medium ${
                        scrolled ? "text-gray-600" : "text-white"
                      }`}>
                        {user.name.split(' ')[0]}
                      </span>
                    </motion.button>

                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <FiUser />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>

                  <Link href="/post-ad">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-all shadow-lg"
                    >
                      + SELL
                    </motion.button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        scrolled
                          ? "text-primary hover:bg-gray-100"
                          : "text-white hover:bg-white hover:text-primary"
                      }`}
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-all shadow-lg"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isOpen ? (
                <FiX className={`w-6 h-6 ${scrolled ? "text-primary" : "text-white"}`} />
              ) : (
                <FiMenu className={`w-6 h-6 ${scrolled ? "text-primary" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white shadow-lg"
            >
              <div className="px-4 py-3 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      pathname === link.href
                        ? "bg-secondary/10 text-secondary"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/inbox"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg relative"
                    >
                      Inbox
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/post-ad"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 bg-accent text-primary text-center rounded-lg font-semibold"
                    >
                      + SELL
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 bg-accent text-primary text-center rounded-lg font-semibold"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        recentLocations={recentLocations}
      />
    </>
  );
}
