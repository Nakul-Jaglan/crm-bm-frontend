'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Link from 'next/link';
import { Globe, ArrowRight, Users, MapPin, PieChart, Zap } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not authenticated, show landing page
        setShowLanding(true);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-300">Loading Bonhoeffer Machines CRM...</p>
        </div>
      </div>
    );
  }

  if (!showLanding) {
    return null;
  }

  // Landing Page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Bonhoeffer Machines CRM</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/howitworks" 
                className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg"
              >
                How It Works
              </Link>
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg"
              >
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Streamline Your Sales <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Across India
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              A comprehensive CRM solution designed specifically for Indian sales teams with intelligent lead management, 
              real-time GPS tracking, and advanced analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link 
                href="/howitworks"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>See How It Works</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/login"
                className="flex items-center space-x-2 border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-semibold hover:border-gray-500 hover:text-white transition-all duration-200"
              >
                <span>Try Demo</span>
              </Link>
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Users className="w-6 h-6" />, text: "5 User Roles", desc: "Admin, Executive, CRM, HR, Salesperson" },
                { icon: <MapPin className="w-6 h-6" />, text: "GPS Tracking", desc: "Real-time location updates" },
                { icon: <Zap className="w-6 h-6" />, text: "Live Updates", desc: "Instant synchronization" },
                { icon: <PieChart className="w-6 h-6" />, text: "Analytics", desc: "Comprehensive reporting" }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center"
                >
                  <div className="text-blue-400 mb-3 flex justify-center">{feature.icon}</div>
                  <p className="text-white font-medium mb-1">{feature.text}</p>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Access Section */}
      <div className="bg-gray-800/30 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Quick Demo Access</h2>
            <p className="text-gray-400 mb-8">
              Experience our CRM with pre-configured demo accounts for each role
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { role: 'Admin', email: 'admin@bonhoeffer.com', description: 'Complete system control' },
                { role: 'CRM Manager', email: 'crm@bonhoeffer.com', description: 'Lead management hub' },
                { role: 'Salesperson', email: 'salesperson@bonhoeffer.com', description: 'Field operations' }
              ].map((demo, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                >
                  <div className="text-lg font-semibold text-white mb-2">{demo.role}</div>
                  <div className="text-sm text-gray-400 mb-4">{demo.description}</div>
                  <div className="text-xs text-gray-500">
                    <div><span className="font-medium">Email:</span> {demo.email}</div>
                    <div><span className="font-medium">Password:</span> Available on demo page</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/login"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                <span>Access Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/howitworks"
                className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg"
              >
                Learn more about the system →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Bonhoeffer Machines CRM</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Bonhoeffer Machines. Streamlining sales across India.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
