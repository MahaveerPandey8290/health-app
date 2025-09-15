import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType } from '../App';
import { 
  User, 
  Bell, 
  BarChart2, 
  Edit, 
  Save, 
  X, 
  Crown, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  CreditCard,
  Shield,
  Star,
  Clock,
  MessageCircle,
  Video,
  ArrowLeft,
  Settings,
  Award,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import maleAvatarImg from '../assets/images/male-avatar.png';
import femaleAvatarImg from '../assets/images/female-avatar.png';

interface UserProfileProps {
  user: UserType;
  onUpdateUser: (user: UserType) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const savedAvatar = localStorage.getItem('userAvatar');
  
  const getAvatarImage = () => {
    if (savedAvatar === 'male') return maleAvatarImg;
    if (savedAvatar === 'female') return femaleAvatarImg;
    return null;
  };

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'usage', label: 'Usage Stats', icon: BarChart2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const subscriptionData = {
    plan: 'Free Tier',
    status: 'Active',
    nextBilling: 'N/A',
    features: ['10 minutes daily chat', 'Basic AI responses', 'Standard support'],
    usage: {
      chatMinutes: 8,
      totalMinutes: 10,
      videoCalls: 0,
      totalVideoCalls: 0
    }
  };

  const usageStats = {
    totalSessions: 12,
    totalChatTime: '2h 45m',
    averageSessionTime: '13m',
    favoriteFeature: 'AI Chat',
    streakDays: 5,
    wellnessScore: 78
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Personal Information Card */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2 text-purple-600" />
            Personal Information
          </h3>
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-all"
            >
              <Edit className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                className="w-full p-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                className="w-full p-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="text"
                value={editedUser.age || ''}
                onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })}
                className="w-full p-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="Enter your age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={editedUser.gender || ''}
                onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value })}
                className="w-full p-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                value={editedUser.mobileNumber || ''}
                onChange={(e) => setEditedUser({ ...editedUser, mobileNumber: e.target.value })}
                className="w-full p-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={editedUser.country || ''}
                onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })}
                className="w-full p-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="United States"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={editedUser.address || ''}
                onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                className="w-full p-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="123 Main Street, City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
              <input
                type="text"
                value={editedUser.pincode || ''}
                onChange={(e) => setEditedUser({ ...editedUser, pincode: e.target.value })}
                className="w-full p-3 border border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="12345"
              />
            </div>
            <div className="md:col-span-2 flex space-x-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(false)}
                className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium text-gray-800">{user.mobileNumber || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-800">{user.age || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium text-gray-800">{user.country || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-800">{user.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Avatar</p>
                  <p className="font-medium text-gray-800">
                    {savedAvatar ? `${savedAvatar.charAt(0).toUpperCase() + savedAvatar.slice(1)} Avatar` : 'Not selected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Wellness Score</p>
              <p className="text-3xl font-bold">{usageStats.wellnessScore}</p>
            </div>
            <Award className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Streak Days</p>
              <p className="text-3xl font-bold">{usageStats.streakDays}</p>
            </div>
            <Star className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Total Sessions</p>
              <p className="text-3xl font-bold">{usageStats.totalSessions}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderSubscription = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Plan */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-500" />
            Current Plan
          </h3>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">{subscriptionData.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-4">
              <h4 className="text-2xl font-bold text-gray-800">{subscriptionData.plan}</h4>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>
            <div className="space-y-3">
              {subscriptionData.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
<<<<<<< HEAD
          <div className="space-y-4">
=======
          <div className_="space-y-4">
>>>>>>> 9a00a34 (avatar-update)
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Chat Usage</span>
                <span className="font-medium">{subscriptionData.usage.chatMinutes}/{subscriptionData.usage.totalMinutes} min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(subscriptionData.usage.chatMinutes / subscriptionData.usage.totalMinutes) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Video Calls</span>
                <span className="font-medium">{subscriptionData.usage.videoCalls}/{subscriptionData.usage.totalVideoCalls}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Upgrade to Premium
          </motion.button>
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
          <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
          Billing Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Next Billing Date</p>
            <p className="font-medium text-gray-800">{subscriptionData.nextBilling}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="font-medium text-gray-800">No payment method</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderUsageStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800">{usageStats.totalChatTime}</span>
          </div>
          <p className="text-gray-600">Total Chat Time</p>
        </div>
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <MessageCircle className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-800">{usageStats.averageSessionTime}</span>
          </div>
          <p className="text-gray-600">Avg Session Time</p>
        </div>
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Video className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-800">{usageStats.favoriteFeature}</span>
          </div>
          <p className="text-gray-600">Favorite Feature</p>
        </div>
      </div>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Daily wellness reminders</span>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Session completion notifications</span>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Weekly progress reports</span>
          <input type="checkbox" className="toggle" />
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h3>
      <div className="space-y-4">
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-all">
          Change Password
        </button>
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-all">
          Privacy Settings
        </button>
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-all">
          Data Export
        </button>
        <button className="w-full text-left p-3 hover:bg-red-50 text-red-600 rounded-xl transition-all">
          Delete Account
        </button>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'subscription':
        return renderSubscription();
      case 'usage':
        return renderUsageStats();
      case 'notifications':
        return renderNotifications();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-purple-100 p-4"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-purple-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Profile Settings</h1>
              <p className="text-sm text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-400 bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center shadow-lg">
                {getAvatarImage() ? (
                  <img 
                    src={getAvatarImage()!} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </motion.div>
            <div className="text-center md:text-left flex-grow">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since 2024
                </span>
                <span className="flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                  {subscriptionData.plan}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-2 mb-8 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/70 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserProfile;