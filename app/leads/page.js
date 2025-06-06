'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { leadAPI, userAPI, assignmentAPI, getCurrentLocation } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [nearbySalespersons, setNearbySalespersons] = useState([]);
  const [newLead, setNewLead] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    lat: '',
    lng: '',
    googleMapsLink: '',
    priority: 'warm',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsData, salespersonsData] = await Promise.all([
        leadAPI.getLeads(),
        userAPI.getAllSalespersons(),
      ]);

      setLeads(leadsData);
      setSalespersons(salespersonsData);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();

    // Validate that coordinates are available
    if (!newLead.lat || !newLead.lng) {
      setToast({ type: 'error', message: 'Location coordinates are required. Please provide a Google Maps link or use current location.' });
      return;
    }

    try {
      // Convert lat/lng to numbers and map to correct field names
      const leadData = {
        ...newLead,
        latitude: parseFloat(newLead.lat),
        longitude: parseFloat(newLead.lng),
      };

      // Remove the fields not needed for API
      delete leadData.lat;
      delete leadData.lng;
      delete leadData.googleMapsLink;

      await leadAPI.createLead(leadData);
      setToast({ type: 'success', message: 'Lead created successfully!' });
      setShowCreateLeadModal(false);
      setNewLead({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        lat: '',
        lng: '',
        googleMapsLink: '',
        priority: 'warm',
        notes: '',
      });
      fetchData();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create lead' });
    }
  };

  const extractCoordinatesFromGoogleMaps = async (url) => {
    try {
      if (!url.trim()) {
        setNewLead(prev => ({ ...prev, lat: '', lng: '' }));
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/resolve-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`,
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      
      if (data.success && data.coordinates) {
        setNewLead(prev => ({
          ...prev,
          lat: data.coordinates.lat,
          lng: data.coordinates.lng
        }));
        setToast({ type: 'success', message: 'Coordinates extracted successfully!' });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to extract coordinates from Google Maps link' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to process Google Maps link' });
    }
  };

  const useCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setNewLead(prev => ({
        ...prev,
        lat: location.lat.toString(),
        lng: location.lng.toString()
      }));
      setToast({ type: 'success', message: 'Current location set successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to get current location' });
    }
  };

  const handleAssignLead = async (lead) => {
    setSelectedLead(lead);
    
    try {
      const nearby = await userAPI.getNearbySalespersons(lead.latitude, lead.longitude);
      setNearbySalespersons(nearby);
      setShowAssignModal(true);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch nearby salespersons' });
    }
  };

  const handleAssign = async (salespersonId) => {
    try {
      await assignmentAPI.assignLead(selectedLead.id, salespersonId, `Lead assigned from leads page`);
      setToast({ type: 'success', message: 'Lead assigned successfully!' });
      setShowAssignModal(false);
      setSelectedLead(null);
      fetchData();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to assign lead' });
    }
  };

  const handleDeleteLead = (lead) => {
    setSelectedLead(lead);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const confirmDeleteLead = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setToast({
        type: 'error',
        message: 'Please type "DELETE" to confirm deletion'
      });
      return;
    }

    try {
      setIsDeleting(true);
      await leadAPI.deleteLead(selectedLead.id);
      setToast({
        type: 'success',
        message: 'Lead deleted successfully'
      });
      setShowDeleteModal(false);
      setSelectedLead(null);
      setDeleteConfirmText('');
      fetchData();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to delete lead'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'hot': return 'text-red-400 bg-red-900/20';
      case 'warm': return 'text-yellow-400 bg-yellow-900/20';
      case 'cold': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unassigned': return 'text-gray-400 bg-gray-900/20';
      case 'assigned': return 'text-blue-400 bg-blue-900/20';
      case 'contacted': return 'text-yellow-400 bg-yellow-900/20';
      case 'closed': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['crm', 'admin']}>
        <div className="min-h-screen bg-dark flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['crm', 'admin']}>
      <div className="min-h-screen bg-dark">
        <Navbar />
        
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Leads</h1>
              <p className="text-gray-400">Manage your sales leads</p>
            </div>
            <button
              onClick={() => setShowCreateLeadModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Lead</span>
            </button>
          </div>

          {/* Leads Table */}
          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 text-gray-300 font-medium">Company</th>
                    <th className="pb-3 text-gray-300 font-medium">Contact</th>
                    <th className="pb-3 text-gray-300 font-medium">Phone</th>
                    <th className="pb-3 text-gray-300 font-medium">Priority</th>
                    <th className="pb-3 text-gray-300 font-medium">Status</th>
                    <th className="pb-3 text-gray-300 font-medium">Created</th>
                    <th className="pb-3 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-400">
                        No leads found. Create your first lead to get started.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-800">
                        <td className="py-4 text-white font-medium">{lead.company_name}</td>
                        <td className="py-4 text-gray-300">{lead.contact_person}</td>
                        <td className="py-4 text-gray-300">{lead.phone || '-'}</td>
                        <td className="py-4">
                          <span className={`text-xs font-medium px-3 py-1 rounded ${getPriorityColor(lead.priority)}`}>
                            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`text-xs font-medium px-3 py-1 rounded ${getStatusColor(lead.status)}`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 text-gray-300">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            {lead.status === 'unassigned' && (
                              <button
                                onClick={() => handleAssignLead(lead)}
                                className="btn-primary text-sm px-3 py-1"
                              >
                                Assign
                              </button>
                            )}
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDeleteLead(lead)}
                                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 border border-red-400 rounded hover:bg-red-900/20 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Lead Modal */}
        {showCreateLeadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-6">Create New Lead</h2>
              
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={newLead.company_name}
                      onChange={(e) => setNewLead(prev => ({ ...prev, company_name: e.target.value }))}
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={newLead.contact_person}
                      onChange={(e) => setNewLead(prev => ({ ...prev, contact_person: e.target.value }))}
                      className="input-field w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newLead.phone}
                      onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={newLead.address}
                    onChange={(e) => setNewLead(prev => ({ ...prev, address: e.target.value }))}
                    className="input-field w-full h-20 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Google Maps Link or Location *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={newLead.googleMapsLink}
                      onChange={(e) => {
                        setNewLead(prev => ({ ...prev, googleMapsLink: e.target.value }));
                        if (e.target.value) {
                          extractCoordinatesFromGoogleMaps(e.target.value);
                        }
                      }}
                      className="input-field flex-1"
                      placeholder="Paste Google Maps link here..."
                    />
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      className="btn-secondary px-4"
                    >
                      Use Current Location
                    </button>
                  </div>
                  {newLead.lat && newLead.lng && (
                    <p className="text-sm text-green-400 mt-2">
                      ✓ Location set: {newLead.lat}, {newLead.lng}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newLead.priority}
                    onChange={(e) => setNewLead(prev => ({ ...prev, priority: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field w-full h-20 resize-none"
                    placeholder="Additional notes about this lead..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Create Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateLeadModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Lead Modal */}
        {showAssignModal && selectedLead && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card p-5 max-w-md w-full">
              <h2 className="text-xl font-semibold text-white mb-6">
                Assign Lead: {selectedLead.company_name}
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Available salespersons near this location:
                </p>

                {nearbySalespersons.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No available salespersons found nearby.
                  </p>
                ) : (
                  nearbySalespersons.map((salesperson) => (
                    <div key={salesperson.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {salesperson.photo_url ? (
                          <img
                            src={salesperson.photo_url}
                            alt={salesperson.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {salesperson.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">
                            {salesperson.full_name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {salesperson.designation} • {salesperson.distance_km} km away
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssign(salesperson.id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        Assign
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Lead Confirmation Modal */}
        {showDeleteModal && selectedLead && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    Delete Lead
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-200"
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
                      Delete {selectedLead.company_name}?
                    </h4>
                    <p className="text-sm text-gray-400">
                      This action cannot be undone. This will permanently delete the lead and all associated assignments.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type "DELETE" to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Type DELETE here"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteLead}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Lead'
                    )}
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
