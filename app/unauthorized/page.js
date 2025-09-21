'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Home, HelpCircle } from 'lucide-react';

export default function UnauthorizedPage() {
    const { user, logout } = useAuth();
    
    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark to-gray-900 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-lg w-full space-y-8">
        <div className="glass-card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-4">
            {/* <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-red-400" />
            </div> */}
            <h1 className="text-3xl font-bold text-white mb-3">
              Access Denied
            </h1>
            <p className="text-gray-400 text-lg">
              You don&apos;t have permission to access this page
            </p>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-3">What happened?</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your current role doesn&apos;t have the necessary permissions to view this content.
                Please contact your administrator if you believe this is an error.
              </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center text-lg text-gray-100 font-semibold">
                    <span>Here is what you can do:</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Contact your system administrator</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Return to your dashboard</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Try logging in with different credentials</span>
                </div>
            </div>
          </div>

          {/* Action Buttons */}
            <div className="space-y-4">
                {/* <button
                    onClick={() => router.back()}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                    <ArrowLeft size={18} />
                    <span>Go Back</span>
                </button> */}

                <Link href="/login">
                    <button className="w-full btn-primary flex items-center justify-center space-x-2">
                        <Home size={18} />
                        <span>Return to Home Page</span>
                    </button>
                </Link>

                <Link href="/login" onClick={() => {handleLogout()}}>
                    <button className="w-full btn-secondary flex items-center justify-center space-x-2 mt-4">
                        <Shield size={18} />
                        <span>Switch Account</span>
                    </button>
                </Link>
            </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Need help?</p>
              <p className="text-gray-500 text-xs">
                Contact support at{' '}
                <span className="text-primary">jaglan.nakul@gmail.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="text-center text-sm text-gray-400">
          <p>&copy; 2025 Bonhoeffer Machines. All rights reserved.</p>
        </div> */}
      </div>

      {/* Floating How It Works Button */}
      {/* <Link href="/howitworks">
        <div className="fixed bottom-6 right-6 cursor-pointer">
          <div className="bg-[#999b30] hover:bg-primary-dark text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
            <HelpCircle size={20} />
            <span className="text-sm font-medium whitespace-nowrap">
              How it works
            </span>
          </div>
        </div>
      </Link> */}
    </div>
  );
}
