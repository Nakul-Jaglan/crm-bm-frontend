'use client';

import React, { useState, useEffect } from 'react';
import { Country, State } from 'country-state-city';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { preLeadAPI, leadAPI, getCurrentLocation } from '../../lib/api';

export default function PreLeadsPage() {
  const [preLeads, setPreLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedPreLead, setSelectedPreLead] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [newPreLead, setNewPreLead] = useState({
    company_name: '',
    country: '',
    state: '',
    reason: '',
    source: '',
    notes: '',
  });
  const [convertData, setConvertData] = useState({
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    lat: '',
    lng: '',
    googleMapsLink: '',        priority: 'hot',
    estimated_value: '',
    notes: '',
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetchPreLeads();
    // Load countries for dropdown
    const countryList = Country.getAllCountries();
    setCountries(countryList);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (newPreLead.country) {
      const selectedCountry = countries.find(country => country.name === newPreLead.country);
      if (selectedCountry) {
        const stateList = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(stateList);
      }
    } else {
      setStates([]);
    }
  }, [newPreLead.country, countries]);

  const fetchPreLeads = async () => {
    try {
      const data = await preLeadAPI.getPreLeads();
      setPreLeads(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch pre-leads' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePreLead = async (e) => {
    e.preventDefault();
    try {
      await preLeadAPI.createPreLead(newPreLead);
      setToast({ type: 'success', message: 'Pre-lead created successfully!' });
      setShowCreateModal(false);
      setNewPreLead({
        company_name: '',
        country: '',
        state: '',
        reason: '',
        source: '',
        notes: '',
      });
      fetchPreLeads();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create pre-lead' });
    }
  };

  const handleConvertToLead = async (e) => {
    e.preventDefault();
    
    // Validate that coordinates are available
    if (!convertData.lat || !convertData.lng) {
      setToast({ type: 'error', message: 'Location coordinates are required. Please provide a Google Maps link or use current location.' });
      return;
    }

    try {
      const leadData = {
        ...convertData,
        latitude: parseFloat(convertData.lat),
        longitude: parseFloat(convertData.lng),
        estimated_value: convertData.estimated_value ? parseFloat(convertData.estimated_value) : null,
      };

      // Remove frontend-only fields
      delete leadData.lat;
      delete leadData.lng;
      delete leadData.googleMapsLink;

      await preLeadAPI.convertToLead(selectedPreLead.id, leadData);
      setToast({ type: 'success', message: 'Pre-lead converted to lead successfully!' });
      setShowConvertModal(false);
      setSelectedPreLead(null);
      setConvertData({
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        lat: '',
        lng: '',
        googleMapsLink: '',
        priority: 'hot',
        estimated_value: '',
        notes: '',
      });
      fetchPreLeads();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to convert pre-lead' });
    }
  };

  const extractCoordinatesFromGoogleMaps = async (url) => {
    try {
      if (!url.trim()) {
        setConvertData(prev => ({ ...prev, lat: '', lng: '' }));
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
        setConvertData(prev => ({
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
      setConvertData(prev => ({
        ...prev,
        lat: location.lat.toString(),
        lng: location.lng.toString()
      }));
      setToast({ type: 'success', message: 'Current location set successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to get current location' });
    }
  };

  const toggleExpandRow = (preLeadId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(preLeadId)) {
      newExpandedRows.delete(preLeadId);
    } else {
      newExpandedRows.add(preLeadId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'hot': return 'text-red-400 bg-red-900/20';
      case 'warm': return 'text-yellow-400 bg-yellow-900/20';
      case 'cold': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'hot': return '';
      case 'warm': return '';
      case 'cold': return '';
      default: return '';
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
              <h1 className="text-3xl font-bold text-white mb-2">Pre-leads</h1>
              <p className="text-gray-400">Manage your prospecting pipeline</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Pre-Lead</span>
            </button>
          </div>

          {/* Pre-leads Table */}
          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead>
                  <tr className="border-b-2 border-primary bg-gray-800/50">
                    <th className="pb-4 pt-2 px-3 text-white font-bold text-sm uppercase tracking-wide">Company</th>
                    <th className="pb-4 pt-2 px-3 text-white font-bold text-sm uppercase tracking-wide">Country</th>
                    <th className="pb-4 pt-2 px-3 text-white font-bold text-sm uppercase tracking-wide">State</th>
                    <th className="pb-4 pt-2 px-3 text-white font-bold text-sm uppercase tracking-wide">Source</th>
                    <th className="pb-4 pt-2 px-3 text-white font-bold text-sm uppercase tracking-wide">Reason</th>
                    <th className="pb-4 pt-2 px-3 text-white font-bold text-sm uppercase tracking-wide">Created</th>
                    <th className="pb-4 pt-2 px-3 text-white font-bold text-sm uppercase tracking-wide">Status</th>
                    <th className="pb-4 pt-2 px-3 text-white font-bold text-sm uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {preLeads.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-gray-400 text-sm">
                        No pre-leads found. Create your first pre-lead to get started.
                      </td>
                    </tr>
                  ) : (
                    preLeads.map((preLead) => (
                      <React.Fragment key={preLead.id}>
                        <tr className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="py-6 px-4 text-white font-medium text-base">{preLead.company_name}</td>
                          <td className="py-6 px-4 text-gray-300 text-xs">{preLead.country}</td>
                          <td className="py-6 px-4 text-gray-300 text-xs">{preLead.state || '-'}</td>
                          <td className="py-6 px-4 text-gray-300 text-xs capitalize">{preLead.source}</td>
                          <td className="py-6 px-4 text-gray-300 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="max-w-xs truncate cursor-pointer" 
                                onClick={() => toggleExpandRow(preLead.id)}
                                title="Click to expand/collapse">
                                {preLead.reason}
                              </span>
                              <button
                                onClick={() => toggleExpandRow(preLead.id)}
                                className="text-primary hover:text-primary-dark transition-colors duration-200"
                                title={expandedRows.has(preLead.id) ? "Collapse" : "Expand"}
                              >
                                <svg className={`w-4 h-4 transition-transform duration-200 ${expandedRows.has(preLead.id) ? 'rotate-180' : ''}`} 
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="py-6 px-4 text-gray-300 text-xs">
                            {new Date(preLead.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-6 px-4">
                            {preLead.converted_to_lead_id ? (
                              <span className="text-green-400 text-base font-medium px-2 py-1 bg-green-900/20 rounded-full">
                                {/* ✓ Converted */}
                                Converted
                              </span>
                            ) : (
                              <span className="text-blue-400 text-base font-medium px-2 py-1 bg-blue-900/20 rounded-full">
                                {/* • Active */}
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            {!preLead.converted_to_lead_id && (
                              <button
                                onClick={() => {
                                  setSelectedPreLead(preLead);
                                  setConvertData(prev => ({
                                    ...prev,
                                    notes: `Converted from pre-lead: ${preLead.company_name}`
                                  }));
                                  setShowConvertModal(true);
                                }}
                                className="btn-primary text-base px-3 py-1"
                              >
                                Convert to Lead
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedRows.has(preLead.id) && (
                          <tr className="border-b border-gray-800 bg-gray-800/20">
                            <td colSpan="8" className="py-4 px-4">
                              <div className="ml-4">
                                <div className="text-lg text-gray-300 mb-2">
                                  <span className="font-medium text-gray-200">Full Reason:</span>
                                </div>
                                <div className="text-base text-gray-400 bg-gray-900/30 p-3 rounded-lg">
                                  {preLead.reason}
                                </div>
                                {preLead.notes && (
                                  <div className="mt-3">
                                    <div className="text-lg text-gray-300 mb-1">
                                      <span className="font-medium text-gray-200">Notes:</span>
                                    </div>
                                    <div className="text-base text-gray-400 bg-gray-900/30 p-3 rounded-lg">
                                      {preLead.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Pre-Lead Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-md w-full p-5">
              <h2 className="text-xl font-semibold text-white mb-6">Create Pre-Lead</h2>
              
              <form onSubmit={handleCreatePreLead} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newPreLead.company_name}
                    onChange={(e) => setNewPreLead(prev => ({ ...prev, company_name: e.target.value }))}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country *
                  </label>
                  <select
                    value={newPreLead.country}
                    onChange={(e) => {
                      setNewPreLead(prev => ({ ...prev, country: e.target.value, state: '' }));
                    }}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State
                  </label>
                  <select
                    value={newPreLead.state}
                    onChange={(e) => setNewPreLead(prev => ({ ...prev, state: e.target.value }))}
                    className="input-field w-full"
                    disabled={!newPreLead.country}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Source *
                  </label>
                  <input
                    type="text"
                    value={newPreLead.source}
                    onChange={(e) => setNewPreLead(prev => ({ ...prev, source: e.target.value }))}
                    className="input-field w-full"
                    placeholder="e.g., Website, Referral, Cold Call, Social Media, LinkedIn"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Prospecting *
                  </label>
                  <textarea
                    value={newPreLead.reason}
                    onChange={(e) => setNewPreLead(prev => ({ ...prev, reason: e.target.value }))}
                    className="input-field w-full h-20 resize-none"
                    placeholder="Why is this a potential opportunity?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newPreLead.notes}
                    onChange={(e) => setNewPreLead(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field w-full h-20 resize-none"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Create Pre-Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Convert to Lead Modal */}
        {showConvertModal && selectedPreLead && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-6">
                Convert "{selectedPreLead.company_name}" to Lead
              </h2>
              
              <form onSubmit={handleConvertToLead} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={convertData.contact_person}
                      onChange={(e) => setConvertData(prev => ({ ...prev, contact_person: e.target.value }))}
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
                      value={convertData.phone}
                      onChange={(e) => setConvertData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={convertData.email}
                      onChange={(e) => setConvertData(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={convertData.priority}
                      onChange={(e) => setConvertData(prev => ({ ...prev, priority: e.target.value }))}
                      className="input-field w-full"
                    >
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={convertData.address}
                    onChange={(e) => setConvertData(prev => ({ ...prev, address: e.target.value }))}
                    className="input-field w-full h-20 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Google Maps Link or Location
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={convertData.googleMapsLink}
                      onChange={(e) => {
                        setConvertData(prev => ({ ...prev, googleMapsLink: e.target.value }));
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
                  {convertData.lat && convertData.lng && (
                    <p className="text-sm text-green-400 mt-2">
                      ✓ Location set: {convertData.lat}, {convertData.lng}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={convertData.estimated_value}
                    onChange={(e) => setConvertData(prev => ({ ...prev, estimated_value: e.target.value }))}
                    className="input-field w-full"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={convertData.notes}
                    onChange={(e) => setConvertData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field w-full h-20 resize-none"
                    placeholder="Additional information for the lead..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Convert to Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConvertModal(false);
                      setSelectedPreLead(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
