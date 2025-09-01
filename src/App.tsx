import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import CreateAccountScreen, { UserRegistrationData } from './components/CreateAccountScreen';
import WelcomePopup from './components/WelcomePopup';
import Dashboard from './components/Dashboard';
import ChatScreen from './components/ChatScreen';
import VideoCallScreen from './components/VideoCallScreen';
import CompanionMode from './components/CompanionMode';
import AvatarRoom from './components/AvatarRoom';
import { motion, AnimatePresence } from 'framer-motion';

export interface User {
  email: string;
  name: string;
  displayName?: string;
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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  const handleLogin = (email: string, password: string) => {
    // Simple mock authentication
    const newUser = {
      email,
      name: email.split('@')[0],
      avatar: selectedAvatar
    };
    setUser(newUser);
    setShowWelcomePopup(true);
  };

  const handleCreateAccount = (userData: UserRegistrationData) => {
    // Simple mock registration - in a real app, this would call an API
    const newUser = {
      email: userData.email,
      name: userData.name,
      avatar: selectedAvatar,
      age: userData.age,
      gender: userData.gender,
      mobileNumber: userData.mobileNumber,
      country: userData.country,
      address: userData.address,
      pincode: userData.pincode
    };
    setUser(newUser);
    setShowCreateAccount(false);
    setShowWelcomePopup(true);
  };

  const handleWelcomeComplete = (displayName: string) => {
    if (user) {
      setUser({ ...user, displayName });
    }
    setShowWelcomePopup(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowCreateAccount(false);
    setShowWelcomePopup(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Welcome Popup */}
        <WelcomePopup
          isOpen={showWelcomePopup}
          onComplete={handleWelcomeComplete}
          userEmail={user?.email || ''}
        />

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
                user && !showWelcomePopup ? (
                  <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/chat" 
              element={
                user && !showWelcomePopup ? (
                  <ChatScreen user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/video-call" 
              element={
                user && !showWelcomePopup ? (
                  <VideoCallScreen user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/companion-mode" 
              element={
                user && !showWelcomePopup ? (
                  <CompanionMode user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/avatar-room" 
              element={
                user && !showWelcomePopup ? (
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