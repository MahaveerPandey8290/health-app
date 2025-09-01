import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, User } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onComplete: (displayName: string) => void;
  userEmail: string;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onComplete, userEmail }) => {
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      onComplete(displayName.trim());
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md"
          >
            {/* Animated Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center items-center mb-6">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4,
                    ease: "easeInOut"
                  }}
                  className="bg-gradient-to-r from-purple-400 to-blue-400 p-4 rounded-full mr-3"
                >
                  <Heart className="w-8 h-8 text-white" fill="currentColor" />
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </motion.div>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3"
              >
                Welcome to Your Wellness Journey! 🌟
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-sm leading-relaxed"
              >
                {getGreeting()}! I'm excited to be your companion. What would you like me to call you?
              </motion.p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What should I call you? ✨
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/70 text-gray-800 placeholder-gray-500"
                    placeholder="Enter your preferred name..."
                    autoFocus
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is how I'll address you throughout our conversations
                </p>
              </motion.div>

              <motion.button
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!displayName.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-4 rounded-2xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                <motion.span
                  animate={{ 
                    scale: displayName.trim() ? [1, 1.05, 1] : 1
                  }}
                  transition={{ 
                    repeat: displayName.trim() ? Infinity : 0, 
                    duration: 2 
                  }}
                >
                  Continue to Wellness Space 🚀
                </motion.span>
              </motion.button>
            </form>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-300 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-blue-300 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-3 -left-2 w-5 h-5 bg-pink-300 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-4 -right-4 w-7 h-7 bg-purple-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;