import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowLeft, User, Phone, MapPin, Globe } from 'lucide-react';
import FloatingShapes from './FloatingShapes';

interface CreateAccountScreenProps {
  onCreateAccount: (userData: UserRegistrationData) => void;
  onBackToLogin: () => void;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: string;
  mobileNumber: string;
  country: string;
  address: string;
  pincode: string;
}

const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ 
  onCreateAccount, 
  onBackToLogin 
}) => {
  const [formData, setFormData] = useState<UserRegistrationData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    mobileNumber: '',
    country: '',
    address: '',
    pincode: ''
  });

  const [errors, setErrors] = useState<Partial<UserRegistrationData>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
    'France', 'Japan', 'India', 'Brazil', 'Mexico', 'South Africa', 'Other'
  ];

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  const handleInputChange = (field: keyof UserRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<UserRegistrationData> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 2) {
      if (!formData.age) newErrors.age = 'Age is required';
      else if (parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
        newErrors.age = 'Please enter a valid age';
      }
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
      else if (!/^\+?[\d\s-()]{10,}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Please enter a valid mobile number';
      }
    }

    if (step === 3) {
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (!/^\d{4,10}$/.test(formData.pincode)) {
        newErrors.pincode = 'Please enter a valid pincode';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      onCreateAccount(formData);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Details</h2>
        <p className="text-gray-600 text-sm">Let's start with your basic information</p>
      </div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${
              errors.name ? 'border-red-300' : 'border-purple-200'
            } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
            placeholder="Enter your full name"
          />
        </div>
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border ${
            errors.email ? 'border-red-300' : 'border-purple-200'
          } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
          placeholder="Enter your email address"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border ${
            errors.password ? 'border-red-300' : 'border-purple-200'
          } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
          placeholder="Create a password"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border ${
            errors.confirmPassword ? 'border-red-300' : 'border-purple-200'
          } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
      </motion.div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h2>
        <p className="text-gray-600 text-sm">Tell us a bit more about yourself</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border ${
              errors.age ? 'border-red-300' : 'border-purple-200'
            } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
            placeholder="Age"
            min="13"
            max="120"
          />
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender *
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border ${
              errors.gender ? 'border-red-300' : 'border-purple-200'
            } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
          >
            <option value="">Select Gender</option>
            {genderOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </motion.div>
      </div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${
              errors.mobileNumber ? 'border-red-300' : 'border-purple-200'
            } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
            placeholder="Enter your mobile number"
          />
        </div>
        {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
      </motion.div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Address Information</h2>
        <p className="text-gray-600 text-sm">Where can we reach you?</p>
      </div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country *
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${
              errors.country ? 'border-red-300' : 'border-purple-200'
            } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${
              errors.address ? 'border-red-300' : 'border-purple-200'
            } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 resize-none`}
            placeholder="Enter your full address"
            rows={3}
          />
        </div>
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pincode *
        </label>
        <input
          type="text"
          value={formData.pincode}
          onChange={(e) => handleInputChange('pincode', e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border ${
            errors.pincode ? 'border-red-300' : 'border-purple-200'
          } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50`}
          placeholder="Enter pincode"
        />
        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <FloatingShapes />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-8 w-full max-w-md"
        >
          {/* Header */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center items-center mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBackToLogin}
                className="absolute left-0 p-2 text-gray-600 hover:text-gray-800 hover:bg-purple-100 rounded-xl transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
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
                className="bg-gradient-to-r from-purple-400 to-blue-400 p-3 rounded-full mr-3"
              >
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </motion.div>
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm">
              Join our wellness community
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                      : 'bg-gray-300'
                  }`}
                  animate={{ scale: step === currentStep ? 1.2 : 1 }}
                />
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-300 transition-all duration-300"
                >
                  Previous
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                type={currentStep === 3 ? "submit" : "button"}
                onClick={currentStep === 3 ? undefined : handleNext}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
              >
                {currentStep === 3 ? 'Create Account' : 'Next'}
              </motion.button>
            </div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-sm text-gray-500 mt-6"
          >
            Already have an account? 
            <button
              onClick={onBackToLogin}
              className="text-purple-500 font-medium hover:text-purple-600 ml-1 transition-colors"
            >
              Sign in
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAccountScreen;