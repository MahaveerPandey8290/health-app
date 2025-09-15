import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserType } from '../App';
import { User, Bell, BarChart2, Edit, Save, X } from 'lucide-react';
import maleAvatarImg from '../assets/images/male-avatar.png';
import femaleAvatarImg from '../assets/images/female-avatar.png';

interface UserProfileProps {
  user: UserType;
  onUpdateUser: (user: UserType) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('subscription');
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
    { id: 'subscription', label: 'Subscription', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'usage', label: 'Usage Stats', icon: BarChart2 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'subscription':
        return isEditing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editedUser.name} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} className="p-2 border rounded" />
                <input type="email" value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} className="p-2 border rounded" />
                <input type="text" value={editedUser.age} onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })} className="p-2 border rounded" placeholder="Age" />
                <input type="text" value={editedUser.gender} onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value })} className="p-2 border rounded" placeholder="Gender" />
                <input type="text" value={editedUser.mobileNumber} onChange={(e) => setEditedUser({ ...editedUser, mobileNumber: e.target.value })} className="p-2 border rounded" placeholder="Mobile" />
                <input type="text" value={editedUser.country} onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })} className="p-2 border rounded" placeholder="Country" />
                <input type="text" value={editedUser.address} onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })} className="p-2 border rounded" placeholder="Address" />
                <input type="text" value={editedUser.pincode} onChange={(e) => setEditedUser({ ...editedUser, pincode: e.target.value })} className="p-2 border rounded" placeholder="Pincode" />
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
           <p><strong>Avatar:</strong> {savedAvatar ? `${savedAvatar.charAt(0).toUpperCase() + savedAvatar.slice(1)} Avatar` : 'Not selected'}</p>
            <p><strong>Current Plan:</strong> Free Tier</p>
            <p><strong>Subscription Status:</strong> Active</p>
          </motion.div>
        );
      case 'notifications':
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>No new notifications.</motion.div>;
      case 'usage':
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Usage stats coming soon.</motion.div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400 bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                        {getAvatarImage() ? (
                            <img 
                                src={getAvatarImage()!} 
                                alt="User Avatar" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>
                <div>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded-full mr-2"><Save /></button>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-red-500 text-white rounded-full"><X /></button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="p-2 bg-blue-500 text-white rounded-full"><Edit /></button>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <div className="flex border-b">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center p-4 ${activeTab === tab.id ? 'border-b-2 border-blue-500' : ''}`}>
                            <tab.icon className="mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="mt-4">
                    {renderContent()}
                </div>
            </div>
        </motion.div>
    </div>
  );
};

export default UserProfile;
