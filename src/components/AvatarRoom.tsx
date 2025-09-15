import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCw, Check, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';
import maleAvatarImg from '../assets/images/male-avatar.png';
import femaleAvatarImg from '../assets/images/female-avatar.png';

interface AvatarRoomProps {
  user: User;
  selectedAvatar: string;
  setSelectedAvatar: (avatar: string) => void;
}

const AvatarRoom: React.FC<AvatarRoomProps> = ({ 
  user, 
  selectedAvatar, 
  setSelectedAvatar 
}) => {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);

  const avatars = [
    {
      id: 'male',
      name: 'Male Avatar',
      image: maleAvatarImg,
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'female',
      name: 'Female Avatar',
      image: femaleAvatarImg,
      color: 'from-pink-400 to-purple-500'
    }
  ];

  const handleRotate = () => {
    setRotation(prev => prev + 90);
  };

  const handleSaveAvatar = () => {
    // Save to localStorage and update user
    localStorage.setItem('userAvatar', selectedAvatar);
    navigate('/dashboard');
  };

  const currentAvatar = avatars.find(avatar => avatar.id === selectedAvatar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-purple-100 p-4"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-purple-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Avatar Room</h1>
              <p className="text-sm text-gray-600">Customize your digital presence</p>
            </div>
          </div>
          
          {selectedAvatar && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveAvatar}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Avatar</span>
            </motion.button>
          )}
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Preview</h2>
              <p className="text-gray-600">How your avatar will appear</p>
            </div>

            <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mb-6 overflow-hidden">
              {currentAvatar ? (
                <motion.div
                  key={selectedAvatar}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: rotation }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white"
                >
                  <img 
                    src={currentAvatar.image} 
                    alt={currentAvatar.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <div className="text-center text-gray-400">
                  <Palette className="w-16 h-16 mx-auto mb-4" />
                  <p>Select an avatar to preview</p>
                </div>
              )}
              
              {/* Floating particles */}
              {currentAvatar && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-white/40 rounded-full"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </>
              )}
            </div>

            {currentAvatar && (
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {currentAvatar.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  Your chosen companion
                </p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRotate}
                className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-all"
                disabled={!currentAvatar}
              >
                <RotateCw className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Avatar Selection */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Avatar</h2>

            {/* Avatar Grid */}
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {avatars.map((avatar, index) => (
                  <motion.button
                    key={avatar.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`relative p-6 rounded-2xl transition-all duration-300 ${
                      selectedAvatar === avatar.id
                        ? 'bg-purple-100 border-2 border-purple-400 shadow-lg'
                        : 'bg-white hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-2 border-gray-200">
                        <img 
                          src={avatar.image} 
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-lg font-semibold text-gray-800">
                          {avatar.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Professional AI companion
                        </p>
                      </div>
                    </div>
                    
                    {selectedAvatar === avatar.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AvatarRoom;