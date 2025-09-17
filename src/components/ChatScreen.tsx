import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, Loader, User, Zap, AlertTriangle, Book, Coffee, Save, Trash2 } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { ref, set, onValue, remove, serverTimestamp } from 'firebase/database';
import { rtdb } from '../firebase-config';
import { User as AuthUser } from '../App';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import teaJpg from '../assets/images/tea.jpg';
import studyJpg from '../assets/images/study.jpg';

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const generationConfig = {
    temperature: 1,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192,
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'model';
  timestamp: Date;
}

interface ChatScreenProps {
  user: AuthUser;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [chatMode, setChatMode] = useState('tea'); // 'tea' or 'study'
  const [showModeSwitchPopup, setShowModeSwitchPopup] = useState(false);
  const [targetMode, setTargetMode] = useState<string | null>(null);

  const genAI = useMemo(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Gemini API Key is missing. Please check your .env file.");
      return null;
    }
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (e: any) {
      console.error("Error initializing GoogleGenerativeAI:", e);
      setError(`Failed to initialize AI service: ${e.message}`);
      return null;
    }
  }, []);

  const model = useMemo(() => {
    if (!genAI) return null;
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }, [genAI]);
  
  const chat = useMemo(() => {
    if (!model) return null;

    const systemInstruction = chatMode === 'tea' 
    ? `You are a friendly and empathetic AI companion. Your name is Aura. Your goal is to provide a safe and supportive space for the user to talk about their feelings and mental well-being. Be a good listener, offer words of encouragement, and provide gentle guidance. Avoid giving direct advice, instead focus on empowering the user to find their own solutions. Keep your responses concise and easy to understand. You are speaking to ${user.name || 'a friend'}.`
    : `You are a knowledgeable and motivating AI study partner. Your name is Cognito. Your purpose is to help the user learn and stay focused. You can explain complex topics, quiz the user, and provide encouragement. Be clear, concise, and accurate in your explanations. You are assisting ${user.name || 'a student'}.`;

    return model.startChat({
        generationConfig,
        safetySettings,
        history: messages.map(msg => ({
            text: msg.text,
            role: msg.sender
        })),
        systemInstruction,
    });
  }, [model, messages, chatMode, user.name]);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time chat saving
  useEffect(() => {
    if (messages.length > 0) {
      const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
      const lastMessage = messages[messages.length - 1];
      set(temporaryChatRef, {
        messages,
        mode: chatMode,
        lastUpdated: serverTimestamp(),
        // Add a message preview for easy identification
        preview: lastMessage.text.substring(0, 50),
      });
    }
  }, [messages, sessionId, user.uid, chatMode]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) {
      return;
    }

    const newMessage: Message = {
      id: uuidv4(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await chat.sendMessage(input);
      const response = result.response;
      const text = response.text();
      
      const modelMessage: Message = {
        id: uuidv4(),
        text,
        sender: 'model',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError('Sorry, something went wrong while getting a response. Please try again.');
      // remove the user message that caused the error to allow retry
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToHistory = useCallback(async (isSwitchingMode = false) => {
    if (messages.length > 0) {
      const historyChatRef = ref(rtdb, `chat_history/${user.uid}/${sessionId}`);
      try {
        await set(historyChatRef, {
          messages,
          mode: chatMode,
          timestamp: serverTimestamp(),
          title: messages[0].text.substring(0, 30)
        });
        if (!isSwitchingMode) {
            // Give user feedback
            alert("Chat saved to history!");
        }
      } catch (error) {
          console.error("Failed to save chat history:", error);
          if (!isSwitchingMode) {
            alert("Failed to save chat.");
          }
      }
    }
  }, [messages, user.uid, sessionId, chatMode]);

  const resetChat = (newMode: string, forceNewSession: boolean = false) => {
    setChatMode(newMode);
    setMessages([]);
    if (forceNewSession || newMode !== chatMode) {
        setSessionId(uuidv4()); 
    }
    setShowModeSwitchPopup(false);
    setTargetMode(null);
  }

  const handleModeSwitchAttempt = (newMode: string) => {
      if (newMode === chatMode) return;
      if (messages.length === 0) {
          resetChat(newMode);
      } else {
          setTargetMode(newMode);
          setShowModeSwitchPopup(true);
      }
  };

  const handleSaveAndSwitch = async () => {
    if (targetMode) {
        await handleSaveToHistory(true);
        const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
        remove(temporaryChatRef);
        resetChat(targetMode, true);
    }
  };

  const handleDeleteAndSwitch = () => {
      if (targetMode) {
          const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
          remove(temporaryChatRef);
          resetChat(targetMode, true);
      }
  };

  const handleCancelSwitch = () => {
      setShowModeSwitchPopup(false);
      setTargetMode(null);
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const getBackground = () => chatMode === 'tea' ? teaJpg : studyJpg;

  return (
    <div className="flex h-screen bg-gray-100">
        {/* Chat History Sidebar */}
        {/* ... Sidebar code will go here ... */}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
            <AnimatePresence>
                <motion.div 
                    key={chatMode}
                    className="absolute inset-0 bg-cover bg-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ backgroundImage: `url(${getBackground()})` }}
                />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center p-4 bg-white/10 backdrop-blur-md text-white">
                <div className="flex items-center space-x-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={chatMode}
                            initial={{y: -20, opacity: 0}}
                            animate={{y: 0, opacity: 1}}
                            exit={{y: 20, opacity: 0}}
                        >
                            {chatMode === 'tea' ? (
                                <Coffee className="w-8 h-8 text-rose-200"/>
                            ) : (
                                <Book className="w-8 h-8 text-sky-200"/>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    <div>
                        <h1 className="text-xl font-bold">
                            {chatMode === 'tea' ? 'Tea Room Chat' : 'Study Session'}
                        </h1>
                        <p className="text-sm opacity-80">
                            {chatMode === 'tea' ? 'A safe space to talk' : 'Your personal study partner'}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => handleModeSwitchAttempt('tea')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${chatMode === 'tea' ? 'bg-rose-500/80' : 'bg-white/20 hover:bg-white/30'}`}>
                        Tea Room
                    </button>
                    <button onClick={() => handleModeSwitchAttempt('study')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${chatMode === 'study' ? 'bg-sky-500/80' : 'bg-white/20 hover:bg-white/30'}`}>
                        Study Mode
                    </button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-end gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {message.sender === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                           {chatMode === 'tea' ? '☕' : '📚'}
                        </div>
                        )}
                        <div
                        className={`max-w-xl p-4 rounded-2xl text-white ${
                            message.sender === 'user'
                            ? 'bg-blue-500/80 rounded-br-none'
                            : 'bg-black/30 rounded-bl-none'
                        }`}
                        >
                            <Markdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-sm max-w-none">
                                {message.text}
                            </Markdown>
                        </div>
                    </motion.div>
                    ))}
                    {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-end gap-3 justify-start"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                             {chatMode === 'tea' ? '☕' : '📚'}
                        </div>
                        <div className="max-w-xl p-4 rounded-2xl bg-black/30 text-white">
                            <Loader className="w-5 h-5 animate-spin" />
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {error && (
                <div className="relative z-10 p-4 bg-red-500/20 text-red-100 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="font-bold">X</button>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="relative z-10 p-4 bg-white/10 backdrop-blur-md">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={chatMode === 'tea' ? "Talk about what's on your mind..." : "Ask a study question..."}
                        className="w-full py-3 pl-4 pr-12 rounded-2xl bg-white/20 border-2 border-transparent focus:border-blue-400/50 focus:outline-none text-white placeholder:text-gray-300 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-500/80 text-white hover:bg-blue-600/80 disabled:bg-gray-500/50 disabled:cursor-not-allowed transition-colors"
                    >
                        <CornerDownLeft className="w-5 h-5" />
                    </button>
                </div>
            </form>
            
            {/* Mode Switch Popup */}
            <AnimatePresence>
                {showModeSwitchPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-lg"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center"
                        >
                            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4"/>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Switch Chat Mode?</h2>
                            <p className="text-gray-600 mb-6">Your current chat isn't saved. You can save it to your history or start a new chat.</p>
                            <div className="space-y-3">
                                <button onClick={handleSaveAndSwitch} className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                                    <Save className="w-5 h-5 mr-2"/>
                                    Save and Switch
                                </button>
                                <button onClick={handleDeleteAndSwitch} className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">
                                    <Trash2 className="w-5 h-5 mr-2"/>
                                    Discard and Switch
                                </button>
                                <button onClick={handleCancelSwitch} className="w-full px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default ChatScreen;