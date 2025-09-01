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
  Trees,
  MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';
import SubscriptionPopup from './SubscriptionPopup';

interface VideoCallScreenProps {
  user: User;
}

interface ConvaiResponse {
  text: string;
  audio?: string;
  visemes?: any[];
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('none');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  
  // Timer and subscription states
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [timeUsed, setTimeUsed] = useState(0);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const FREE_TRIAL_DURATION = 10 * 60; // 10 minutes in seconds
  
  // Convai integration states
  const [convaiClient, setConvaiClient] = useState<any>(null);
  const [isConvaiConnected, setIsConvaiConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lexiResponse, setLexiResponse] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    speaker: 'user' | 'lexi';
    text: string;
    timestamp: Date;
  }>>([]);

  const backgrounds = [
    { id: 'none', name: 'No Background', icon: Video, preview: 'bg-transparent' },
    { id: 'blur', name: 'Blur Background', icon: Settings, preview: 'bg-gradient-to-br from-blue-100 to-purple-100' },
    { id: 'nature', name: 'Peaceful Nature', icon: Trees, preview: 'bg-gradient-to-br from-green-200 to-blue-300' },
    { id: 'ocean', name: 'Ocean Waves', icon: Waves, preview: 'bg-gradient-to-br from-blue-300 to-teal-400' },
    { id: 'mountain', name: 'Mountain View', icon: Mountain, preview: 'bg-gradient-to-br from-purple-300 to-pink-300' }
  ];

  // Initialize Convai SDK
  useEffect(() => {
    const initializeConvai = async () => {
      try {
        // Dynamic import for Convai SDK
        const ConvaiSDK = await import('convai-web-sdk');
        
        const client = new ConvaiSDK.ConvaiClient({
          apiKey: import.meta.env.VITE_CONVAI_API_KEY,
          characterId: '360f1c86-c98a-11ef-82c5-42010a7be016',
          enableAudio: true,
          enableFacialData: true,
        });

        // Set up event listeners
        client.onResponse = (response: ConvaiResponse) => {
          console.log('Convai Response:', response);
          setLexiResponse(response.text);
          
          // Add to conversation history
          setConversationHistory(prev => [...prev, {
            speaker: 'lexi',
            text: response.text,
            timestamp: new Date()
          }]);

          // Handle audio playback if available
          if (response.audio) {
            const audio = new Audio(response.audio);
            audio.play().catch(console.error);
          }
        };

        client.onError = (error: any) => {
          console.error('Convai Error:', error);
        };

        client.onAudioPlay = () => {
          console.log('Lexi is speaking...');
        };

        client.onAudioStop = () => {
          console.log('Lexi finished speaking');
        };

        setConvaiClient(client);
        setIsConvaiConnected(true);
        
        console.log('Convai SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Convai SDK:', error);
      }
    };

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon";
      return "Good evening";
    };
    initializeConvai();

    return () => {
      if (convaiClient) {
        convaiClient.endSession?.();
      }
    };
  }, []);

  // Start video and Convai session
  useEffect(() => {
    startVideo();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (convaiClient) {
        convaiClient.endSession?.();
      }
    };
  }, [convaiClient]);

  // Timer effect for free trial
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInCall && callStartTime && !hasSubscription) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
        setTimeUsed(elapsed);
        
        // Show subscription popup after 10 minutes
        if (elapsed >= FREE_TRIAL_DURATION) {
          setShowSubscriptionPopup(true);
          clearInterval(interval);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInCall, callStartTime, hasSubscription]);
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
      setCallStartTime(new Date());

      // Start Convai session when video starts
      if (convaiClient && isConvaiConnected) {
        try {
          await convaiClient.startSession();
          console.log('Convai session started');
          
          // Send initial greeting
          setTimeout(() => {
            const displayName = user.displayName || user.name;
            sendMessageToLexi(`Hello! I'm ${displayName}. I'm here for a wellness session.`);
          }, 2000);
        } catch (error) {
          console.error('Failed to start Convai session:', error);
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const sendMessageToLexi = async (message: string) => {
    if (!convaiClient || !isConvaiConnected) {
      console.warn('Convai client not ready');
      return;
    }

    try {
      // Add user message to history
      setConversationHistory(prev => [...prev, {
        speaker: 'user',
        text: message,
        timestamp: new Date()
      }]);

      // Send message to Convai
      await convaiClient.sendTextInput(message);
      console.log('Message sent to Lexi:', message);
    } catch (error) {
      console.error('Error sending message to Convai:', error);
    }
  };

  const startListening = async () => {
    if (!convaiClient || !isConvaiConnected) return;

    try {
      setIsListening(true);
      await convaiClient.startAudioChunk();
      console.log('Started listening to user...');
    } catch (error) {
      console.error('Error starting audio input:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (!convaiClient || !isConvaiConnected) return;

    try {
      setIsListening(false);
      await convaiClient.endAudioChunk();
      console.log('Stopped listening to user');
    } catch (error) {
      console.error('Error stopping audio input:', error);
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

  const endCall = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (convaiClient) {
      try {
        await convaiClient.endSession();
        console.log('Convai session ended');
      } catch (error) {
        console.error('Error ending Convai session:', error);
      }
    }
    
    setIsInCall(false);
    navigate('/dashboard');
  };

  const handleSubscribe = (planId: string) => {
    // In a real app, this would integrate with a payment processor
    console.log('Subscribing to plan:', planId);
    setHasSubscription(true);
    setShowSubscriptionPopup(false);
    
    // Reset timer and continue call
    setCallStartTime(new Date());
    setTimeUsed(0);
    
    // Show success message
    const successMessage: any = {
      speaker: 'lexi',
      text: `Welcome to premium! You now have unlimited access to our wellness sessions. How can I help you today?`,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, successMessage]);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    if (hasSubscription) return null;
    const remaining = FREE_TRIAL_DURATION - timeUsed;
    return Math.max(0, remaining);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Starting AI Session...</h2>
          <p className="text-gray-600">Connecting to Lexi and preparing your camera</p>
          {isConvaiConnected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 text-sm mt-2"
            >
              ✓ AI Companion Connected
            </motion.p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Subscription Popup */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
        onSubscribe={handleSubscribe}
        timeUsed={timeUsed}
      />

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
            <h1 className="text-lg font-bold">
              {getGreeting()}, {user.displayName || user.name}! 
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-sm opacity-75">AI Wellness Session with Lexi</p>
              {isConvaiConnected && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-300">AI Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timer Display */}
          {!hasSubscription && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/40 backdrop-blur-lg px-4 py-2 rounded-xl"
            >
              <div className="text-center">
                <p className="text-white text-xs font-medium">Free Trial</p>
                <p className="text-white text-sm font-bold">
                  {formatTime(getRemainingTime() || 0)} left
                </p>
              </div>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowBackgrounds(!showBackgrounds)}
            className="p-3 bg-black/30 backdrop-blur-lg text-white rounded-xl hover:bg-black/40 transition-all"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
        </div>
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
              <span className="text-white text-sm font-medium">{user.name}</span>
            </div>
          </motion.div>

          {/* Lexi AI Avatar Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative aspect-video bg-gradient-to-br from-purple-400 to-blue-500 rounded-3xl overflow-hidden shadow-2xl"
            id="avatar-container"
            ref={avatarRef}
          >
            {/* Lexi Avatar Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: isListening ? [1, 1.1, 1] : [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: isListening ? 1 : 4,
                  ease: "easeInOut"
                }}
                className="text-center text-white"
              >
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">Lexi</h3>
                <p className="text-sm opacity-80">AI Wellness Companion</p>
                
                {/* Speaking indicator */}
                {isListening && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 flex justify-center space-x-1"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Connection Status */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-lg px-3 py-1 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">Lexi</span>
                <div className={`w-2 h-2 rounded-full ${
                  isConvaiConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
              </div>
            </div>

            {/* AI Status Indicator */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                isConvaiConnected ? 'bg-green-400' : 'bg-red-400'
              }`}
            />

            {/* Latest Response Display */}
            {lexiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-16 left-4 right-4 bg-black/70 backdrop-blur-lg rounded-xl p-3"
              >
                <p className="text-white text-sm leading-relaxed">{lexiResponse}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Conversation History Panel */}
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute left-4 top-20 bottom-20 w-80 bg-white/10 backdrop-blur-lg rounded-2xl p-4 overflow-hidden"
      >
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Conversation</h3>
        </div>
        
        <div className="h-full overflow-y-auto space-y-3 pb-20">
          {conversationHistory.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl text-sm ${
                message.speaker === 'user'
                  ? 'bg-purple-500/80 text-white ml-4'
                  : 'bg-white/20 text-white mr-4'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium">
                  {message.speaker === 'user' ? user.name : 'Lexi'}
                </span>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="leading-relaxed">{message.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

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

          {/* Voice Input Control for Convai */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            disabled={!isConvaiConnected}
            className={`p-4 rounded-xl transition-all ${
              isListening
                ? 'bg-green-500 text-white animate-pulse'
                : isConvaiConnected
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-500 text-white cursor-not-allowed'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
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

      {/* Quick Message Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex space-x-2">
          {[
            "How are you today?",
            "I need some guidance",
            "Let's talk about wellness"
          ].map((message, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessageToLexi(message)}
              disabled={!isConvaiConnected}
              className="px-4 py-2 bg-white/20 backdrop-blur-lg text-white text-sm rounded-xl hover:bg-white/30 transition-all disabled:opacity-50"
            >
              {message}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default VideoCallScreen;