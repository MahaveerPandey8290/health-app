import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import CreateAccountPage from './components/CreateAccountPage';
import WelcomePopup from './components/WelcomePopup';
import Dashboard from './components/Dashboard';
import ChatScreen from './components/ChatScreen';
import AvatarRoom from './components/AvatarRoom';
import UserProfile from './components/UserProfile';
import VideoCallScreen from './components/VideoCallScreen';
import { AnimatePresence } from 'framer-motion';

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
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  const handleLogin = (email: string, password: string) => {
    const newUser = { email, name: email.split('@')[0], avatar: selectedAvatar };
    setUser(newUser);
    
    // Show welcome popup only if user hasn't seen it before
    const welcomeKey = `welcome_seen_${email}`;
    const hasSeenBefore = localStorage.getItem(welcomeKey);
    if (!hasSeenBefore) {
      setShowWelcomePopup(true);
    }
  };

  const handleCreateAccount = (userData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => {
    const newUser = { 
      email: userData.email, 
      name: userData.fullName, 
      avatar: selectedAvatar,
      mobileNumber: userData.phoneNumber
    };
    setUser(newUser);
    setShowCreateAccount(false);
    
    // Show welcome popup for new users
    setShowWelcomePopup(true);
  };

  const handleWelcomeComplete = (displayName: string) => {
    if (user) {
      const updatedUser = { ...user, displayName };
      setUser(updatedUser);
      
      // Mark welcome as seen for this user
      const welcomeKey = `welcome_seen_${user.email}`;
      localStorage.setItem(welcomeKey, 'true');
      
      setShowWelcomePopup(false);
      setHasSeenWelcome(true);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setShowCreateAccount(false);
    setShowWelcomePopup(false);
    setHasSeenWelcome(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/login" 
              element={
                !user && !showCreateAccount ? (
                  <LoginScreen 
                    onLogin={handleLogin} 
                    onShowCreateAccount={() => setShowCreateAccount(true)}
                  />
                ) : showCreateAccount ? (
                  <CreateAccountPage 
                    onCreateAccount={handleCreateAccount}
                    onShowLogin={() => setShowCreateAccount(false)}
                  />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/chat" 
              element={user ? <ChatScreen user={user} /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/video-call" 
              element={user ? <VideoCallScreen /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/companion-mode" 
              element={user ? <ChatScreen user={user} /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/avatar-room" 
              element={user ? <AvatarRoom user={user} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/profile" 
              element={user ? <UserProfile user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" replace />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      
      {/* Welcome Popup */}
      <WelcomePopup 
        isOpen={showWelcomePopup}
        onComplete={handleWelcomeComplete}
        userEmail={user?.email || ''}
      />
    </Router>
  );
}

export default App;
