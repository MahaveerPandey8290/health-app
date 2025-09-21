import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, Loader, Book, Coffee, Save, Trash2, AlertTriangle } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { ref, set, remove, serverTimestamp } from 'firebase/database';
import { rtdb } from '../firebase-config';
import { User as AuthUser } from '../App';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import teaJpg from '../assets/images/tea.jpg';
import studyJpg from '../assets/images/study.jpg';

// Safety settings for the generative model
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Configuration for the generative model
const generationConfig = {
    temperature: 1,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192,
};

// Interface for a chat message
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'model';
  timestamp: Date;
}

// Props for the ChatScreen component
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

  const chatRef = useRef<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize the Generative AI model
  const genAI = useMemo(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError("VITE_GEMINI_API_KEY is missing. Please check your .env file.");
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
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings, generationConfig });
  }, [genAI]);

  // Effect to initialize the chat session and send a welcome message
  useEffect(() => {
    if (!model) return;

    const persona = chatMode === 'tea'
        ? `You are a friendly and empathetic AI companion. Your name is Aura. Your goal is to provide a safe and supportive space for the user to talk about their feelings and mental well-being. Be a good listener, offer words of encouragement, and provide gentle guidance. Avoid giving direct advice; instead, focus on empowering the user to find their own solutions. Keep your responses concise and easy to understand. You are speaking to ${user.name || 'a friend'}.`
        : `You are a knowledgeable and motivating AI study partner. Your name is Cognito. Your purpose is to help the user learn and stay focused. You can explain complex topics, quiz the user, and provide encouragement. Be clear, concise, and accurate in your explanations. You are assisting ${user.name || 'a student'}.`;

    // Start a new chat with a priming instruction for the model's persona
    chatRef.current = model.startChat({
        history: [
            {
                role: 'user',
                parts: [{ text: persona }],
            },
            {
                role: 'model',
                parts: [{ text: "Okay, I'm ready. I will act as the persona you described." }],
            },
        ],
    });

    // Send a visible welcome message to the user
    const welcomeText = chatMode === 'tea'
      ? `Welcome to the Tea Room, ${user.name || 'friend'}! I'm Aura. Feel free to share what's on your mind.`
      : `Hello, ${user.name || 'student'}! I'm Cognito. I'm ready to help you with your studies. What topic are we diving into today?`;

    const welcomeMessage: Message = {
      id: uuidv4(),
      text: welcomeText,
      sender: 'model',
      timestamp: new Date(),
    };
    // Initialize the chat with only the welcome message visible to the user
    setMessages([welcomeMessage]);

}, [model, chatMode, user.name]);


  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save temporary chat progress to Firebase
  useEffect(() => {
    if (messages.length > 1) { // Only save if there's more than the welcome message
      const temporaryChatRef = ref(rtdb, `temporary_chats/${user.uid}/${sessionId}`);
      const lastMessage = messages[messages.length - 1];
      const serializableMessages = messages.map(msg => ({ ...msg, timestamp: msg.timestamp.toISOString() }));
      set(temporaryChatRef, {
        messages: serializableMessages,
        mode: chatMode,
        lastUpdated: serverTimestamp(),
        preview: lastMessage.text.substring(0, 50),
      });
    }
  }, [messages, sessionId, user.uid, chatMode]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const chat = chatRef.current;
    if (!input.trim() || isLoading || !chat) return;

    const userInput = input;
    setInput('');

    const newMessage: Message = {
      id: uuidv4(),
      text: userInput,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to the state
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const result = await chat.sendMessage(userInput);
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
      setError(`AI Error: ${err.message}. Please check your API key and network connection.`);
      // Roll back the user message on error
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Save the current chat to history
  const handleSaveToHistory = useCallback(async (isSwitchingMode = false) => {
    if (messages.length <= 1) return; // Don't save if only the welcome message exists
    const historyChatRef = ref(rtdb, `chat_history/${user.uid}/${sessionId}`);
    try {
      const serializableMessages = messages.map(msg => ({ ...msg, timestamp: msg.timestamp.toISOString() }));
      await set(historyChatRef, {
        messages: serializableMessages,
        mode: chatMode,
        timestamp: serverTimestamp(),
        title: messages[1]?.text.substring(0, 30) || 'Chat', // Use second message for title
      });
      if (!isSwitchingMode) {
        alert("Chat saved to history!");
      }
    } catch (error) {
      console.error("Failed to save chat history:", error);
      if (!isSwitchingMode) {
        alert("Failed to save chat.");
      }
    }
  }, [messages, user.uid, sessionId, chatMode]);

  // Reset the chat state for a new session
  const resetChat = (newMode: string, forceNewSession: boolean = false) => {
    if (forceNewSession || newMode !== chatMode) {
      setSessionId(uuidv4());
    }
    setChatMode(newMode);
    setMessages([]); // Cleared, will be repopulated by useEffect
    setShowModeSwitchPopup(false);
    setTargetMode(null);
  };

  // Attempt to switch chat modes, showing a popup if there's an active chat
  const handleModeSwitchAttempt = (newMode: string) => {
    if (newMode === chatMode) return;
    if (messages.length <= 1) { // Allow switching if no user messages
      resetChat(newMode);
    } else {
      setTargetMode(newMode);
      setShowModeSwitchPopup(true);
    }
  };

  // Save the current chat and then switch modes
  const handleSaveAndSwitch = async () => {
    if (targetMode) {
      await handleSaveToHistory(true);
      const temporaryChatRef = ref(rtdb, `temporary_chats/${user.uid}/${sessionId}`);
      remove(temporaryChatRef);
      resetChat(targetMode, true);
    }
  };

  // Discard the current chat and then switch modes
  const handleDeleteAndSwitch = () => {
    if (targetMode) {
      const temporaryChatRef = ref(rtdb, `temporary_chats/${user.uid}/${sessionId}`);
      remove(temporaryChatRef);
      resetChat(targetMode, true);
    }
  };

  // Cancel the mode switch
  const handleCancelSwitch = () => {
    setShowModeSwitchPopup(false);
    setTargetMode(null);
  };

  const getBackground = () => chatMode === 'tea' ? teaJpg : studyJpg;

  return (
    <div className="flex h-screen bg-gray-100">
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

        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-4 bg-white/10 backdrop-blur-md text-white">
          <div className="flex items-center space-x-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={chatMode}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                {chatMode === 'tea' ? (
                  <Coffee className="w-8 h-8 text-rose-200" />
                ) : (
                  <Book className="w-8 h-8 text-sky-200" />
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
                className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    {chatMode === 'tea' ? '☕' : '📚'}
                  </div>
                )}
                <div
                  className={`max-w-xl p-4 rounded-2xl text-white ${message.sender === 'user' ? 'bg-blue-500/80 rounded-br-none' : 'bg-black/30 rounded-bl-none'}`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-3 justify-start">
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
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Switch Chat Mode?</h2>
                <p className="text-gray-600 mb-6">Your current chat isn't saved to your permanent history. Would you like to save it before switching?</p>
                <div className="space-y-3">
                  <button onClick={handleSaveAndSwitch} className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                    <Save className="w-5 h-5 mr-2" />
                    Save and Switch
                  </button>
                  <button onClick={handleDeleteAndSwitch} className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">
                    <Trash2 className="w-5 h-5 mr-2" />
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
