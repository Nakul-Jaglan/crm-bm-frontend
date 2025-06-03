'use client';

import { useState } from 'react';
import Navbar from '../../../components/Navbar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Toast from '../../../components/Toast';
import { adminAPI } from '../../../lib/api';

export default function HROnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'salesperson',
    phone: '',
    designation: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminAPI.createUser(formData);
      setToast({
        type: 'success',
        message: `${formData.role === 'salesperson' ? 'Salesperson' : 'CRM Staff'} onboarded successfully!`
      });
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'salesperson',
        phone: '',
        designation: '',
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to onboard user'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };    return (
      <ProtectedRoute allowedRoles={['hr', 'admin']}>
        <div className="min-h-screen bg-bg-dark transition-colors duration-300">
          <Navbar />
          
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">
                Employee Onboarding
              </h1>
              <p className="text-gray-400 mt-2">
                Create accounts for new sales team members and CRM staff
              </p>
            </div>

          {/* Onboarding Form */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="salesperson">Salesperson</option>
                    <option value="crm">CRM Staff</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-300 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Sales Executive, CRM Manager, etc."
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-field flex-1"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="btn-secondary px-4 whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Instructions */}
          <div className="mt-8 glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Onboarding Instructions
            </h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center mr-3 mt-0.5">1</div>
                <p>Fill in the employee's basic information including full name and email address.</p>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center mr-3 mt-0.5">2</div>
                <p>Select the appropriate role: <strong>Salesperson</strong> for field sales staff or <strong>CRM Staff</strong> for office-based team members.</p>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center mr-3 mt-0.5">3</div>
                <p>Generate a secure password or create a custom one. Share these credentials securely with the new employee.</p>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center mr-3 mt-0.5">4</div>
                <p>Instruct the employee to change their password upon first login for security.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
