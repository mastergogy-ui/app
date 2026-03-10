"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSend, 
  FiArrowLeft, 
  FiUser, 
  FiMoreVertical,
  FiCheck,
  FiCheckCheck
} from "react-icons/fi";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

type Message = {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
  readBy: string[];
};

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
    user: string;
  };
};

export default function ChatPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    
    loadConversation();
    
    // Connect to socket
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-user", user?.id);
    });

    newSocket.on("new-message", (data) => {
      if (data.conversationId === id) {
        setMessages(prev => [...prev, data.message]);
        markAsRead();
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages);
        markAsRead();
      } else {
        toast.error("Failed to load conversation");
        router.push("/inbox");
      }
    } catch (err) {
      console.log("Failed to load conversation", err);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.log("Failed to mark as read", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: id,
          text: messageText
        })
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.log("Failed to send message", err);
      toast.error("Failed to send message");
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherParticipant = () => {
    if (!conversation || !user) return null;
    return conversation.participants.find(p => p._id !== user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Conversation Not Found</h1>
          <p className="text-gray-600 mb-4">The conversation you're looking for doesn't exist</p>
          <Link href="/inbox" className="btn-primary">
            Go to Inbox
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>

          <Link href={`/ad/${conversation.ad._id}`} className="flex items-center space-x-3">
            <img
              src={conversation.ad.images?.[0] || "/placeholder.svg"}
              alt={conversation.ad.title}
              className="w-10 h-10 object-cover rounded-lg"
            />
            <div>
              <h2 className="font-semibold text-primary">{conversation.ad.title}</h2>
              <p className="text-sm text-secondary font-bold">₹{conversation.ad.price.toLocaleString()}</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/user/${otherUser?._id}`} className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            {otherUser?.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                <FiUser className="w-3 h-3 text-secondary" />
              </div>
            )}
            <span className="text-sm font-medium">{otherUser?.name}</span>
          </Link>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiMoreVertical />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isOwn = msg.sender._id === user?.id;
            
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {msg.sender.avatar ? (
                        <img
                          src={msg.sender.avatar}
                          alt={msg.sender.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-secondary" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`space-y-1 ${isOwn ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? "bg-gradient-to-r from-primary to-[#004d55] text-white rounded-br-none"
                          : "bg-white shadow-sm rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    
                    <div className={`flex items-center space-x-1 text-xs text-gray-400 ${isOwn ? "justify-end" : "justify-start"}`}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      {isOwn && (
                        <span>
                          {msg.readBy.length > 1 ? (
                            <FiCheckCheck className="text-secondary" />
                          ) : (
                            <FiCheck />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input-field"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-6"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
}
