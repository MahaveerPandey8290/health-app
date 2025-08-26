import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import FloatingShapes from './FloatingShapes';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onShowCreateAccount: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onShowCreateAccount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <FloatingShapes />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-8 w-full max-w-md"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center items-center mb-4">
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
                className="bg-gradient-to-r from-purple-400 to-blue-400 p-3 rounded-full mr-3"
              >
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </motion.div>
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Your safe space for mental wellness
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50"
                placeholder="Enter your email"
                required
              />
            </motion.div>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50"
                placeholder="Enter your password"
                required
              />
            </motion.div>

            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
            >
              Sign In
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-sm text-gray-500 mt-6"
          >
            New here? 
            <button
              onClick={onShowCreateAccount}
              className="text-purple-500 font-medium hover:text-purple-600 ml-1 transition-colors"
            >
              Create account
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginScreen;