import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Bot, Coffee, BookOpen, Minimize2, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface CompanionModeProps {
  user: User;
}

type ModeType = 'none' | 'tea' | 'study';

const CompanionMode: React.FC<CompanionModeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<ModeType>('none');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${user.name}! I'm your companion assistant. Choose a mode and let's create the perfect atmosphere for you. ☕📖`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const modeResponses = {
    tea: [
      "Perfect choice! Tea mode is all about relaxation and mindfulness. How are you feeling right now?",
      "I love tea time! What's your favorite type of tea? Let's chat about what's on your mind.",
      "Tea mode activated! Take a deep breath and let's have a peaceful conversation.",
      "Nothing beats a good cup of tea and meaningful conversation. What would you like to talk about?",
      "Tea time is the perfect moment for reflection. How has your day been so far?"
    ],
    study: [
      "Study mode engaged! I'm here to help you stay focused and motivated. What are you working on?",
      "Great choice for productivity! What subject are you studying today?",
      "Study mode is perfect for deep focus. Need any help organizing your thoughts or taking breaks?",
      "I'm your study companion now! Remember to take breaks and stay hydrated. What's your goal today?",
      "Study time! I'll help you stay on track. What would you like to accomplish in this session?"
    ],
    general: [
      "I'm here to support you in whatever mode feels right. How can I help you today?",
      "Whether it's relaxation or productivity, I'm here for you. What's on your mind?",
      "I love being your companion! Tell me what you're thinking about.",
      "Every moment is a good moment for meaningful conversation. How are you doing?",
      "I'm always here to listen and support you. What would you like to talk about?"
    ]
  };

  const handleModeSelect = (mode: ModeType) => {
    setSelectedMode(mode);
    
    // Add a contextual message from the bot
    if (mode !== 'none') {
      const responses = modeResponses[mode];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now().toString(),
          text: randomResponse,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Generate contextual response based on mode
    setTimeout(() => {
      let responses = modeResponses.general;
      if (selectedMode === 'tea') responses = modeResponses.tea;
      else if (selectedMode === 'study') responses = modeResponses.study;

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getBackgroundImage = () => {
    switch (selectedMode) {
      case 'tea':
        return 'url(/src/assets/images/tea.jpg)';
      case 'study':
        return 'url(/src/assets/images/study.jpg)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const getBackgroundOverlay = () => {
    switch (selectedMode) {
      case 'tea':
        return 'rgba(139, 92, 246, 0.3)';
      case 'study':
        return 'rgba(59, 130, 246, 0.3)';
      default:
        return 'rgba(0, 0, 0, 0.1)';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-all duration-1000">
      {/* Dynamic Background */}
      <motion.div
        key={selectedMode}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: getBackgroundImage(),
          backgroundColor: selectedMode === 'none' ? '#f3f4f6' : undefined
        }}
      />
      
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ backgroundColor: getBackgroundOverlay() }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20 p-4"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white hover:bg-white/20 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-white">Companion Mode</h1>
              <p className="text-sm text-white/80">Choose your perfect atmosphere</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/80">Companion Active</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="max-w-4xl w-full">
          {/* Mode Selection */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Choose Your Mode
            </h2>
            <p className="text-white/90 text-lg drop-shadow">
              Create the perfect atmosphere for your moment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Tea Mode */}
            <motion.button
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleModeSelect('tea')}
              className={`relative p-8 rounded-3xl backdrop-blur-lg border-2 transition-all duration-500 ${
                selectedMode === 'tea'
                  ? 'bg-white/30 border-white/60 shadow-2xl'
                  : 'bg-white/10 border-white/30 hover:bg-white/20'
              }`}
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: selectedMode === 'tea' ? [0, 10, -10, 0] : 0,
                    scale: selectedMode === 'tea' ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    repeat: selectedMode === 'tea' ? Infinity : 0, 
                    duration: 2 
                  }}
                  className="text-6xl mb-4"
                >
                  ☕
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Tea Mode</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Relax, unwind, and enjoy peaceful conversations over a warm cup of tea
                </p>
                {selectedMode === 'tea' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Coffee className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>

            {/* Study Mode */}
            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleModeSelect('study')}
              className={`relative p-8 rounded-3xl backdrop-blur-lg border-2 transition-all duration-500 ${
                selectedMode === 'study'
                  ? 'bg-white/30 border-white/60 shadow-2xl'
                  : 'bg-white/10 border-white/30 hover:bg-white/20'
              }`}
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: selectedMode === 'study' ? [0, 5, -5, 0] : 0,
                    scale: selectedMode === 'study' ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    repeat: selectedMode === 'study' ? Infinity : 0, 
                    duration: 3 
                  }}
                  className="text-6xl mb-4"
                >
                  📖
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Study Mode</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Focus, learn, and stay motivated with your study companion
                </p>
                {selectedMode === 'study' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <BookOpen className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          </div>

          {/* Mode Status */}
          <AnimatePresence>
            {selectedMode !== 'none' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-lg px-6 py-3 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">
                    {selectedMode === 'tea' ? '☕ Tea Mode Active' : '📖 Study Mode Active'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Chatbot */}
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ${
          isChatMinimized ? 'w-16 h-16' : 'w-80 h-96'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 h-full flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center"
              >
                <Bot className="w-4 h-4 text-white" />
              </motion.div>
              {!isChatMinimized && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Companion</h4>
                  <p className="text-xs text-gray-600">Always here for you</p>
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsChatMinimized(!isChatMinimized)}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              {isChatMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </motion.button>
          </div>

          {!isChatMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-2 rounded-xl text-xs ${
                        message.isUser
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1 opacity-70 ${
                          message.isUser ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 p-2 rounded-xl">
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                            className="w-1 h-1 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                            className="w-1 h-1 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                            className="w-1 h-1 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200/50">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CompanionMode;