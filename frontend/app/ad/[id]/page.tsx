"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMapPin, 
  FiEye, 
  FiCalendar, 
  FiMessageCircle, 
  FiHeart, 
  FiShare2,
  FiFlag,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

type Ad = {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceType: string;
  category: string;
  condition: string;
  images: string[];
  location: string;
  city: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    city?: string;
    memberSince: string;
    rating?: number;
    totalReviews?: number;
  };
  views: number;
  createdAt: string;
  isActive: boolean;
  isFeatured?: boolean;
};

export default function AdDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [similarAds, setSimilarAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAd();
  }, [id]);

  const loadAd = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads/${id}`);
      const data = await res.json();
      setAd(data.ad);
      setSimilarAds(data.similarAds || []);
      
      // Check if saved
      if (user && token) {
        const savedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads/saved/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const saved = await savedRes.json();
        setIsSaved(saved.some((s: any) => s._id === id));
      }
    } catch (err) {
      console.log("Failed to load ad", err);
      toast.error("Failed to load ad");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !token) {
      toast.error("Please login to save ads");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads/${id}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from saved" : "Added to saved");
      }
    } catch (err) {
      console.log("Failed to save ad", err);
      toast.error("Failed to save ad");
    }
  };

  const handleContact = async () => {
    if (!user || !token) {
      toast.error("Please login to contact seller");
      router.push("/login");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adId: id,
          message: message
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Message sent!");
        router.push(`/chat/${data.conversation._id}`);
      }
    } catch (err) {
      console.log("Failed to send message", err);
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ad Not Found</h1>
          <p className="text-gray-600 mb-4">The ad you're looking for doesn't exist or has been removed</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <FiChevronLeft />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg h-96">
              {ad.images && ad.images.length > 0 ? (
                <img
                  src={ad.images[selectedImage]}
                  alt={ad.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-8xl">📦</span>
                </div>
              )}

              {ad.images && ad.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => (i - 1 + ad.images.length) % ad.images.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => (i + 1) % ad.images.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}

              <button
                onClick={() => setShowGallery(true)}
                className="absolute bottom-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg hover:bg-black/70 transition-colors"
              >
                View Gallery
              </button>
            </div>

            {/* Thumbnails */}
            {ad.images && ad.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {ad.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? "border-secondary scale-105" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Ad Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">{ad.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <FiEye className="mr-1" /> {ad.views} views
                  </span>
                  <span className="flex items-center">
                    <FiCalendar className="mr-1" /> Posted {new Date(ad.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-4xl font-bold text-secondary">
                ₹{ad.price.toLocaleString()}
                {ad.priceType === "negotiable" && (
                  <span className="text-sm font-normal text-gray-500 ml-2">(Negotiable)</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                <div>
                  <span className="text-sm text-gray-500 block">Category</span>
                  <span className="font-semibold">{ad.category}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Condition</span>
                  <span className="font-semibold">{ad.condition || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Location</span>
                  <span className="font-semibold flex items-center">
                    <FiMapPin className="mr-1 text-secondary" /> {ad.location || ad.city}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{ad.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Seller Info & Actions */}
          <div className="space-y-4">
            {/* Seller Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Seller Information</h2>
              
              <Link href={`/user/${ad.user._id}`} className="flex items-center space-x-3 mb-4">
                {ad.user.avatar ? (
                  <img
                    src={ad.user.avatar}
                    alt={ad.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {ad.user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold hover:text-secondary transition-colors">
                    {ad.user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(ad.user.memberSince).toLocaleDateString()}
                  </p>
                </div>
              </Link>

              {/* Fixed: Changed user._id to user.id */}
              {user && user.id !== ad.user._id ? (
                <div className="space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message to the seller..."
                    className="input-field h-24 resize-none"
                  />
                  <button
                    onClick={handleContact}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <FiMessageCircle />
                    <span>Send Message</span>
                  </button>
                </div>
              ) : user && user.id === ad.user._id ? (
                <div className="space-y-3">
                  <Link href={`/edit-ad/${ad._id}`}>
                    <button className="w-full btn-secondary">
                      Edit Ad
                    </button>
                  </Link>
                </div>
              ) : (
                <Link href="/login">
                  <button className="w-full btn-primary">
                    Login to Contact
                  </button>
                </Link>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex justify-between">
              <button
                onClick={handleSave}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaved ? "text-red-500" : "text-gray-600 hover:text-red-500"
                }`}
              >
                <FiHeart className={isSaved ? "fill-current" : ""} />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary rounded-lg transition-colors">
                <FiShare2 />
                <span>Share</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-500 rounded-lg transition-colors">
                <FiFlag />
                <span>Report</span>
              </button>
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Safety Tips</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Meet in a public place</li>
                <li>• Check item before paying</li>
                <li>• Don't share personal info</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Ads */}
        {similarAds.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Similar Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarAds.map((ad, index) => (
                <motion.div
                  key={ad._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdCard ad={ad} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setShowGallery(false)}
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 text-white hover:text-secondary transition-colors"
            >
              <FiX className="w-8 h-8" />
            </button>

            <div className="max-w-5xl mx-auto px-4" onClick={e => e.stopPropagation()}>
              <img
                src={ad.images?.[selectedImage]}
                alt=""
                className="max-h-[80vh] mx-auto"
              />
              
              {ad.images && ad.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => (i - 1 + ad.images.length) % ad.images.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                  >
                    <FiChevronLeft className="text-white w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => (i + 1) % ad.images.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                  >
                    <FiChevronRight className="text-white w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Ad Card for similar listings
function AdCard({ ad }: { ad: Ad }) {
  return (
    <Link href={`/ad/${ad._id}`}>
      <div className="ad-card group">
        <div className="relative h-40 overflow-hidden">
          {ad.images && ad.images.length > 0 ? (
            <img
              src={ad.images[0]}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-3xl">📦</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{ad.title}</h3>
          <p className="text-primary font-bold">₹{ad.price.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}
