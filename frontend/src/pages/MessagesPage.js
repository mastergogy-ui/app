import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MessagesPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API}/conversations`, { credentials: 'include' });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conv) => {
    navigate(`/chat/${conv.ad_id}/${conv.other_user_id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <Bell size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope' }}>Notifications</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-2">When someone messages you about your ads, you'll see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">Tap on a message to open the chat</p>
            {conversations.map((conv) => (
              <div
                key={`${conv.ad_id}_${conv.other_user_id}`}
                data-testid={`conversation-${conv.ad_id}-${conv.other_user_id}`}
                onClick={() => handleConversationClick(conv)}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {conv.other_user?.picture ? (
                      <img src={conv.other_user.picture} alt={conv.other_user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-xl">{conv.other_user?.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.other_user?.name}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mb-1 font-medium truncate">About: {conv.ad?.title}</p>
                    <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                    {!conv.seen && (
                      <div className="mt-2">
                        <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">New Message</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}