'use client';

import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return null;
    // If the URL already starts with http, return as is
    if (photoUrl.startsWith('http')) return photoUrl;
    // If it's a relative path, prepend the backend URL
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photoUrl}`;
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', roles: ['crm', 'admin'] },
    { name: 'Salesperson View', href: '/salesperson', roles: ['salesperson'] },
    { name: 'All Salespersons', href: '/salespersons', roles: ['crm', 'admin'] },
    { name: 'Map View', href: '/map', roles: ['crm', 'admin', 'executive'] },
    { name: 'Reports', href: '/reports', roles: ['crm', 'executive'] },
    { name: 'HR Onboarding', href: '/hr/onboarding', roles: ['hr', 'admin'] },
    { name: 'User Management', href: '/admin/users', roles: ['admin', 'executive'] },
  ];

  const userNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="Bonhoeffer Machines" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold text-xl text-white">
                Bonhoeffer Machines
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {userNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-primary transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user.role.toUpperCase()}
                  </p>
                </div>
                {user.photo_url ? (
                  <img
                    src={getImageUrl(user.photo_url)}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 hover:border-primary transition-colors"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-gray-600 hover:border-primary transition-colors">
                    <span className="text-white text-sm font-medium">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-lg border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      {user.photo_url ? (
                        <img
                          src={getImageUrl(user.photo_url)}
                          alt={user.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{user.full_name}</p>
                        <p className="text-gray-400 text-sm capitalize">{user.role}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Edit Profile
                    </Link>
                    
                    <div className="border-t border-gray-700 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            {userNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Profile and Logout */}
            <div className="border-t border-gray-700 mt-4 pt-4">
              <Link
                href="/profile"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-primary hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Edit Profile
              </Link>
              
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
