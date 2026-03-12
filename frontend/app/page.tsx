"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, 
  FiMapPin, 
  FiFilter, 
  FiHeart,
  FiEye,
  FiChevronDown,
  FiX,
  FiNavigation
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

type Ad = {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  location: string;
  city: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  views: number;
  createdAt: string;
  isFeatured?: boolean;
};

const categories = [
  { name: "Cars", icon: "🚗", color: "from-blue-500 to-blue-600" },
  { name: "Properties", icon: "🏠", color: "from-green-500 to-green-600" },
  { name: "Mobiles", icon: "📱", color: "from-purple-500 to-purple-600" },
  { name: "Jobs", icon: "💼", color: "from-orange-500 to-orange-600" },
  { name: "Fashion", icon: "👕", color: "from-pink-500 to-pink-600" },
  { name: "Bikes", icon: "🏍️", color: "from-red-500 to-red-600" },
  { name: "Electronics", icon: "💻", color: "from-indigo-500 to-indigo-600" },
  { name: "Furniture", icon: "🪑", color: "from-yellow-500 to-yellow-600" },
  { name: "Pets", icon: "🐕", color: "from-teal-500 to-teal-600" },
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
  "Pune", "Hyderabad", "Ahmedabad", "Jaipur", "Lucknow"
];

