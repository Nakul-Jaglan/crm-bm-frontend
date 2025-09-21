'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Demo user credentials
  const demoUsers = [
    {
      role: 'Admin',
      email: 'admin@bonhoeffer.com',
      password: 'admin123',
      description: 'Full system access',
      icon: '👑',
      color: 'from-purple-500 to-purple-700'
    },
    {
      role: 'CRM Manager',
      email: 'crm@bonhoeffer.com',
      password: 'crm123',
      description: 'Lead management & analytics',
      icon: '📊',
      color: 'from-blue-500 to-blue-700'
    },
    {
      role: 'HR Manager',
      email: 'hr@bonhoeffer.com',
      password: 'hr123',
      description: 'Employee onboarding',
      icon: '👥',
      color: 'from-green-500 to-green-700'
    },
    {
      role: 'Executive',
      email: 'executive@bonhoeffer.com',
      password: 'exec123',
      description: 'Reports & insights',
      icon: '📈',
      color: 'from-yellow-500 to-yellow-700'
    },
    {
      role: 'Salesperson',
      email: 'raj.kumar@bonhoeffer.com',
      password: 'raj123',
      description: 'Field operations & leads',
      icon: '🎯',
      color: 'from-red-500 to-red-700'
    }
  ];

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

  const handleDemoLogin = async (demoUser) => {
    setIsLoading(true);

    try {
      const result = await login(demoUser.email, demoUser.password);
      
      if (result.success) {
        setToast({ type: 'success', message: `Logged in as ${demoUser.role}!` });
        
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
            <h2 className="text-3xl font-bold text-white">
              Login To CRM
            </h2>
            <p className="text-gray-400 mt-2">
              Choose a role to explore our CRM Software
            </p>
          </div>

          {/* Demo Login Buttons */}
          <div className="space-y-4">
            {demoUsers.map((demoUser, index) => (
              <button
                key={index}
                onClick={() => handleDemoLogin(demoUser)}
                disabled={isLoading}
                className={`w-full p-4 rounded-xl bg-gray-700 hover:bg-gray-800 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                <div className="flex items-center space-x-4">
                  {/* <div className="text-2xl">{demoUser.icon}</div> */}
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold text-lg">
                      {isLoading ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="small" className="mr-2" />
                          Logging in...
                        </div>
                      ) : (
                        `Login as ${demoUser.role}`
                      )}
                    </div>
                    <div className="text-white/80 text-sm">
                      {demoUser.description}
                    </div>
                  </div>
                  <div className="text-white/60 text-2xl">→</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>&copy; 2025 <strong className='text-[#999B30]'><Link href="https://github.com/Nakul-Jaglan">Nakul</Link></strong>. All rights reserved.</p>
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
