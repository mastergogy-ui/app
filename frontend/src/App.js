import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "@/App.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import CategoryPage from "./pages/CategoryPage";
import AdDetailsPage from "./pages/AdDetailsPage";
import UploadAdPage from "./pages/UploadAdPage";
import DashboardPage from "./pages/DashboardPage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import { Toaster } from "./components/ui/sonner";
import GoogleCallback from "./pages/GoogleCallback";



const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AppRouter() {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

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

  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {

    fetch(`${API}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status === 200) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setIsAuth(false);
        setLoading(false);
      });

  }, []);

  if (loading) return <div>Checking login...</div>;

  if (!isAuth) return <Navigate to="/login" replace />;

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