export default function HomePage() {
  const { user, token } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedAds, setSavedAds] = useState<string[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);

  // Load user city from localStorage
  useEffect(() => {
    const city = localStorage.getItem('user-city');
    if (city) {
      setUserCity(city);
      // Auto-select city in filter for better UX
      setSelectedCity(city);
    }
  }, []);

  // Listen for location changes from the LocationPrompt
  useEffect(() => {
    const handleLocationChange = (event: CustomEvent) => {
      const { city } = event.detail;
      setUserCity(city);
      setSelectedCity(city);
      setPage(1); // Reset page when location changes
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('location-changed', handleLocationChange as EventListener);
      return () => window.removeEventListener('location-changed', handleLocationChange as EventListener);
    }
  }, []);

  useEffect(() => {
    loadAds();
    if (token) {
      loadSavedAds();
    }
  }, [selectedCategory, selectedCity, sortBy, page, searchTerm]);

  const loadAds = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedCity && { city: selectedCity }),
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max }),
        ...(searchTerm && { search: searchTerm }),
        sort: sortBy
      });

      console.log("🔍 Loading ads with params:", params.toString());
      
      const res = await fetch(`${API_URL}/api/ads?${params}`);
      const data = await res.json();

      if (page === 1) {
        setAds(data.ads || []);
      } else {
        setAds(prev => [...prev, ...(data.ads || [])]);
      }
      
      setHasMore(data.page < data.totalPages);
    } catch (err) {
      console.error("Failed to load ads", err);
      toast.error("Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAds = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      const res = await fetch(`${API_URL}/api/ads/saved/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSavedAds(data.map((ad: Ad) => ad._id));
    } catch (err) {
      console.error("Failed to load saved ads", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAds();
  };

  const handleSaveAd = async (adId: string) => {
    if (!token) {
      toast.error("Please login to save ads");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      const res = await fetch(`${API_URL}/api/ads/${adId}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        if (savedAds.includes(adId)) {
          setSavedAds(savedAds.filter(id => id !== adId));
          toast.success("Removed from saved");
        } else {
          setSavedAds([...savedAds, adId]);
          toast.success("Added to saved");
        }
      }
    } catch (err) {
      console.error("Failed to save ad", err);
      toast.error("Failed to save ad");
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedCity("");
    setPriceRange({ min: "", max: "" });
    setSortBy("newest");
    setSearchTerm("");
    setPage(1);
  };

  const handleUseMyLocation = () => {
    // Trigger the location prompt
    const prompt = document.getElementById('location-prompt-trigger');
    if (prompt) {
      (prompt as HTMLButtonElement).click();
    } else {
      // Fallback: create and click a hidden button
      const btn = document.createElement('button');
      btn.id = 'temp-location-trigger';
      btn.style.display = 'none';
      document.body.appendChild(btn);
      btn.click();
      setTimeout(() => btn.remove(), 1000);
    }
  };

  const featuredAds = ads.filter(ad => ad.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      
      {/* Hidden trigger for location prompt */}
      <button id="location-prompt-trigger" style={{ display: 'none' }}></button>

      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-[#002f34] via-[#004d55] to-[#006b77] text-white py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto text-center"
        >
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#23e5db]"
          >
            Rent Anything, Anywhere
          </motion.h1>
          <p className="text-xl mb-8 text-[#23e5db]">
            From bikes to cameras, find what you need from people nearby
          </p>
          
          {/* Search Bar with Location Button */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#23e5db] outline-none shadow-lg"
                />
              </div>
              
              {/* Location Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUseMyLocation}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center space-x-2 border border-white/30"
                title="Use my location"
              >
                <FiNavigation className="w-5 h-5" />
                <span className="hidden md:inline">Near Me</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-[#ffce32] text-[#002f34] px-8 py-4 rounded-lg font-semibold hover:bg-[#f8c41c] transition-all duration-300 shadow-lg"
              >
                Search
              </motion.button>
            </div>
          </form>
          
          {/* REMOVED: Duplicate location status section */}
        </motion.div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white mb-8"
        >
          Browse Categories
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => {
                setSelectedCategory(category.name);
                setPage(1);
              }}
              className={`bg-gradient-to-br ${category.color} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl cursor-pointer flex flex-col items-center transition-all duration-300 ${
                selectedCategory === category.name ? "ring-4 ring-white scale-105" : ""
              }`}
            >
              <span className="text-4xl mb-2">{category.icon}</span>
              <span className="font-semibold text-center">{category.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-[#002f34] font-semibold md:hidden"
          >
            <FiFilter className="w-5 h-5" />
            <span>Filters</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} md:flex md:items-center md:flex-wrap gap-4 mt-4 md:mt-0`}>
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#23e5db] outline-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#23e5db] outline-none bg-white"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Price Range */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#23e5db] outline-none"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#23e5db] outline-none"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#23e5db] outline-none bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            {/* Clear Filters */}
            {(selectedCategory || selectedCity || priceRange.min || priceRange.max || sortBy !== "newest") && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearFilters}
                className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
              >
                <FiX className="w-4 h-4" />
                <span>Clear Filters</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Ads Section */}
      {featuredAds.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="bg-[#ffce32] w-1 h-8 rounded-full mr-3"></span>
            Featured Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAds.map((ad, index) => (
              <AdCard 
                key={ad._id} 
                ad={ad} 
                onSave={() => handleSaveAd(ad._id)}
                isSaved={savedAds.includes(ad._id)}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Ads Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="bg-[#23e5db] w-1 h-8 rounded-full mr-3"></span>
          Recent Listings
        </h2>

        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-sm rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {ads.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-2xl"
              >
                <div className="text-8xl mb-6">📦</div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  No listings found
                </h3>
                <p className="text-white/80 text-lg mb-8">
                  Try adjusting your filters or search term
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-[#ffce32] text-[#002f34] px-8 py-3 rounded-lg font-semibold hover:bg-[#f8c41c] transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {ads.map((ad, index) => (
                    <AdCard 
                      key={ad._id} 
                      ad={ad} 
                      onSave={() => handleSaveAd(ad._id)}
                      isSaved={savedAds.includes(ad._id)}
                      index={index}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(p => p + 1)}
                      disabled={loading}
                      className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Loading..." : "Load More"}
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Ad Card Component
function AdCard({ ad, onSave, isSaved, index }: { ad: Ad; onSave: () => void; isSaved: boolean; index: number }) {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/ad/${ad._id}`}>
        <div className="relative h-48 overflow-hidden">
          {ad.images && ad.images.length > 0 ? (
            <img
              src={ad.images[0]}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-5xl">📦</span>
            </div>
          )}
          
          {/* Featured Badge */}
          {ad.isFeatured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#ffce32] to-[#f8c41c] text-[#002f34] px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave();
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <FiHeart className={`w-4 h-4 transition-colors ${
              isSaved ? "fill-red-500 text-red-500" : "text-gray-600"
            }`} />
          </button>

          {/* Price Tag */}
          <div className="absolute bottom-2 left-2 bg-[#002f34]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
            ₹{ad.price.toLocaleString()}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/ad/${ad._id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-[#23e5db] transition-colors">
            {ad.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {ad.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <FiMapPin className="mr-1 flex-shrink-0" />
          <span className="truncate">{ad.location || ad.city}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link href={`/user/${ad.user?._id}`} className="flex items-center space-x-2">
            {ad.user?.avatar ? (
              <img
                src={ad.user.avatar}
                alt={ad.user.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#23e5db] to-[#1fc9c0] flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {ad.user?.name?.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-600">
              {ad.user?.name?.split(' ')[0]}
            </span>
          </Link>
          
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span className="flex items-center">
              <FiEye className="mr-1" /> {ad.views || 0}
            </span>
            <span>
              {new Date(ad.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
