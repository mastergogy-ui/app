import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "@/App.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallback from "./pages/AuthCallback";
import CategoryPage from "./pages/CategoryPage";
import AdDetailsPage from "./pages/AdDetailsPage";
import UploadAdPage from "./pages/UploadAdPage";
import DashboardPage from "./pages/DashboardPage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/ad/:adId" element={<AdDetailsPage />} />
      <Route path="/upload" element={<ProtectedRoute><UploadAdPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/chat/:adId/:otherUserId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
    </Routes>
  );
}

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.user) {
      setIsAuthenticated(true);
      setUser(location.state.user);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.log('Auth check failed:', response.status);
          throw new Error('Not authenticated');
        }
        
        const userData = await response.json();
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [location]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
