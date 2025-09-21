'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { userAPI } from '../../lib/api';
import Link from 'next/link';

export default function SalespersonsPage() {
  const [salespersons, setSalespersons] = useState([]);
  const [filteredSalespersons, setFilteredSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchSalespersons();
  }, []);

  useEffect(() => {
    filterAndSortSalespersons();
  }, [salespersons, searchTerm, filterStatus, sortBy]);

  const fetchSalespersons = async () => {
    try {
      const data = await userAPI.getAllSalespersons();
      setSalespersons(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch salespersons' });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSalespersons = () => {
    let filtered = salespersons.filter(person => {
      const matchesSearch = person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.designation && person.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.email && person.email.replace('bonhoeffer', 'company').toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = filterStatus === 'all' || person.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'lastCheckin':
          if (!a.last_location_update && !b.last_location_update) return 0;
          if (!a.last_location_update) return 1;
          if (!b.last_location_update) return -1;
          return new Date(b.last_location_update) - new Date(a.last_location_update);
        default:
          return 0;
      }
    });

    setFilteredSalespersons(filtered);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-900/20 text-green-300';
      case 'busy':
        return 'bg-red-900/20 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        );
      case 'busy':
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }    return (
      <ProtectedRoute allowedRoles={['crm', 'admin']}>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Sales Team Directory
            </h1>
            <p className="text-gray-400 mt-2">
              View all salespersons, their status, and contact information
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Team</p>
                  <p className="text-2xl font-bold text-white">{salespersons.length}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-white">
                    {salespersons.filter(sp => sp.status === 'available').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Busy</p>
                  <p className="text-2xl font-bold text-white">
                    {salespersons.filter(sp => sp.status === 'busy').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
                  Search Salespersons
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name, designation, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`input-field transition-all duration-200 ${searchTerm ? 'pl-4' : 'pl-10'}`}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-300 mb-2">
                  Filter by Status
                </label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="lastCheckin">Last Check-in</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salespersons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalespersons.map((person) => (
              <div key={person.id} className="glass-card p-6 card-hover">
                {/* Header with Photo and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {person.photo_url ? (
                      <img
                        src={person.photo_url}
                        alt={person.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {person.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {person.full_name}
                      </h3>
                      {person.designation && (
                        <p className="text-sm text-gray-400">
                          {person.designation}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(person.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(person.status)}`}>
                      {person.status}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <Link
                      href={`mailto:${person.email.replace('bonhoeffer', 'company')}`}
                      className="hover:text-primary transition-colors"
                    >
                      {person.email.replace('bonhoeffer', 'company')}
                    </Link>
                  </div>
                  
                  {person.phone && (
                    <div className="flex items-center text-sm text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${person.phone}`} className="hover:text-primary transition-colors">
                        {person.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Location and Last Check-in */}
                <div className="border-t border-gray-700 pt-4">
                  {person.current_latitude && person.current_longitude ? (
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>
                        {person.current_latitude.toFixed(4)}, {person.current_longitude.toFixed(4)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364" />
                      </svg>
                      <span>Location not available</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last seen: {formatDateTime(person.last_location_update)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {person.phone && (
                    <a
                      href={`tel:${person.phone}`}
                      className="btn-primary text-sm flex-1 text-center"
                    >
                      Call
                    </a>
                  )}
                  <a
                    href={`mailto:${person.email.replace('bonhoeffer', 'company')}`}
                    className="btn-secondary text-sm flex-1 text-center"
                  >
                    Email
                  </a>
                  {person.current_latitude && person.current_longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${person.current_latitude},${person.current_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm px-3"
                      title="View location on map"
                    >
                      Location
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredSalespersons.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">No salespersons found</h3>
              <p className="text-gray-400">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
