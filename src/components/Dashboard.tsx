import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Video, User, LogOut, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User as UserType } from '../App';
import maleAvatarImg from '../assets/images/male-avatar.png';
import femaleAvatarImg from '../assets/images/female-avatar.png';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const savedAvatar = localStorage.getItem('userAvatar');
  
  const getAvatarImage = () => {
    if (savedAvatar === 'male') return maleAvatarImg;
    if (savedAvatar === 'female') return femaleAvatarImg;
    return null;
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Chat with AI",
      description: "Get support and guidance",
      gradient: "from-blue-400 to-purple-500",
      path: "/chat",
      emoji: "💬"
    },
    {
      icon: Video,
      title: "Video Call",
      description: "Face-to-face conversations",
      gradient: "from-purple-400 to-pink-500",
      path: "/video-call",
      emoji: "🎥"
    },
    {
      icon: User,
      title: "Avatar Room",
      description: "Customize your presence",
      gradient: "from-pink-400 to-orange-500",
      path: "/avatar-room",
      emoji: "🧑‍🎨"
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-lg rounded-2xl p-4"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-400"
          >
            {getAvatarImage() ? (
              <img 
                src={getAvatarImage()!} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Sun className="w-6 h-6 text-white" />
            )}
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mental Wellness</h1>
            <p className="text-sm text-gray-600">Your safe space</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
        </div>
      </motion.header>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.02, 1],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 6,
            ease: "easeInOut"
          }}
          className="inline-block mb-4"
        >
          <div className="text-6xl mb-4">🌟</div>
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {getGreeting()}, {user.name}!
        </h2>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          How are you feeling today? I'm here to support you on your wellness journey.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(feature.path)}
              className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 cursor-pointer group hover:bg-white/80 transition-all duration-300"
            >
              <div className="text-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-3xl">{feature.emoji}</span>
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>
                
                <motion.div
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700"
                >
                  Get Started
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-16"
      >
        <blockquote className="text-gray-500 italic max-w-md mx-auto">
          "Every small step towards self-care is a victory worth celebrating."
        </blockquote>
      </motion.div>
    </div>
  );
};

export default Dashboard;
