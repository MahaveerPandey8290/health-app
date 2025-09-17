import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase-config';
import { updateProfile } from 'firebase/auth';

interface CreateAccountScreenProps {
  isOpen: boolean;
  onComplete: (displayName: string) => void;
}

const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ isOpen, onComplete }) => {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (auth.currentUser?.displayName) {
      setDisplayName(auth.currentUser.displayName);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim() && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
        onComplete(displayName.trim());
      } catch (error) {
        console.error("Error updating profile: ", error);
        // Handle error appropriately
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm"
          >
            <div className="text-center">
              <div className="mb-6">
                <p className="text-lg font-semibold">What should I call you?</p>
              </div>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your preferred name"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!displayName.trim()}
                  className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg disabled:opacity-50 transition-all"
                >
                  Continue
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateAccountScreen;
