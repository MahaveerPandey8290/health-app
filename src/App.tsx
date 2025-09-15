import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import CreateAccountScreen from './components/CreateAccountScreen';
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
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleLogin = (email: string, password: string) => {
    const newUser = { email, name: email.split('@')[0], avatar: selectedAvatar };
    setUser(newUser);
    setIsCreatingAccount(true); // Go to create account/welcome screen after login
  };

  const handleAccountCreationComplete = (displayName: string) => {
    if (user) {
      setUser({ ...user, name: displayName });
    }
    setIsCreatingAccount(false); // Finish account creation
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setIsCreatingAccount(false);
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
                  <LoginScreen 
                    onLogin={handleLogin} 
                    onShowCreateAccount={() => setIsCreatingAccount(true)}
                  />
                ) : (
                  isCreatingAccount ? (
                    <CreateAccountScreen 
                      isOpen={true}
                      onComplete={handleAccountCreationComplete}
                    />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={user && !isCreatingAccount ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/chat" 
              element={user && !isCreatingAccount ? <ChatScreen user={user} /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/video-call" 
              element={user && !isCreatingAccount ? <VideoCallScreen /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/companion-mode" 
              element={user && !isCreatingAccount ? <ChatScreen user={user} /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/avatar-room" 
              element={user && !isCreatingAccount ? <AvatarRoom user={user} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} /> : <Navigate to="/login" replace />}
            />
            <Route 
              path="/profile" 
              element={user && !isCreatingAccount ? <UserProfile user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" replace />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
