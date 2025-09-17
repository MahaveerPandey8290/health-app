import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Send, Bot, User, CornerDownLeft, Coffee, BookOpen, Save, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType } from '../App';
import teaJpg from '../assets/images/tea.jpg';
import studyJpg from '../assets/images/study.jpg';
import SubscriptionPopup from './SubscriptionPopup';
import { db, rtdb } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, set, remove, onValue } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';

interface ChatScreenProps {
  user: UserType;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ user }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState('tea');
  const [timer, setTimer] = useState(600);
  const [showSubscription, setShowSubscription] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(uuidv4());

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
    try {
      return model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.9, topP: 1, topK: 1 },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      });
    } catch (e: any) {
      console.error("Error starting chat:", e);
      setError(`Failed to start chat session: ${e.message}`);
      return null;
    }
  }, [model]);

  useEffect(() => {
    if (error || !chat) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
    
    const listener = onValue(temporaryChatRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.messages) {
            setMessages(data.messages);
            setIsLoading(false);
        } else {
            const welcomeMessage = async () => {
                try {
                    const result = await chat.sendMessage(`Hello! My name is ${user.name}. Please act as an AI Wellness Companion and start our conversation with a warm welcome.`);
                    const response = await result.response;
                    const text = response.text();
                    const welcomeMsg = { role: 'model', parts: [{ text }] };
                    setMessages([welcomeMsg]);
                    await set(temporaryChatRef, { messages: [welcomeMsg] });
                } catch (e: any) {
                    console.error("Error sending initial message:", e);
                    setError("Failed to get a welcome message from the AI. Please check your connection and API key.");
                    const fallbackMsg = { role: 'model', parts: [{ text: `Hello ${user.name}! I'm having a little trouble connecting right now, but I'm here to help.` }] };
                    setMessages([fallbackMsg]);
                } finally {
                    setIsLoading(false);
                }
            };
            welcomeMessage();
        }
    }, (err) => {
        console.error("Firebase onValue error:", err);
        setError("Failed to connect to the chat database. Check your Firebase security rules.");
        setIsLoading(false);
    });

    return listener;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat, user.uid, user.name, sessionId, error]);

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
    if (input.trim() === '' || !chat) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
    set(temporaryChatRef, { messages: newMessages });

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessage(currentInput);
      const response = await result.response;
      const text = response.text();
      const modelMessage = { role: 'model', parts: [{ text }] };
      const finalMessages = [...newMessages, modelMessage];
      setMessages(finalMessages);
      set(temporaryChatRef, { messages: finalMessages });
    } catch (e: any) {
      console.error('Error sending message:', e);
      const errorMessage = { role: 'model', parts: [{ text: 'Sorry, I am having trouble connecting. Please try again later.' }] };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToHistory = async () => {
    const permanentChatRef = collection(db, "users", user.uid, "permanent_chats");
    await addDoc(permanentChatRef, { messages, createdAt: serverTimestamp(), sessionId });
    alert("Chat saved to history!");
  };

  const handleDeleteSession = () => {
    const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
    remove(temporaryChatRef);
    setMessages([]);
    alert("Session chat deleted!");
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const getBackground = () => chatMode === 'tea' ? teaJpg : studyJpg;

  if (showSubscription) return <SubscriptionPopup />;

  return (
    <div className="flex flex-col h-screen bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${getBackground()})` }}>
      <header className="bg-white/30 backdrop-blur-sm p-4 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-600">
            {user.name}
        </div>
        <div className="flex items-center gap-4">
            <div className="font-mono bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {formatTime(timer)}
            </div>
            <button onClick={handleSaveToHistory} className="text-gray-500 hover:text-purple-600" title="Save Chat History">
                <Save className="w-6 h-6" />
            </button>
            <button onClick={handleDeleteSession} className="text-gray-500 hover:text-red-600" title="Delete Session Chat">
                <Trash2 className="w-6 h-6" />
            </button>
        </div>
      </header>

      {error ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center p-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Chat Unavailable</h2>
            <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
            <p className="mt-4 text-gray-600">Please check the browser console for more technical details.</p>
        </div>
      ) : (
        <>
            <div className="flex justify-center my-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-full p-1 flex gap-1">
                    <button
                    onClick={() => setChatMode('tea')}
                    className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${chatMode === 'tea' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-purple-100'}`}>
                    <Coffee className="w-5 h-5" />
                    Tea Time
                    </button>
                    <button
                    onClick={() => setChatMode('study')}
                    className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${chatMode === 'study' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-purple-100'}`}>
                    <BookOpen className="w-5 h-5" />
                    Study Session
                    </button>
                </div>
            </div>
            <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index} layout
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
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-center gap-4 my-4">
                  <Bot className="w-8 h-8 text-purple-500 animate-pulse" />
                  <div className="max-w-xl p-4 rounded-2xl shadow-md bg-white/90 backdrop-blur-sm text-gray-800">
                    <p className="animate-pulse">AI is thinking...</p>
                  </div>
                </motion.div>)}
            </AnimatePresence>
            </div>

            <div className="p-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-full flex items-center px-4 py-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Share what's on your mind..." className="flex-grow bg-transparent focus:outline-none text-gray-700" disabled={isLoading || !!error}/>
                <button onClick={handleSend} disabled={isLoading || !!error} className="p-2 rounded-full bg-purple-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? <CornerDownLeft className="animate-spin"/> : <Send />}
                </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default ChatScreen;
