"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  unreadCount?: number;
};

export default function InboxPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadConversations();
  }, [token]);

  const loadConversations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      } else {
        toast.error("Failed to load conversations");
      }
    } catch (err) {
      console.log("Failed to load conversations", err);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-[#004d55] text-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">Inbox</h1>
          <p className="text-secondary">Your conversations with buyers and sellers</p>
        </motion.div>

        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {conversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 mb-4">
                When you message someone or receive messages, they'll appear here
              </p>
              <Link href="/">
                <button className="btn-primary">
                  Browse Ads
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv, index) => {
                const otherUser = getOtherParticipant(conv);
                return (
                  <motion.div
                    key={conv._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/chat/${conv._id}`}>
                      <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center space-x-4">
                        
                        {/* Ad Image */}
                        <div className="relative">
                          <img
                            src={conv.ad.images?.[0] || "/placeholder.svg"}
                            alt={conv.ad.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-primary">
                              {conv.ad.title}
                            </h3>
                            <span className="text-xs text-gray-400 flex items-center">
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
                              <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                                <FiUser className="w-3 h-3 text-secondary" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-600">
                              {otherUser?.name}
                            </span>
                          </div>

                          <p className={`text-sm ${
                            conv.lastMessageSender._id !== user?.id && !conv.unreadCount
                              ? "font-semibold text-gray-900"
                              : "text-gray-500"
                          } line-clamp-1`}>
                            {conv.lastMessageSender._id === user?.id ? "You: " : ""}
                            {conv.lastMessage}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-secondary">
                            ₹{conv.ad.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
