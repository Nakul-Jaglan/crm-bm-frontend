'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      let redirectPath = '/dashboard'; // default
      
      if (user.role === 'salesperson') {
        redirectPath = '/salesperson';
      } else if (user.role === 'executive') {
        redirectPath = '/reports';
      } else if (user.role === 'hr') {
        redirectPath = '/hr/onboarding';
      }
      
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setToast({ type: 'success', message: 'Login successful!' });
        
        // Immediate redirect for specific roles
        if (result.user && result.user.role === 'executive') {
          router.push('/reports');
        } else if (result.user && result.user.role === 'hr') {
          router.push('/hr/onboarding');
        }
        // Other redirects will happen via useEffect
      } else {
        setToast({ type: 'error', message: result.error });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark to-gray-900 flex items-center justify-center px-4 transition-colors duration-300">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-md w-full space-y-8">
        <div className="glass-card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-neon">
              <img src="/logo.png" alt="Bonhoeffer Machines" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-2">
              Sign in to Bonhoeffer Machines CRM
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Demo Accounts:</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <p><span className="font-medium">Admin:</span> admin@bonhoeffer.com / admin123</p>
              <p><span className="font-medium">HR:</span> hr@bonhoeffer.com / hr123</p>
              <p><span className="font-medium">CRM:</span> crm@bonhoeffer.com / crm123</p>
              <p><span className="font-medium">Executive:</span> executive@bonhoeffer.com / exec123</p>
              <p><span className="font-medium">Salesperson:</span> raj.kumar@bonhoeffer.com / raj123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>&copy; 2025 Bonhoeffer Machines. All rights reserved.</p>
        </div>
      </div>

      {/* Floating How It Works Button */}
      <Link href="/howitworks">
        <div className="fixed bottom-6 right-6 cursor-pointer">
          <div className="bg-[#999b30] hover:bg-primary-dark text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
            <HelpCircle size={20} />
            <span className="text-sm font-medium whitespace-nowrap">
              How it works
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
