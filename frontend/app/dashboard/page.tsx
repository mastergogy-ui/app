"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FiGrid, 
  FiHeart, 
  FiMessageCircle, 
  FiEye, 
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiCalendar,
  FiDollarSign
} from "react-icons/fi";
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
  views: number;
  createdAt: string;
  isActive: boolean;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
};

type Conversation = {
  _id: string;
  participants: Array<{ _id: string; name: string; avatar?: string }>;
  ad: { _id: string; title: string; images: string[]; price: number };
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSender: { _id: string; name: string };
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-ads");
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [savedAds, setSavedAds] = useState<Ad[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAds: 0,
    totalViews: 0,
    totalMessages: 0
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      
      // Load user's ads
      const adsRes = await fetch(`${API_URL}/api/ads/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setMyAds(adsData);
        setStats(prev => ({
          ...prev,
          totalAds: adsData.length,
          totalViews: adsData.reduce((sum: number, ad: Ad) => sum + (ad.views || 0), 0)
        }));
      }

      // Load conversations
      const chatRes = await fetch(`${API_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setConversations(chatData);
        setStats(prev => ({
          ...prev,
          totalMessages: chatData.length
        }));
      }

      // Load saved ads
      const savedRes = await fetch(`${API_URL}/api/ads/saved/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedAds(savedData);
      }

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      
      const res = await fetch(`${API_URL}/api/ads/${adId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Ad deleted successfully");
        setMyAds(myAds.filter(ad => ad._id !== adId));
      } else {
        toast.error("Failed to delete ad");
      }
    } catch (error) {
      console.error("Delete ad error:", error);
      toast.error("Failed to delete ad");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600">
                Manage your listings and messages from your dashboard
              </p>
            </div>
            <Link href="/post-ad">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#002f34] to-[#004d55] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <FiPlus className="w-5 h-5" />
                <span>Post New Ad</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Ads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAds}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiGrid className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiEye className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Messages</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiMessageCircle className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("my-ads")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === "my-ads"
                    ? "border-[#23e5db] text-[#002f34]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiGrid className="w-4 h-4" />
                <span>My Ads ({myAds.length})</span>
              </button>
              
              <button
                onClick={() => setActiveTab("saved")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === "saved"
                    ? "border-[#23e5db] text-[#002f34]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiHeart className="w-4 h-4" />
                <span>Saved ({savedAds.length})</span>
              </button>
              
              <button
                onClick={() => setActiveTab("messages")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === "messages"
                    ? "border-[#23e5db] text-[#002f34]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiMessageCircle className="w-4 h-4" />
                <span>Messages ({conversations.length})</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* My Ads Tab */}
            {activeTab === "my-ads" && (
              <div>
                {myAds.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No ads yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start by posting your first ad
                    </p>
                    <Link href="/post-ad">
                      <button className="bg-gradient-to-r from-[#002f34] to-[#004d55] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300">
                        Post an Ad
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myAds.map((ad, index) => (
                      <motion.div
                        key={ad._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:shadow-lg transition-shadow"
                      >
                        {/* Ad Image */}
                        <Link href={`/ad/${ad._id}`} className="md:w-32 h-32 flex-shrink-0">
                          <img
                            src={ad.images?.[0] || "/placeholder.svg"}
                            alt={ad.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </Link>

                        {/* Ad Details */}
                        <div className="flex-1">
                          <Link href={`/ad/${ad._id}`}>
                            <h3 className="font-semibold text-lg text-gray-900 hover:text-[#23e5db] transition-colors">
                              {ad.title}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <FiDollarSign className="mr-1 text-[#23e5db]" />
                              ₹{ad.price.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <FiEye className="mr-1" /> {ad.views || 0} views
                            </span>
                            <span className="flex items-center">
                              <FiCalendar className="mr-1" /> 
                              {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <FiMapPin className="text-gray-400" />
                            <span className="text-sm text-gray-600">{ad.location}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex md:flex-col justify-end gap-2">
                          <Link href={`/edit-ad/${ad._id}`}>
                            <button className="p-2 text-gray-600 hover:text-[#23e5db] rounded-lg transition-colors">
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteAd(ad._id)}
                            className="p-2 text-gray-600 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Ads Tab */}
            {activeTab === "saved" && (
              <div>
                {savedAds.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No saved ads
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Save ads you're interested in
                    </p>
                    <Link href="/">
                      <button className="bg-gradient-to-r from-[#002f34] to-[#004d55] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300">
                        Browse Ads
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedAds.map((ad) => (
                      <Link key={ad._id} href={`/ad/${ad._id}`}>
                        <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                          <div className="h-40 overflow-hidden">
                            <img
                              src={ad.images?.[0] || "/placeholder.svg"}
                              alt={ad.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {ad.title}
                            </h3>
                            <p className="text-[#23e5db] font-bold">₹{ad.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mt-1">{ad.location}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div>
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-600">
                      When someone messages you about your ads, they'll appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conv, index) => {
                      const otherUser = conv.participants.find(p => p._id !== user?.id);
                      return (
                        <Link key={conv._id} href={`/chat/${conv._id}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            {/* Ad Image */}
                            <img
                              src={conv.ad.images?.[0] || "/placeholder.svg"}
                              alt={conv.ad.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />

                            {/* Message Info */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  {conv.ad.title}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-1">
                                {otherUser?.avatar ? (
                                  <img
                                    src={otherUser.avatar}
                                    alt={otherUser.name}
                                    className="w-5 h-5 rounded-full"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-[#23e5db] flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">
                                      {otherUser?.name?.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-700">
                                  {otherUser?.name}
                                </span>
                              </div>

                              <p className="text-sm text-gray-600 line-clamp-1">
                                {conv.lastMessageSender._id === user?.id ? "You: " : ""}
                                {conv.lastMessage}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="font-bold text-[#23e5db]">
                                ₹{conv.ad.price.toLocaleString()}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
