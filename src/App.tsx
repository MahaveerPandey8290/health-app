import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import CreateAccountPage from './components/CreateAccountPage';
import Dashboard from './components/Dashboard';
import ChatScreen from './components/ChatScreen';
import AvatarRoom from './components/AvatarRoom';
import UserProfile from './components/UserProfile';
import VideoCallScreen from './components/VideoCallScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import { auth, db } from './firebase-config';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  avatar?: string;
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData.name || firebaseUser.displayName,
        avatar: userData.avatar,
      });
    } else {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error signing in: ", error);
      alert("Invalid email or password. Please try again.");
    }
  };
  
  const handleCreateAccount = async (userData: { fullName: string; email: string; phoneNumber: string; password: string; }) => {
    const { email, password, fullName, phoneNumber } = userData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName: fullName });
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        name: fullName,
        email: email,
        phoneNumber: phoneNumber,
        createdAt: new Date(),
        avatar: ''
      });
      
    } catch (error: any) {
      console.error("Error creating account: ", error);
      alert(`Account creation failed: ${error.message}`);
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          createdAt: new Date(),
          avatar: firebaseUser.photoURL
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error("Google Sign-In Error: ", error);
      alert("Error with Google Sign-In. Please try again.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {user ? (
          <>
            <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
            <Route path="/chat" element={<ChatScreen user={user} />} />
            <Route path="/video-call" element={<VideoCallScreen />} />
            <Route path="/avatar-room" element={<AvatarRoom user={user} selectedAvatar={user.avatar || ''} setSelectedAvatar={(avatar) => setUser({ ...user, avatar })} />} />
            <Route path="/profile" element={<UserProfile user={user} onUpdateUser={setUser} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginScreen onLogin={handleLogin} onShowCreateAccount={() => navigate('/create-account')} onGoogleSignIn={handleGoogleSignIn} />} />
            <Route path="/create-account" element={<CreateAccountPage onCreateAccount={handleCreateAccount} onShowLogin={() => navigate('/login')} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
