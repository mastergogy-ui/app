import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import io from 'socket.io-client';
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ChatPage() {
  const { adId, otherUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [ad, setAd] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    initializeSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [adId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    try {
      const [userRes, messagesRes, adRes] = await Promise.all([
        fetch(`${API}/auth/me`, { credentials: 'include' }),
        fetch(`${API}/messages/${adId}/${otherUserId}`, { credentials: 'include' }),
        fetch(`${API}/ads/${adId}`)
      ]);

      const userData = await userRes.json();
      const messagesData = await messagesRes.json();
      const adData = await adRes.json();

      setUser(userData);
      setMessages(messagesData);
      setAd(adData);
      setOtherUser(adData.owner);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const initializeSocket = () => {
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_chat', {
        ad_id: adId,
        user1: otherUserId,
        user2: user?.user_id
      });
    });

    socketRef.current.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !user) return;

    const messageData = {
      sender_id: user.user_id,
      receiver_id: otherUserId,
      ad_id: adId,
      message: newMessage.trim() || '[Image]',
      image: imagePreview || null,
      timestamp: new Date().toISOString(),
      seen: false
    };

    // Add message to UI immediately (optimistic update)
    setMessages(prev => [...prev, messageData]);

    // Send via Socket.io
    socketRef.current.emit('send_message', messageData);

    // Clear inputs
    setNewMessage('');
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user || !ad) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FAFAFA] flex flex-col">
      <header className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                {otherUser?.picture ? (
                  <img src={otherUser.picture} alt={otherUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">{otherUser?.name[0]}</span>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{otherUser?.name}</h2>
                <p className="text-sm text-gray-500 truncate">{ad.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, index) => {
            const isMe = msg.sender_id === user.user_id;
            return (
              <div
                key={index}
                data-testid={`message-${index}`}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`chat-bubble px-4 py-3 rounded-2xl ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                  }`}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Shared" 
                      className="rounded-lg mb-2 max-w-xs cursor-pointer"
                      onClick={() => window.open(msg.image, '_blank')}
                    />
                  )}
                  {msg.message && msg.message !== '[Image]' && (
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  )}
                  <p className={`text-xs mt-1 ${
                    isMe ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border-2 border-blue-500" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-12 w-12 rounded-full p-0 flex items-center justify-center border-gray-200"
            >
              <ImageIcon size={20} />
            </Button>
            <Input
              data-testid="message-input"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-12 rounded-full bg-gray-50 border-gray-200"
            />
            <Button
              data-testid="send-btn"
              type="submit"
              disabled={!newMessage.trim() && !selectedImage}
              className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 p-0 flex items-center justify-center disabled:opacity-50"
            >
              <Send size={20} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}