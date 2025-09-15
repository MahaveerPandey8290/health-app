import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, X, Zap, Star, Heart } from 'lucide-react';

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  timeUsed: number;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({ isOpen, onClose, onSubscribe, timeUsed }) => {

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 99,
      duration: '1 Month',
      features: ['Unlimited AI chat', 'Priority support'],
      color: 'purple',
    },
    {
      id: 'quarterly',
      name: '3 Months',
      price: 250,
      duration: '3 Months',
      features: ['Unlimited AI chat', 'Priority support', 'Early access to new features'],
      color: 'blue',
    },
    {
      id: 'half_yearly',
      name: '6 Months',
      price: 555,
      duration: '6 Months',
      features: ['Unlimited AI chat', 'Priority support', 'Early access to new features', 'Exclusive content'],
      color: 'pink',
    },
  ];

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
            className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Your Free Trial Has Ended! ⏰
              </h2>
              <p className="text-gray-600 text-lg mb-2">
                You've used <span className="font-bold text-purple-600">{formatTime(timeUsed)}</span> of free AI conversation time
              </p>
              <p className="text-gray-500">
                Continue your wellness journey with unlimited access
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className={`rounded-2xl p-6 border-2 border-${plan.color}-500 flex flex-col`}
                >
                  <h3 className={`text-2xl font-bold text-${plan.color}-500`}>{plan.name}</h3>
                  <p className="text-4xl font-bold mt-4">₹{plan.price}</p>
                  <p className="text-gray-500">{plan.duration}</p>
                  <ul className="mt-6 space-y-2 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className={`w-5 h-5 mr-2 text-${plan.color}-500`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSubscribe(plan.id)}
                    className={`w-full mt-auto bg-${plan.color}-500 text-white font-semibold py-3 rounded-lg mt-6`}
                  >
                    Subscribe
                  </motion.button>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8"
            >
              <p className="text-sm text-gray-500 mb-4">
                🔒 Secure payment • Cancel anytime • 7-day money-back guarantee
              </p>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Maybe later</button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionPopup;
