import React, { useState, useEffect } from 'react';
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
import { auth } from './firebase-config';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  displayName?: string;
  avatar?: string;
  age?: string;
  gender?: string;
  mobileNumber?: string;
  country?: string;
  address?: string;
  pincode?: string;
}

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

<<<<<<< HEAD
  const handleLogin = (email: string, password: string) => {
    const newUser = { email, name: email.split('@')[0], avatar: selectedAvatar };
    setUser(newUser);
    
    // Show welcome popup only if user hasn't seen it before
    const welcomeKey = `welcome_seen_${email}`;
    const hasSeenBefore = localStorage.getItem(welcomeKey);
    if (!hasSeenBefore) {
      setShowWelcomePopup(true);
    }
=======
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
        };
        setUser(appUser);
        if (firebaseUser.displayName === null) {
          setIsCreatingAccount(true);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  const handleLogin = async (email: string, password: string) => {
    // Handle demo user login with specific logic
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle setting user state and navigation
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // If demo user doesn't exist, create it
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will set user and trigger CreateAccountScreen
          } catch (createError: any) {
            console.error("Error creating demo user: ", createError);
            alert(`Could not create demo account: ${createError.message}`);
          }
        } else {
          // For any other error with demo login (e.g., wrong password, network)
          console.error("Error signing in demo user: ", error);
          alert(`Demo login failed: ${error.message}`);
        }
      }
      return;
    }

    // Handle regular user login
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("Error signing in: ", error);
      alert("Invalid email or password. Please create an account if you haven't already.");
    }
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // @ts-ignore
        if (result.additionalUserInfo?.isNewUser) {
          setIsCreatingAccount(true);
        }
      }).catch((error) => {
        console.error("Google Sign-In Error: ", error);
        alert("Error with Google Sign-In. Please try again.");
      });
>>>>>>> 473ed4f (latest auth&DB setup)
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

<<<<<<< HEAD
  const handleLogout = () => {
    setUser(null);
    setShowCreateAccount(false);
    setShowWelcomePopup(false);
    setHasSeenWelcome(false);
=======
  const handleShowCreateAccount = () => {
    // This is a placeholder as we'll use navigation links instead
    // For now, it triggers the same logic as new user creation
    setIsCreatingAccount(true); 
>>>>>>> 473ed4f (latest auth&DB setup)
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If a user is logged in but hasn't completed profile setup, show the CreateAccountScreen
  if (user && isCreatingAccount) {
    return <CreateAccountScreen isOpen={true} onComplete={handleAccountCreationComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <LoginScreen onLogin={handleLogin} onShowCreateAccount={handleShowCreateAccount} onGoogleSignIn={handleGoogleSignIn} /> : <Navigate to="/dashboard" replace />}
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
            path="/avatar-room" 
            element={user ? <AvatarRoom user={user} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/profile" 
            element={user ? <UserProfile user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
<<<<<<< HEAD
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
=======
      <AppContent />
>>>>>>> 473ed4f (latest auth&DB setup)
    </Router>
  );
}

export default App;
