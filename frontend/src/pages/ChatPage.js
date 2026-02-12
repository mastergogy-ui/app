import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Image as ImageIcon, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import socketService from "@/services/socketService";
import { useAuth } from "@/contexts/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ChatPage() {
  const { adId, otherUserId } = useParams();
  const navigate = useNavigate();
  const { gogoPoints, refreshPoints, updatePoints } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [ad, setAd] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsToSend, setPointsToSend] = useState('');
  const [sendingPoints, setSendingPoints] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Format large numbers
  const formatPoints = (points) => {
    if (points >= 1000000000) return `${(points / 1000000000).toFixed(1)}B`;
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toString();
  };

  useEffect(() => {
    fetchData();
    setupSocketListeners();
    
    return () => {
      // Leave chat room when component unmounts
      socketService.leaveChat(adId);
      // Clean up listeners
      socketService.offNewMessage();
      socketService.offMessagesSeen();
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

  const setupSocketListeners = () => {
    if (!user) return;

    // Join chat room
    socketService.joinChat(adId, user.user_id, otherUserId);

    // Listen for new messages
    socketService.onNewMessage((message) => {
      console.log('Chat received new message:', message);
      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.some(m => 
          m.message_id === message.message_id ||
          (m.sender_id === message.sender_id && 
           m.timestamp === message.timestamp &&
           m.message === message.message)
        );
        if (exists) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Listen for messages seen
    socketService.onMessagesSeen((data) => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.ad_id === data.ad_id && 
          msg.sender_id === user?.user_id &&
          msg.receiver_id === data.receiver_id
            ? { ...msg, seen: true } 
            : msg
        )
      );
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

    // Send via HTTP API (more reliable than WebSocket)
    try {
      await fetch(`${API}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });
    } catch (error) {
      console.error('Failed to send message via HTTP:', error);
    }

    // Also try Socket.io as backup
    socketService.sendMessage(messageData);

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

  const handleSendPoints = async () => {
    const amount = parseInt(pointsToSend);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > gogoPoints) {
      toast.error(`Insufficient points. You have ${formatPoints(gogoPoints)} points.`);
      return;
    }

    setSendingPoints(true);
    try {
      const response = await fetch(`${API}/user/transfer-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to_user_id: otherUserId,
          amount: amount,
          ad_id: adId
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`Successfully sent ${formatPoints(amount)} Gogo Points!`);
        updatePoints(data.new_balance);
        setShowPointsModal(false);
        setPointsToSend('');
        
        // Send a message about the points transfer
        const messageData = {
          sender_id: user.user_id,
          receiver_id: otherUserId,
          ad_id: adId,
          message: `🎁 Sent ${formatPoints(amount)} Gogo Points!`,
          image: null,
          timestamp: new Date().toISOString(),
          seen: false
        };
        setMessages(prev => [...prev, messageData]);
        socketService.sendMessage(messageData);
      } else {
        toast.error(data.detail || 'Failed to send points');
      }
    } catch (error) {
      toast.error('Failed to send points');
    } finally {
      setSendingPoints(false);
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
            {/* Send Points Button */}
            <Button
              data-testid="send-points-btn"
              onClick={() => setShowPointsModal(true)}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-full px-4 py-2 flex items-center gap-2"
            >
              <Coins size={18} />
              <span className="hidden sm:inline">Send Points</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Send Points Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Send Gogo Points</h3>
              <button
                onClick={() => setShowPointsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-4 mb-4">
              <p className="text-white/80 text-sm">Your Balance</p>
              <p className="text-white text-2xl font-bold">{formatPoints(gogoPoints)} points</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send to: {otherUser?.name}
              </label>
              <Input
                data-testid="points-amount-input"
                type="number"
                min="1"
                max={gogoPoints}
                value={pointsToSend}
                onChange={(e) => setPointsToSend(e.target.value)}
                placeholder="Enter amount"
                className="h-12 rounded-lg"
              />
            </div>
            
            <div className="flex gap-2 mb-4">
              {[10, 50, 100, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setPointsToSend(amount.toString())}
                  className="flex-1 py-2 px-3 rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-sm font-medium transition-colors"
                >
                  {amount}
                </button>
              ))}
            </div>
            
            <Button
              data-testid="confirm-send-points-btn"
              onClick={handleSendPoints}
              disabled={sendingPoints || !pointsToSend}
              className="w-full h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold"
            >
              {sendingPoints ? 'Sending...' : `Send ${pointsToSend || '0'} Points`}
            </Button>
          </div>
        </div>
      )}

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
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    isMe ? 'text-blue-100 justify-end' : 'text-gray-400'
                  }`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      <span className="ml-1">
                        {msg.seen ? (
                          <svg className="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" transform="translate(3, 0)"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
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