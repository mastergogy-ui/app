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
  FiTrendingUp,
  FiMapPin,
  FiCalendar
} from "react-icons/fi";
import toast from "react-hot-toast";

type Ad = {
  _id: string;
  title: string;
  price: number;
  images: string[];
  views: number;
  createdAt: string;
  isActive: boolean;
};

type Conversation = {
  _id: string;
  participants: Array<{ _id: string; name: string; avatar?: string }>;
  ad: { _id: string; title: string; images: string[] };
  lastMessage: string;
  lastMessageAt: string;
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-ads");
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [savedAds, setSavedAds] = useState<Ad[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({ totalAds: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboard();
  }, [token]);

  const loadDashboard = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setMyAds(data.myAds || []);
        setSavedAds(data.savedAds || []);
        setConversations(data.conversations || []);
        setUnreadCount(data.unreadCount || 0);
        setStats(data.stats || { totalAds: 0, totalViews: 0 });
      }
    } catch (err) {
      console.log("Failed to load dashboard", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${adId}`, {
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
    } catch (err) {
      console.log("Failed to delete ad", err);
      toast.error("Failed to delete ad");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-[#004d55] text-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-secondary">Manage your listings and messages</p>
            </div>
            <Link href="/post-ad">
              <button className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-all transform hover:scale-105 flex items-center space-x-2">
                <FiPlus />
                <span>Post New Ad</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Ads</p>
                <p className="text-3xl font-bold text-primary">{stats.totalAds}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <FiGrid className="text-secondary w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-primary">{stats.totalViews}</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <FiEye className="text-accent w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unread Messages</p>
                <p className="text-3xl font-bold text-primary">{unreadCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FiMessageCircle className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "my-ads", label: "My Ads", icon: FiGrid },
                { id: "saved", label: "Saved", icon: FiHeart },
                { id: "messages", label: "Messages", icon: FiMessageCircle, badge: unreadCount }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-secondary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* My Ads Tab */}
            {activeTab === "my-ads" && (
              <div className="space-y-4">
                {myAds.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No ads yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start by posting your first ad
                    </p>
                    <Link href="/post-ad">
                      <button className="btn-primary">
                        Post an Ad
                      </button>
                    </Link>
                  </div>
                ) : (
                  myAds.map((ad, index) => (
                    <motion.div
                      key={ad._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4"
                    >
                      <img
                        src={ad.images?.[0] || "/placeholder.svg"}
                        alt={ad.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{ad.title}</h3>
                        <p className="text-secondary font-bold">₹{ad.price.toLocaleString()}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FiEye className="mr-1" /> {ad.views} views
                          </span>
                          <span className="flex items-center">
                            <FiCalendar className="mr-1" /> {new Date(ad.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/edit-ad/${ad._id}`}>
                          <button className="p-2 text-gray-600 hover:text-secondary rounded-lg transition-colors">
                            <FiEdit2 />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteAd(ad._id)}
                          className="p-2 text-gray-600 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Saved Ads Tab */}
            {activeTab === "saved" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedAds.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No saved ads
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Save ads you're interested in
                    </p>
                    <Link href="/">
                      <button className="btn-primary">
                        Browse Ads
                      </button>
                    </Link>
                  </div>
                ) : (
                  savedAds.map((ad) => (
                    <Link key={ad._id} href={`/ad/${ad._id}`}>
                      <div className="ad-card group">
                        <img
                          src={ad.images?.[0] || "/placeholder.svg"}
                          alt={ad.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{ad.title}</h3>
                          <p className="text-primary font-bold">₹{ad.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div className="space-y-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      When someone messages you about your ads, they'll appear here
                    </p>
                  </div>
                ) : (
                  conversations.map((conv, index) => (
                    <Link key={conv._id} href={`/chat/${conv._id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <img
                          src={conv.ad.images?.[0] || "/placeholder.svg"}
                          alt={conv.ad.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{conv.ad.title}</h3>
                            <span className="text-xs text-gray-500">
                              {new Date(conv.lastMessageAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{conv.lastMessage}</p>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
