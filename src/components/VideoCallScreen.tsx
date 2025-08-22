import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Settings,
  Mountain,
  Waves,
  Trees
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';

interface VideoCallScreenProps {
  user: User;
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('none');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  const backgrounds = [
    { id: 'none', name: 'No Background', icon: Video, preview: 'bg-transparent' },
    { id: 'blur', name: 'Blur Background', icon: Settings, preview: 'bg-gradient-to-br from-blue-100 to-purple-100' },
    { id: 'nature', name: 'Peaceful Nature', icon: Trees, preview: 'bg-gradient-to-br from-green-200 to-blue-300' },
    { id: 'ocean', name: 'Ocean Waves', icon: Waves, preview: 'bg-gradient-to-br from-blue-300 to-teal-400' },
    { id: 'mountain', name: 'Mountain View', icon: Mountain, preview: 'bg-gradient-to-br from-purple-300 to-pink-300' }
  ];

  useEffect(() => {
    startVideo();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsInCall(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsInCall(false);
    navigate('/dashboard');
  };

  const getBackgroundStyle = () => {
    switch (selectedBackground) {
      case 'blur':
        return { filter: 'blur(20px)', transform: 'scale(1.1)' };
      case 'nature':
        return { 
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          filter: 'blur(2px)'
        };
      case 'ocean':
        return { 
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          filter: 'blur(2px)'
        };
      case 'mountain':
        return { 
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          filter: 'blur(2px)'
        };
      default:
        return {};
    }
  };

  if (!isInCall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Video className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Starting Video Call...</h2>
          <p className="text-gray-600">Please allow camera access</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Layer */}
      {selectedBackground !== 'none' && (
        <div 
          className="absolute inset-0 z-0"
          style={getBackgroundStyle()}
        />
      )}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-black/30 backdrop-blur-lg text-white rounded-xl hover:bg-black/40 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div className="text-white">
            <h1 className="text-lg font-bold">AI Wellness Session</h1>
            <p className="text-sm opacity-75">With your AI companion</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowBackgrounds(!showBackgrounds)}
          className="p-3 bg-black/30 backdrop-blur-lg text-white rounded-xl hover:bg-black/40 transition-all"
        >
          <Settings className="w-6 h-6" />
        </motion.button>
      </motion.header>

      {/* Background Selection Panel */}
      <AnimatePresence>
        {showBackgrounds && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-4 z-30 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Virtual Backgrounds</h3>
            <div className="space-y-2">
              {backgrounds.map((bg) => (
                <motion.button
                  key={bg.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedBackground(bg.id);
                    setShowBackgrounds(false);
                  }}
                  className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all ${
                    selectedBackground === bg.id 
                      ? 'bg-purple-100 border-2 border-purple-400' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg.preview}`}>
                    <bg.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{bg.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Video Area */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl w-full">
          {/* User Video */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative aspect-video bg-gray-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Video Off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-lg px-3 py-1 rounded-lg">
              <span className="text-white text-sm font-medium">You</span>
            </div>
          </motion.div>

          {/* AI Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative aspect-video bg-gradient-to-br from-purple-400 to-blue-500 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut"
              }}
              className="text-center text-white"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Wellness Companion</h3>
              <p className="text-sm opacity-80">Listening and here to support you</p>
            </motion.div>
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-lg px-3 py-1 rounded-lg">
              <span className="text-white text-sm font-medium">AI Companion</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full"
            />
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-lg rounded-2xl p-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className={`p-4 rounded-xl transition-all ${
              isMuted 
                ? 'bg-red-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className={`p-4 rounded-xl transition-all ${
              !isVideoOn 
                ? 'bg-red-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={endCall}
            className="p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
          >
            <Phone className="w-6 h-6 transform rotate-135" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoCallScreen;