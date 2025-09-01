import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, X, Zap, Star, Heart } from 'lucide-react';

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  timeUsed: number;
}

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({ 
  isOpen, 
  onClose, 
  onSubscribe, 
  timeUsed 
}) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '₹99',
      duration: '/month',
      features: [
        'Unlimited AI video calls',
        'Premium voice responses',
        'Advanced wellness features',
        'Priority support'
      ],
      gradient: 'from-purple-500 to-blue-500',
      popular: false,
      icon: Crown
    },
    {
      id: 'quarterly',
      name: 'Quarterly Plan',
      price: '₹250',
      duration: '/3 months',
      originalPrice: '₹297',
      features: [
        'Everything in Monthly',
        'Mood tracking analytics',
        'Personalized wellness plans',
        'Export conversation history',
        '15% savings'
      ],
      gradient: 'from-pink-500 to-purple-500',
      popular: true,
      icon: Star
    },
    {
      id: 'biannual',
      name: 'Bi-Annual Plan',
      price: '₹555',
      duration: '/6 months',
      originalPrice: '₹594',
      features: [
        'Everything in Quarterly',
        'Advanced AI personality',
        'Custom avatar options',
        'Wellness goal tracking',
        'Family sharing (2 accounts)',
        '7% additional savings'
      ],
      gradient: 'from-orange-500 to-pink-500',
      popular: false,
      icon: Heart
    }
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="text-center mb-8 relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute -top-4 -right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>

              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="inline-block mb-4"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Your Free Trial Has Ended! ⏰
              </h2>
              <p className="text-gray-600 text-lg mb-2">
                You've used <span className="font-bold text-purple-600">{formatTime(timeUsed)}</span> of free AI conversation time
              </p>
              <p className="text-gray-500">
                Continue your wellness journey with unlimited access to Lexi
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                  }}
                  className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 ${
                    plan.popular 
                      ? 'border-purple-400 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold"
                    >
                      🔥 MOST POPULAR
                    </motion.div>
                  )}

                  <div className="text-center">
                    {/* Plan Icon */}
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} mb-4`}
                    >
                      <plan.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Plan Name */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {plan.name}
                    </h3>

                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold text-gray-800">
                          {plan.price}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {plan.duration}
                        </span>
                      </div>
                      {plan.originalPrice && (
                        <p className="text-sm text-gray-500 line-through mt-1">
                          {plan.originalPrice}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + featureIndex * 0.1 }}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Subscribe Button */}
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSubscribe(plan.id)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-purple-100 hover:to-blue-100'
                      }`}
                    >
                      {plan.popular ? (
                        <span className="flex items-center justify-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>Choose Plan</span>
                        </span>
                      ) : (
                        'Select Plan'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="text-sm text-gray-500 mb-4">
                🔒 Secure payment • Cancel anytime • 7-day money-back guarantee
              </p>
              <div className="flex justify-center space-x-6 text-xs text-gray-400">
                <span>✓ No hidden fees</span>
                <span>✓ Instant activation</span>
                <span>✓ 24/7 support</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionPopup;