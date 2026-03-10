"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiSearch, FiMapPin, FiFilter, FiHeart } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Categories from "../components/Categories";
import LoadingSkeleton from "../components/LoadingSkeleton";
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
    name: string;
    avatar?: string;
  };
  createdAt: string;
  views: number;
  isFeatured?: boolean;
};

export default function HomePage() {
  const { user } = useAuth();
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

  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad", "Ahmedabad"];

  useEffect(() => {
    loadAds();
  }, [selectedCategory, selectedCity, sortBy, page]);

  const loadAds = async () => {
    try {
      setLoading(true);
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads?${params}`);
      const data = await res.json();

      if (page === 1) {
        setAds(data.ads || []);
      } else {
        setAds(prev => [...prev, ...(data.ads || [])]);
      }
      
      setHasMore(data.page < data.totalPages);
    } catch (err) {
      console.log("Failed to load ads", err);
      toast.error("Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAds();
  };

  const handleSaveAd = async (adId: string) => {
    if (!user) {
      toast.error("Please login to save ads");
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads/${adId}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (res.ok) {
        toast.success("Ad saved!");
      }
    } catch (err) {
      console.log("Failed to save ad", err);
    }
  };

  const featuredAds = ads.filter(ad => ad.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-[#002f34] to-[#004d55] text-white py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-5xl font-bold mb-4">
            Rent Anything, Anywhere
          </h1>
          <p className="text-xl mb-8 text-secondary">
            From bikes to cameras, find what you need from people nearby
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-secondary outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-accent text-primary px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all transform hover:scale-105"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-primary mb-8">
          Browse Categories
        </h2>
        <Categories onSelectCategory={setSelectedCategory} />
      </div>

      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-primary font-semibold md:hidden"
          >
            <FiFilter />
            <span>Filters</span>
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} md:flex md:items-center md:space-x-4 mt-4 md:mt-0`}>
            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
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
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            <button
              onClick={() => {
                setSelectedCity("");
                setPriceRange({ min: "", max: "" });
                setSortBy("newest");
                setPage(1);
              }}
              className="text-secondary hover:text-primary transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Featured Ads Section */}
      {featuredAds.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
            <span className="bg-accent w-2 h-8 rounded-full mr-3"></span>
            Featured Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAds.map((ad, index) => (
              <motion.div
                key={ad._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AdCard ad={ad} onSave={() => handleSaveAd(ad._id)} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Ads Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
          <span className="bg-secondary w-2 h-8 rounded-full mr-3"></span>
          Recent Listings
        </h2>

        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ads.map((ad, index) => (
                <motion.div
                  key={ad._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AdCard ad={ad} onSave={() => handleSaveAd(ad._id)} />
                </motion.div>
              ))}
            </div>

            {ads.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No listings found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Ad Card Component
function AdCard({ ad, onSave }: { ad: Ad; onSave: () => void }) {
  const { user } = useAuth();

  return (
    <div className="ad-card group">
      <Link href={`/ad/${ad._id}`}>
        <div className="relative h-48 overflow-hidden">
          {ad.images && ad.images.length > 0 ? (
            <img
              src={ad.images[0]}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
          )}
          {ad.isFeatured && (
            <span className="absolute top-2 left-2 badge badge-featured">
              Featured
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave();
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
          >
            <FiHeart className="text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/ad/${ad._id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-secondary transition-colors">
            {ad.title}
          </h3>
        </Link>
        
        <p className="text-primary font-bold text-xl mb-2">
          ₹{ad.price.toLocaleString()}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <FiMapPin className="mr-1" />
          <span>{ad.location || ad.city}</span>
        </div>

        <div className="flex items-center justify-between">
          <Link href={`/user/${ad.user?.name}`} className="flex items-center space-x-2">
            {ad.user?.avatar ? (
              <img
                src={ad.user.avatar}
                alt={ad.user.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {ad.user?.name?.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-500">
              {ad.user?.name?.split(' ')[0]}
            </span>
          </Link>
          
          <span className="text-xs text-gray-400">
            {new Date(ad.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>{ad.views} views</span>
          <Link href={`/chat/start/${ad._id}`}>
            <button className="text-secondary hover:text-primary transition-colors">
              Chat
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
