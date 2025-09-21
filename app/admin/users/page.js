'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Toast from '../../../components/Toast';
import { adminAPI } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { user: currentUser } = useAuth();

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'salesperson',
    phone: '',
    designation: '',
  });

  const [editUser, setEditUser] = useState({
    full_name: '',
    role: '',
    phone: '',
    designation: '',
    email: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to fetch users'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await adminAPI.createUser(newUser);
      setToast({
        type: 'success',
        message: 'User created successfully!'
      });
      
      setShowCreateModal(false);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'salesperson',
        phone: '',
        designation: '',
      });
      
      fetchUsers();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to create user'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      full_name: user.full_name || '',
      role: user.role || '',
      phone: user.phone || '',
      designation: user.designation || '',
      email: user.email.replace('bonhoeffer', 'company') || '',
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await adminAPI.updateUser(selectedUser.id, editUser);
      setToast({
        type: 'success',
        message: 'User updated successfully!'
      });
      
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to update user'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (deleteConfirmText !== 'CONFIRM') {
      setToast({
        type: 'error',
        message: 'Please type "CONFIRM" to delete the user'
      });
      return;
    }

    try {
      await adminAPI.deleteUser(selectedUser.id);
      setToast({
        type: 'success',
        message: 'User deleted successfully'
      });
      setShowDeleteModal(false);
      setSelectedUser(null);
      setDeleteConfirmText('');
      fetchUsers();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to delete user'
      });
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewUser(prev => ({ ...prev, password }));
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900/20 text-red-300';
      case 'hr':
        return 'bg-purple-900/20 text-purple-300';
      case 'crm':
        return 'bg-blue-900/20 text-blue-300';
      case 'salesperson':
        return 'bg-green-900/20 text-green-300';
      case 'executive':
        return 'bg-orange-900/20 text-orange-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-900/20 text-green-300'
      : 'bg-red-900/20 text-red-300';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.replace('bonhoeffer', 'company').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.designation && user.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'executive']}>
      <div className="min-h-screen bg-bg-dark transition-colors duration-300">
        <Navbar />
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                User Management
              </h1>
              <p className="text-gray-400 mt-2">
                Manage all system users and their permissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary cursor-pointer flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create User
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.is_active).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Salespersons</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.role === 'salesperson').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Staff</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => ['admin', 'hr', 'crm'].includes(u.role)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
                  Search Users
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, email, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="filterRole" className="block text-sm font-medium text-gray-300 mb-2">
                  Filter by Role
                </label>
                <select
                  id="filterRole"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="hr">HR</option>
                  <option value="crm">CRM</option>
                  <option value="salesperson">Salesperson</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/50 divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.photo_url ? (
                            <img 
                              src={user.photo_url.startsWith('http') ? user.photo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.photo_url}`} 
                              alt={user.full_name} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-600" 
                              onError={(e) => {
                                console.log('Image failed to load:', e.target.src);
                                // Hide the image and show fallback
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center" 
                            style={{ display: user.photo_url ? 'none' : 'flex' }}
                          >
                            <span className="text-white font-bold">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.email.replace('bonhoeffer', 'company')}
                            </div>
                            {user.designation && (
                              <div className="text-xs text-gray-500">
                                {user.designation}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.is_active)}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user.phone || 'No phone'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.id !== currentUser?.id && (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-400 cursor-pointer hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-400 cursor-pointer hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
                <p className="text-gray-400">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    Create New User
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 cursor-pointer hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.full_name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                      className="input-field"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      required
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className="input-field"
                    >
                      <option value="salesperson">Salesperson</option>
                      <option value="crm">CRM Staff</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={newUser.designation}
                      onChange={(e) => setNewUser(prev => ({ ...prev, designation: e.target.value }))}
                      className="input-field"
                      placeholder="Sales Executive, CRM Manager, etc."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="input-field flex-1"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="btn-secondary cursor-pointer px-4 whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    Edit User: {selectedUser.full_name}
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 cursor-pointer hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateUser} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editUser.full_name}
                      onChange={(e) => setEditUser(prev => ({ ...prev, full_name: e.target.value }))}
                      className="input-field"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      required
                      value={editUser.role}
                      onChange={(e) => setEditUser(prev => ({ ...prev, role: e.target.value }))}
                      className="input-field"
                    >
                      <option value="salesperson">Salesperson</option>
                      <option value="crm">CRM Staff</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editUser.phone}
                      onChange={(e) => setEditUser(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={editUser.designation}
                      onChange={(e) => setEditUser(prev => ({ ...prev, designation: e.target.value }))}
                      className="input-field"
                      placeholder="Sales Executive, CRM Manager, etc."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editUser.is_active}
                        onChange={(e) => setEditUser(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-300">Active User</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isUpdating ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    Delete User
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 cursor-pointer hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.882 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">
                      Delete {selectedUser.full_name}?
                    </h4>
                    <p className="text-sm text-gray-400">
                      This action cannot be undone. This will permanently delete the user account and remove all associated data.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type "CONFIRM" to delete this user:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="input-field"
                    placeholder="Type CONFIRM here"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    disabled={deleteConfirmText !== 'CONFIRM'}
                    className="bg-red-600 cursor-pointer hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
