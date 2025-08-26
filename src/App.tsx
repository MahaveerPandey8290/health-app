import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import CreateAccountScreen, { UserRegistrationData } from './components/CreateAccountScreen';
import Dashboard from './components/Dashboard';
import ChatScreen from './components/ChatScreen';
import VideoCallScreen from './components/VideoCallScreen';
import AvatarRoom from './components/AvatarRoom';
import { motion, AnimatePresence } from 'framer-motion';

export interface User {
  email: string;
  name: string;
  avatar?: string;
  age?: string;
  gender?: string;
  mobileNumber?: string;
  country?: string;
  address?: string;
  pincode?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication
    setUser({
      email,
      name: email.split('@')[0],
      avatar: selectedAvatar
    });
  };

  const handleCreateAccount = (userData: UserRegistrationData) => {
    // Simple mock registration - in a real app, this would call an API
    setUser({
      email: userData.email,
      name: userData.name,
      avatar: selectedAvatar,
      age: userData.age,
      gender: userData.gender,
      mobileNumber: userData.mobileNumber,
      country: userData.country,
      address: userData.address,
      pincode: userData.pincode
    });
    setShowCreateAccount(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowCreateAccount(false);
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
                  showCreateAccount ? (
                    <CreateAccountScreen 
                      onCreateAccount={handleCreateAccount}
                      onBackToLogin={() => setShowCreateAccount(false)}
                    />
                  ) : (
                    <LoginScreen 
                      onLogin={handleLogin} 
                      onShowCreateAccount={() => setShowCreateAccount(true)}
                    />
                  )
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