"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

export default function HealthPage() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [backendMessage, setBackendMessage] = useState('');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'Not configured';
    setApiUrl(url);
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      const data = await res.json();
      
      if (res.ok) {
        setBackendStatus('online');
        setBackendMessage(data.message || 'Backend is healthy');
      } else {
        setBackendStatus('offline');
        setBackendMessage('Backend returned error');
      }
    } catch (err) {
      setBackendStatus('offline');
      setBackendMessage('Cannot connect to backend');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-primary mb-6">System Health</h1>
        
        <div className="space-y-6">
          {/* Frontend Status */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3">Frontend</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="flex items-center text-green-600">
                  <FiCheckCircle className="mr-1" /> Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">URL:</span>
                <span className="text-sm font-mono">{typeof window !== 'undefined' ? window.location.origin : 'SSR'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API URL:</span>
                <span className="text-sm font-mono">{apiUrl}</span>
              </div>
            </div>
          </div>

          {/* Backend Status */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3">Backend</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`flex items-center ${
                  backendStatus === 'online' ? 'text-green-600' :
                  backendStatus === 'loading' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {backendStatus === 'loading' && <FiLoader className="mr-1 animate-spin" />}
                  {backendStatus === 'online' && <FiCheckCircle className="mr-1" />}
                  {backendStatus === 'offline' && <FiXCircle className="mr-1" />}
                  {backendStatus === 'loading' ? 'Checking...' :
                   backendStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              {backendMessage && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Message:</span>
                  <span className="text-sm">{backendMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                Home
              </Link>
              <Link href="/dashboard" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                Dashboard
              </Link>
              <Link href="/categories" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                Categories
              </Link>
              <Link href="/post-ad" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                Post Ad
              </Link>
            </div>
          </div>

          {/* Test API Button */}
          <button
            onClick={checkBackend}
            className="w-full btn-secondary mt-4"
          >
            Refresh Status
          </button>
        </div>
      </motion.div>
    </div>
  );
}
