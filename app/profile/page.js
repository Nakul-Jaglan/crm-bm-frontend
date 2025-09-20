'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import Navbar from '../../components/Navbar';
import Toast from '../../components/Toast';
import ImageCropper from '../../components/ImageCropper';
import api, { userAPI } from '../../lib/api';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Edit3, Camera } from 'lucide-react';

function ProfileView() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    territory: '',
    role: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/me');
      setProfileData({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        territory: response.data.territory || '',
        role: response.data.role || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Error loading profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for update (excluding email, phone, and role)
      const updateData = {
        full_name: profileData.full_name,
        address: profileData.address,
        territory: profileData.territory
      };

      const response = await api.put(`/users/${user.id}`, updateData);
      
      // Update the auth context with new data
      setUser({ ...user, ...updateData });
      
      setIsEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 10MB for original file)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image must be less than 10MB', 'error');
      return;
    }

    // Store the selected file and show cropper
    setSelectedImageFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedFile) => {
    try {
      setUploadingPhoto(true);
      setShowCropper(false);
      
      const response = await userAPI.uploadProfilePicture(croppedFile);
      
      // Update user data with new photo URL
      const updatedUser = { ...user, photo_url: response.photo_url };
      setUser(updatedUser);
      
      showToast('Profile picture updated successfully', 'success');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast('Error uploading profile picture', 'error');
    } finally {
      setUploadingPhoto(false);
      setSelectedImageFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImageFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      // Validate file size (max 10MB for original file)
      if (file.size > 10 * 1024 * 1024) {
        showToast('Image must be less than 10MB', 'error');
        return;
      }

      // Store the selected file and show cropper
      setSelectedImageFile(file);
      setShowCropper(true);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-900/20 text-purple-300 border-purple-500/30';
      case 'executive': return 'bg-orange-900/20 text-orange-300 border-orange-500/30';
      case 'crm': return 'bg-blue-900/20 text-blue-300 border-blue-500/30';
      case 'hr': return 'bg-green-900/20 text-green-300 border-green-500/30';
      case 'salesperson': return 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-900/20 text-gray-300 border-gray-500/30';
    }
  };

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return null;
    // If the URL already starts with http, return as is
    if (photoUrl.startsWith('http')) return photoUrl;
    // If it's a relative path, prepend the backend URL
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photoUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark transition-colors duration-300">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-montserrat">
                My Profile
              </h1>
              <p className="text-gray-400 mt-2">
                Manage your personal information and account settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex cursor-pointer items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfileData(); // Reset data
                    }}
                    className="px-4 cursor-pointer py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex cursor-pointer items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    {saving ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-8">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-700">
            <div 
              className={`relative group transition-all duration-200 ${isDragOver ? 'scale-105 ring-4 ring-blue-500 ring-opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {user.photo_url ? (
                <img
                  src={getImageUrl(user.photo_url)}
                  alt={profileData.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center border-4 border-gray-600">
                  <span className="text-white text-2xl font-bold">
                    {profileData.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Photo Upload Overlay */}
              <button
                onClick={triggerPhotoUpload}
                disabled={uploadingPhoto}
                className={`absolute cursor-pointer inset-0 bg-black rounded-full flex flex-col items-center justify-center transition-opacity duration-200 disabled:opacity-50 ${
                  isDragOver 
                    ? 'opacity-100 bg-opacity-70' 
                    : 'bg-opacity-50 opacity-0 group-hover:opacity-100'
                }`}
              >
                {uploadingPhoto ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-white text-xs font-medium">
                      {isDragOver ? 'Drop Image' : 'Edit Photo'}
                    </span>
                  </>
                )}
              </button>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {profileData.full_name}
              </h2>
              <p className="text-gray-400 mb-2">{profileData.email}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(profileData.role)}`}>
                <Shield className="w-4 h-4 mr-1" />
                {profileData.role.toUpperCase()}
              </span>
              <p className="text-xs text-gray-500 mt-2">
                Click to upload or drag & drop an image to crop
              </p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white">
                  {profileData.full_name || 'Not specified'}
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
                <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
              </label>
              <div className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-400 cursor-not-allowed">
                {profileData.email}
              </div>
            </div>

            {/* Phone (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
                <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
              </label>
              <div className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-400 cursor-not-allowed">
                {profileData.phone || 'Not specified'}
              </div>
            </div>

            {/* Territory */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Territory/Region
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.territory}
                  onChange={(e) => handleInputChange('territory', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your territory/region"
                />
              ) : (
                <div className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white">
                  {profileData.territory || 'Not specified'}
                </div>
              )}
            </div>

            {/* Address */}
            {/* <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Enter your address"
                />
              ) : (
                <div className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white min-h-[80px]">
                  {profileData.address || 'Not specified'}
                </div>
              )}
            </div> */}
          </div>

          {/* Account Information */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Member Since
                </label>
                <div className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-400">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Account Role
                </label>
                <div className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-400">
                  {profileData.role.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-300">Security Notice</h4>
                <p className="text-sm text-blue-400 mt-1">
                  For security reasons, email and phone number changes require administrator approval. 
                  Contact your system administrator if you need to update these fields.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* Image Cropper Modal */}
      <ImageCropper
        imageFile={selectedImageFile}
        isOpen={showCropper}
        onCrop={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'executive', 'crm', 'hr', 'salesperson']}>
      <ProfileView />
    </ProtectedRoute>
  );
}
