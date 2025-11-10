'use client';
import React, { useState } from 'react';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    location: '',
    email: '',
    phone: '',
    bio: '',
    country: '',
    cityState: '',
    profileImage: ''
  });

  const [tempData, setTempData] = useState({...profileData});

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setTempData({...profileData});
  };

  const handleCancel = () => {
    setEditingSection(null);
    setTempData({...profileData});
  };

  const handleSave = () => {
    setProfileData({...tempData});
    setEditingSection(null);
  };

  const handleChange = (field: keyof typeof profileData, value: string) => {
    setTempData({...tempData, [field]: value});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageUpload called');
    const file = e.target.files?.[0];
    console.log('File selected:', file?.name);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result as string;
        console.log('Image uploaded, length:', newImage.length);
        setProfileData(prev => {
          const updated = {...prev, profileImage: newImage};
          console.log('Updated profileData:', updated.profileImage.substring(0, 50));
          return updated;
        });
        setTempData(prev => ({...prev, profileImage: newImage}));
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  const getInitials = () => {
    const firstInitial = profileData.firstName ? profileData.firstName[0].toUpperCase() : '';
    const lastInitial = profileData.lastName ? profileData.lastName[0].toUpperCase() : '';
    return firstInitial + lastInitial || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar profileImage={profileData.profileImage || undefined} userInitials={getInitials()} />

      {/* Profile Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

          {/* Profile Card - Display Only with Clickable Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-green-500 flex items-center justify-center">
                  {profileData.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      style={{ display: 'block' }}
                    />
                  ) : (
                    <span className="text-white text-xl font-semibold">{getInitials()}</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Click to upload profile picture"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profileData.firstName || profileData.lastName 
                    ? `${profileData.firstName} ${profileData.lastName}`.trim() 
                    : 'Name not set'}
                </h2>
                <p className="text-gray-600">{profileData.title || 'Title not set'}</p>
                <p className="text-sm text-gray-500">{profileData.location || 'Location not set'}</p>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal information</h3>
              {editingSection === 'personal' ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-white bg-green-400 hover:bg-green-400 rounded-md"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEdit('personal')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                >
                  Edit
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">First Name</label>
                {editingSection === 'personal' ? (
                  <input
                    type="text"
                    value={tempData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="First Name"
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.firstName || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                {editingSection === 'personal' ? (
                  <input
                    type="text"
                    value={tempData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Last Name"
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.lastName || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Title</label>
                {editingSection === 'personal' ? (
                  <input
                    type="text"
                    value={tempData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Title"
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.title || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Location</label>
                {editingSection === 'personal' ? (
                  <input
                    type="text"
                    value={tempData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Location"
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.location || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email address</label>
                {editingSection === 'personal' ? (
                  <input
                    type="email"
                    value={tempData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.email || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                {editingSection === 'personal' ? (
                  <input
                    type="tel"
                    value={tempData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.phone || 'Not set'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-500 mb-1">Bio</label>
                {editingSection === 'personal' ? (
                  <textarea
                    value={tempData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{profileData.bio || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Address</h3>
              {editingSection === 'address' ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-white bg-green-400 hover:bg-green-400 rounded-md"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEdit('address')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                >
                  Edit
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Country</label>
                {editingSection === 'address' ? (
                  <input
                    type="text"
                    value={tempData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Country"
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.country || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">City / State</label>
                {editingSection === 'address' ? (
                  <input
                    type="text"
                    value={tempData.cityState}
                    onChange={(e) => handleChange('cityState', e.target.value)}
                    placeholder="City, State"
                    className="w-full text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.cityState || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}