import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        toast.error('No session ID found');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API}/auth/session`, {
          method: 'GET',
          headers: {
            'X-Session-ID': sessionId
          },
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Session creation failed');

        const data = await response.json();
        toast.success('Login successful!');
        navigate('/dashboard', { state: { user: data.user }, replace: true });
      } catch (error) {
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    processSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 animate-pulse">
          <span className="text-white font-bold text-2xl">R</span>
        </div>
        <p className="text-lg text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}