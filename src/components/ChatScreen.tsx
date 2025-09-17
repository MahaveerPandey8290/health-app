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
import { ref, set, remove, onValue, off } from "firebase/database";
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
  const [sessionId, setSessionId] = useState(uuidv4());
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
    // FINAL FIX: Add a safety check for the user object.
    if (!user || !chat || error) {
      setIsLoading(false);
      return;
    }

    const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
    off(temporaryChatRef);

    setIsLoading(true);

    const listener = onValue(temporaryChatRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.messages) {
            setMessages(data.messages);
            setIsLoading(false);
        } else {
            const welcomeMessage = async () => {
                try {
                    const modePrompt = `You are an AI Wellness Companion. My name is ${user.name}. We are currently in a "${chatMode === 'tea' ? 'Tea Time' : 'Study Session'}" mode. Please start our conversation with a warm, mode-appropriate welcome.`;
                    const result = await chat.sendMessage(modePrompt);
                    const response = await result.response;
                    const text = response.text();
                    const welcomeMsg = { role: 'model', parts: [{ text }] };
                    
                    // Check if component is still mounted
                    if (chatContainerRef.current) {
                      setMessages([welcomeMsg]);
                      chat.history = [{role: 'user', parts: [{text: modePrompt}]}, welcomeMsg];
                      await set(temporaryChatRef, { messages: [welcomeMsg] });
                    }
                } catch (e: any) {
                    console.error("Error sending initial message:", e);
                    setError("Failed to get a welcome message from the AI.");
                } finally {
                    if (chatContainerRef.current) {
                      setIsLoading(false);
                    }
                }
            };
            welcomeMessage();
        }
    }, (err) => {
        console.error("Firebase onValue error:", err);
        setError("Failed to connect to the chat database.");
        setIsLoading(false);
    });

    return () => off(ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`));

  }, [chat, user, sessionId, chatMode, error]);

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
    if (input.trim() === '' || !chat || isLoading) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
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
      const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
      await set(temporaryChatRef, { messages: finalMessages });
    } catch (e: any) {
      console.error('Error sending message:', e);
      const errorMessage = { role: 'model', parts: [{ text: 'Sorry, I am having trouble connecting. Please try again later.' }] };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToHistory = async (silent = false) => {
    if (messages.length === 0) {
        if (!silent) alert("Chat is empty, nothing to save.");
        return;
    }
    const permanentChatRef = collection(db, "users", user.uid, "permanent_chats");
    await addDoc(permanentChatRef, { messages, createdAt: serverTimestamp(), sessionId, mode: chatMode });
    if (!silent) {
        alert("Chat saved to history!");
    }
  };

  const handleHeaderDelete = () => {
    if (window.confirm("Are you sure you want to delete this session? This cannot be undone.")) {
        const temporaryChatRef = ref(rtdb, `temporary_chats/${sessionId}/${user.uid}`);
        remove(temporaryChatRef);
        resetChat(chatMode, true);
        alert("Session chat deleted!");
    }
  };

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

  if (showSubscription) return <SubscriptionPopup />;

  return (
    <div ref={chatContainerRef} className="flex flex-col h-screen bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${getBackground()})` }}>
        {showModeSwitchPopup && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center"
                >
                    <h3 className="text-lg font-bold mb-2">Switching Modes</h3>
                    <p className="text-gray-600 mb-6">Do you want to save the current chat before switching?</p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleSaveAndSwitch}
                            className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                        >
                            Save and Switch
                        </button>
                        <button
                            onClick={handleDeleteAndSwitch}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                        >
                            Delete and Switch
                        </button>
                        <button
                            onClick={handleCancelSwitch}
                            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      <header className="bg-white/30 backdrop-blur-sm p-4 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-600">
            {user?.name || 'User'}
        </div>
        <div className="flex items-center gap-4">
            <div className="font-mono bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {formatTime(timer)}
            </div>
            <button onClick={() => handleSaveToHistory()} className="text-gray-500 hover:text-purple-600" title="Save Chat History">
                <Save className="w-6 h-6" />
            </button>
            <button onClick={handleHeaderDelete} className="text-gray-500 hover:text-red-600" title="Delete Session Chat">
                <Trash2 className="w-6 h-6" />
            </button>
        </div>
      </header>

      {error ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center p-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Chat Unavailable</h2>
            <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
        </div>
      ) : (
        <>
            <div className="flex justify-center my-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-full p-1 flex gap-1">
                    <button
                    onClick={() => handleModeSwitchAttempt('tea')}
                    className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${chatMode === 'tea' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-purple-100'}`}>
                    <Coffee className="w-5 h-5" />
                    Tea Time
                    </button>
                    <button
                    onClick={() => handleModeSwitchAttempt('study')}
                    className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${chatMode === 'study' ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-purple-100'}`}>
                    <BookOpen className="w-5 h-5" />
                    Study Session
                    </button>
                </div>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
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
