import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ChatScreen from './components/ChatScreen';
import VideoCallScreen from './components/VideoCallScreen';
import AvatarRoom from './components/AvatarRoom';
import { motion, AnimatePresence } from 'framer-motion';

export interface User {
  email: string;
  name: string;
  avatar?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication
    setUser({
      email,
      name: email.split('@')[0],
      avatar: selectedAvatar
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/login" 
              element={
                !user ? (
                  <LoginScreen onLogin={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/chat" 
              element={
                user ? (
                  <ChatScreen user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/video-call" 
              element={
                user ? (
                  <VideoCallScreen user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/avatar-room" 
              element={
                user ? (
                  <AvatarRoom 
                    user={user} 
                    selectedAvatar={selectedAvatar}
                    setSelectedAvatar={setSelectedAvatar}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;