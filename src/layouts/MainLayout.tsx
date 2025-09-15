import React, { useState } from 'react';
import { ArrowLeft, Book, Coffee } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mode, setMode] = useState<'tea' | 'study'>('tea');

  return (
    <div 
      className="h-screen w-screen bg-cover bg-center flex flex-col p-4 sm:p-6 md:p-8"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-white/30 backdrop-blur-sm text-white">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">AI Wellness Companion</h1>
            <p className="text-sm text-white/80">Always here to listen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-white/80">9:29</p>
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <p className="text-sm text-white/80">Online</p>
        </div>
      </header>

      <div className="flex justify-center gap-4 mb-4">
        <button 
          onClick={() => setMode('tea')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${mode === 'tea' ? 'bg-purple-600 text-white' : 'bg-white/30 backdrop-blur-sm text-white'}`}>
          <Coffee />
          Tea Mode
        </button>
        <button 
          onClick={() => setMode('study')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${mode === 'study' ? 'bg-blue-600 text-white' : 'bg-white/30 backdrop-blur-sm text-white'}`}>
          <Book />
          Study Mode
        </button>
      </div>

      <main className="flex-grow overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
