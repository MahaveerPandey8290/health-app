import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Send, Bot, User, CornerDownLeft, Coffee, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType } from '../App';
import teaJpg from '../assets/images/tea.jpg';
import studyJpg from '../assets/images/study.jpg';
import SubscriptionPopup from './SubscriptionPopup';

interface ChatScreenProps {
  user: UserType;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ user }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chatMode, setChatMode] = useState('tea'); // 'tea' or 'study'
  const [timer, setTimer] = useState(600);
  const [showSubscription, setShowSubscription] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const genAI = useMemo(() => new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY), []);

  const model = useMemo(() => genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  }), [genAI]);

  const chat = useMemo(() => model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.9,
      topP: 1,
      topK: 1,
    },
  }), [model]);

  useEffect(() => {
    const welcomeMessage = async () => {
      try {
        const result = await chat.sendMessage(`Hello! My name is ${user.name}. Please act as an AI Wellness Companion and start our conversation with a warm welcome.`);
        const response = await result.response;
        const text = response.text();
        setMessages([{ role: 'model', parts: [{ text }] }]);
      } catch (error) {
        console.error('Error sending initial message:', error);
        setMessages([{
          role: 'model',
          parts: [{ text: `Hello ${user.name}! Welcome to your AI Wellness Companion. I'm here to support you. How are you feeling today?` }]
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    if (messages.length === 0) {
        welcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat, user.name]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setShowSubscription(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessage(currentInput);
      const response = await result.response;
      const text = response.text();
      const modelMessage = { role: 'model', parts: [{ text }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'model', parts: [{ text: 'Sorry, I am having trouble connecting. Please try again later.' }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  const getBackground = () => {
    switch (chatMode) {
      case 'tea':
        return teaJpg;
      case 'study':
        return studyJpg;
      default:
        return '';
    }
  };

  if (showSubscription) {
    return <SubscriptionPopup />;
  }

  return (
    <div 
      className="flex flex-col h-screen bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${getBackground()})` }}
    >
      <header className="bg-white/30 backdrop-blur-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Bot className="w-10 h-10 text-purple-600 bg-white p-2 rounded-full" />
            <div>
                <h1 className="text-xl font-bold text-gray-800">AI Wellness Companion</h1>
                <p className="text-sm text-gray-600">Always here to listen</p>
            </div>
        </div>
        <div className="text-lg font-mono text-gray-800">{formatTime(timer)}</div>
      </header>

      <div className="flex justify-center my-4">
        <div className="flex bg-white/50 backdrop-blur-sm rounded-full p-1">
            <button onClick={() => setChatMode('tea')} className={`px-8 py-2 rounded-full flex items-center gap-2 ${chatMode === 'tea' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}><Coffee size={18}/> Tea Mode</button>
            <button onClick={() => setChatMode('study')} className={`px-8 py-2 rounded-full flex items-center gap-2 ${chatMode === 'study' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}><BookOpen size={18}/> Study Mode</button>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-2 my-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <Bot className="w-8 h-8 text-white bg-purple-500 p-1.5 rounded-full" />}
              <div className={`max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-purple-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-800'}`}>
                <p>{msg.parts[0].text}</p>
              </div>
              {msg.role === 'user' && <User className="w-8 h-8 text-white bg-gray-400 p-1.5 rounded-full" />}
            </motion.div>
          ))}
          {isLoading && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-center gap-4 my-4">
              <Bot className="w-8 h-8 text-purple-500 animate-pulse" />
              <div className="max-w-xl p-4 rounded-2xl shadow-md bg-white/90 backdrop-blur-sm text-gray-800">
                <p className="animate-pulse">AI is thinking...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-full flex items-center px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Share what's on your mind..."
            className="flex-grow bg-transparent focus:outline-none text-gray-700"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading} 
            className="p-2 rounded-full bg-purple-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? <CornerDownLeft className="animate-spin"/> : <Send />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
