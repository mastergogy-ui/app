"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FiMessageCircle, FiUser, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";

type Conversation = {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  ad: {
    _id: string;
    title: string;
    images: string[];
    price: number;
  };
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSender: {
    _id: string;
    name: string;
  };
};

export default function InboxPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      
      // ✅ CORRECT ENDPOINT: /api/chat/conversations (NOT /api/messages/conversations)
      const url = `${API_URL}/api/chat/conversations`;
      console.log("🔍 Fetching conversations from:", url);
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Conversations loaded:", data);
      setConversations(data);
    } catch (err) {
      console.error("❌ Failed to load conversations:", err);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p._id !== user?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inbox</h1>
          <p className="text-gray-600">Your conversations with buyers and sellers</p>
        </motion.div>

        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden"
        >
          {conversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-600 mb-6">
                When you message someone or receive messages, they'll appear here
              </p>
              <Link href="/">
                <button className="bg-gradient-to-r from-[#002f34] to-[#004d55] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#004d55] hover:to-[#006b77] transition-all duration-300">
                  Browse Ads
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv, index) => {
                const otherUser = getOtherParticipant(conv);
                return (
                  <Link key={conv._id} href={`/chat/${conv._id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center space-x-4"
                    >
                      {/* Ad Image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={conv.ad.images?.[0] || "/placeholder.svg"}
                          alt={conv.ad.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conv.ad.title}
                          </h3>
                          <span className="text-xs text-gray-500 flex items-center flex-shrink-0 ml-2">
                            <FiClock className="mr-1" />
                            {new Date(conv.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-1">
                          {otherUser?.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser.name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#23e5db] to-[#1fc9c0] flex items-center justify-center">
                              <FiUser className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {otherUser?.name}
                          </span>
                        </div>

                        <p className={`text-sm truncate ${
                          conv.lastMessageSender._id !== user?.id
                            ? "font-semibold text-gray-900"
                            : "text-gray-500"
                        }`}>
                          {conv.lastMessageSender._id === user?.id ? "You: " : ""}
                          {conv.lastMessage}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0 ml-2">
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
        </motion.div>
      </div>
    </div>
  );
}
