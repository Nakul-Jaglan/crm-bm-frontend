'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { assignmentAPI, locationAPI, getCurrentLocation } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function SalespersonPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await assignmentAPI.getAssignments();
      setAssignments(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch assignments' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    setIsUpdatingLocation(true);
    
    try {
      const location = await getCurrentLocation();
      await locationAPI.updateLocation(location.lat, location.lng);
      setCurrentLocation(location);
      setToast({ type: 'success', message: 'Location updated successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update location' });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-900/20 border-red-800';
      case 'medium': return 'text-yellow-300 bg-yellow-900/20 border-amber-800';
      case 'low': return 'text-green-300 bg-green-900/20 border-green-800';
      default: return 'text-gray-300 bg-gray-700 border-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-blue-300 bg-blue-900/20 border-blue-800';
      case 'accepted': return 'text-green-300 bg-green-900/20 border-green-800';
      case 'completed': return 'text-purple-300 bg-purple-900/20 border-purple-800';
      case 'rejected': return 'bg-red-900/20 text-red-300 border-red-800';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['salesperson']}>
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
              Welcome, {user?.full_name}
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your assigned leads and update your location
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Location Update Card */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location Check-in
              </h2>
              
              <div className="space-y-4">
                {user?.last_checkin && (
                  <div className="text-sm text-gray-400">
                    <span className="font-medium">Last check-in:</span> {formatDateTime(user.last_checkin)}
                  </div>
                )}
                
                {currentLocation && (
                  <div className="text-sm text-gray-400">
                    <span className="font-medium">Current coordinates:</span><br />
                    Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                  </div>
                )}
                
                <button
                  onClick={handleUpdateLocation}
                  disabled={isUpdatingLocation}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdatingLocation ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Updating Location...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Update My Location
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Quick Stats
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{assignments.length}</div>
                  <div className="text-sm text-gray-400">Total Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {assignments.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {assignments.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {assignments.filter(a => a.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-gray-400">In Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assignments List */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Assignments
            </h2>

            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">No assignments yet</h3>
                <p className="text-gray-400">Check back later for new lead assignments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {assignment.lead?.company_name}
                            </h3>
                            <p className="text-gray-400">
                              Contact: {assignment.lead?.contact_person}
                            </p>
                            {assignment.lead?.phone && (
                              <p className="text-gray-400">
                                Phone: {assignment.lead?.phone}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(assignment.lead?.priority)}`}>
                              {assignment.lead?.priority} priority
                            </span>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                              {assignment.status}
                            </span>
                          </div>
                        </div>
                        
                        {assignment.lead?.address && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-400">
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {assignment.lead?.address}
                            </p>
                          </div>
                        )}
                        
                        {assignment.notes && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-400">
                              <span className="font-medium">Notes:</span> {assignment.notes}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-500">
                          Assigned: {formatDateTime(assignment.assigned_at)}
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:flex-row gap-2">
                        {assignment.lead?.lat && assignment.lead?.lng && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${assignment.lead.lat},${assignment.lead.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-center"
                          >
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Get Directions
                          </a>
                        )}
                        
                        {assignment.lead?.phone && (
                          <a
                            href={`tel:${assignment.lead.phone}`}
                            className="btn-primary text-center"
                          >
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
