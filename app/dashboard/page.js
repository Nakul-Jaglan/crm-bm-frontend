'use client';

import { useState, useEffect } from 'react';
import { Country, State } from 'country-state-city';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { leadAPI, userAPI, assignmentAPI, preLeadAPI, getCurrentLocation } from '../../lib/api';

// Get the API base URL from the environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [preLeads, setPreLeads] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showCreatePreLeadModal, setShowCreatePreLeadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
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
    priority: 'hot',
    notes: '',
  });
  const [newPreLead, setNewPreLead] = useState({
    company_name: '',
    country: '',
    state: '',
    reason: '',
    source: '',
    notes: '',
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      const [leadsData, preLeadsData, assignmentsData, salespersonsData] = await Promise.all([
        leadAPI.getLeads(),
        preLeadAPI.getPreLeads(),
        assignmentAPI.getAssignments(),
        userAPI.getAllSalespersons(),
      ]);

      setLeads(leadsData);
      setPreLeads(preLeadsData);
      setAssignments(assignmentsData);
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
        priority: 'hot',
        notes: '',
      });
      fetchData();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create lead' });
    }
  };

  const handleCreatePreLead = async (e) => {
    e.preventDefault();
    try {
      await preLeadAPI.createPreLead(newPreLead);
      setToast({ type: 'success', message: 'Pre-lead created successfully!' });
      setShowCreatePreLeadModal(false);
      setNewPreLead({
        company_name: '',
        country: '',
        state: '',
        reason: '',
        source: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create pre-lead' });
    }
  };

  // Function to extract coordinates from Google Maps URLs
  const extractCoordinatesFromGoogleMaps = async (url) => {
    try {
      let processUrl = url;
      
      // Check if it's a shortened URL that needs to be resolved via backend
      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps') || url.includes('bit.ly') || url.includes('tinyurl.com')) {
        try {
          // Use backend to resolve shortened URL to avoid CORS issues
          const response = await fetch(`${API_BASE_URL}/resolve-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.coordinates) {
              // Backend already extracted coordinates for us
              return { lat: result.coordinates.lat.toString(), lng: result.coordinates.lng.toString() };
            } else if (result.resolved_url) {
              // Use the resolved URL for further processing
              processUrl = result.resolved_url;
              console.log('Resolved shortened URL via backend:', processUrl);
            }
          } else {
            console.log('Backend URL resolution failed, trying direct parsing');
          }
        } catch (resolveError) {
          console.log('Could not resolve shortened URL via backend, trying direct parsing:', resolveError);
          // If resolution fails, continue with original URL
        }
      }
      
      // Handle different Google Maps URL formats
      const patterns = [
        // Standard maps.google.com URLs with @lat,lng
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // URLs with ll parameter
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // URLs with q parameter for coordinates
        /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // Plus codes and place URLs that contain coordinates
        /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
        // Alternative format with decimal coordinates (more specific)
        /(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
        // Handle URLs with encoded coordinates
        /%2C.*?(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // Handle short Google Maps URLs
        /maps\/.*?(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // Handle data parameters in URLs
        /data=.*?(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // Handle different coordinate formats in URLs
        /(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/
      ];

      for (const pattern of patterns) {
        const match = processUrl.match(pattern);
        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          
          // Validate coordinates are within valid ranges
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat: lat.toString(), lng: lng.toString() };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing Google Maps URL:', error);
      return null;
    }
  };

  const handleGoogleMapsLink = async (link) => {
    if (!link.trim()) {
      setNewLead({
        ...newLead,
        lat: '',
        lng: '',
        googleMapsLink: link,
      });
      return;
    }

    // Show loading state for shortened URLs
    if (link.includes('maps.app.goo.gl') || link.includes('goo.gl/maps') || link.includes('bit.ly') || link.includes('tinyurl.com')) {
      setToast({ type: 'info', message: 'Resolving shortened URL...' });
    }

    try {
      const coordinates = await extractCoordinatesFromGoogleMaps(link);
      
      if (coordinates) {
        setNewLead({
          ...newLead,
          lat: coordinates.lat,
          lng: coordinates.lng,
          googleMapsLink: link,
        });
        setToast({ type: 'success', message: 'Coordinates extracted successfully!' });
      } else {
        setNewLead({
          ...newLead,
          googleMapsLink: link,
        });
        setToast({ type: 'error', message: 'Could not extract coordinates from this link. Please check the URL format.' });
      }
    } catch (error) {
      setNewLead({
        ...newLead,
        googleMapsLink: link,
      });
      setToast({ type: 'error', message: 'Error processing the URL. Please try again.' });
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewLead({
            ...newLead,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
            googleMapsLink: `https://www.google.com/maps/@${position.coords.latitude},${position.coords.longitude},15z`,
          });
          setToast({ type: 'success', message: 'Location captured!' });
        },
        (error) => {
          setToast({ type: 'error', message: 'Failed to get location' });
        }
      );
    } else {
      setToast({ type: 'error', message: 'Geolocation is not supported' });
    }
  };

  const handleFindNearby = async (lead) => {
    try {
      const nearby = await userAPI.getNearbySalespersons(lead.latitude, lead.longitude);
      setNearbySalespersons(nearby);
      setSelectedLead(lead);
      setShowAssignModal(true);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to find nearby salespersons' });
    }
  };

  const handleAssign = async (salespersonId, notes = '') => {
    try {
      await assignmentAPI.assignLead(selectedLead.id, salespersonId, notes);
      setToast({ type: 'success', message: 'Lead assigned successfully!' });
      setShowAssignModal(false);
      setSelectedLead(null);
      fetchData();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to assign lead' });
    }
  };

  const stats = {
    totalLeads: leads.length,
    totalPreLeads: preLeads.length,
    unassignedLeads: leads.filter(lead => lead.status === 'unassigned').length,
    assignedLeads: leads.filter(lead => lead.status === 'assigned').length,
    activeSalespersons: salespersons.filter(sp => sp.status === 'available').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
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
              CRM Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Manage leads and assign them to salespersons
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Pre-Leads</p>
                  <p className="text-2xl font-bold text-white">{stats.totalPreLeads}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{stats.totalLeads}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Unassigned</p>
                  <p className="text-2xl font-bold text-white">{stats.unassignedLeads}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Assigned</p>
                  <p className="text-2xl font-bold text-white">{stats.assignedLeads}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 616 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Sales</p>
                  <p className="text-2xl font-bold text-white">{stats.activeSalespersons}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setShowCreatePreLeadModal(true)}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Pre-Lead
            </button>

            <button
              onClick={() => setShowCreateLeadModal(true)}
              className="btn-secondary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Lead
            </button>

            <button
              onClick={() => window.location.href = '/map'}
              className="btn-secondary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Map
            </button>
          </div>

          {/* Recent Pre-Leads */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white border-b-2 border-primary pb-1 mb-2">Recent Pre-Leads</h2>
                <p className="text-sm text-gray-400">Latest prospects in your pipeline</p>
              </div>
              <button
                onClick={() => window.location.href = '/preleads'}
                className="text-primary hover:text-primary-dark transition-colors duration-200 font-medium flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Country</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {preLeads.slice(0, 5).map((preLead) => (
                    <tr key={preLead.id} className="border-b border-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{preLead.company_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-300">{preLead.country}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-300 capitalize">{preLead.source}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          preLead.converted_to_lead_id
                            ? 'bg-green-900/20 text-green-300'
                            : 'bg-purple-900/20 text-purple-300'
                        }`}>
                          {preLead.converted_to_lead_id ? 'Converted' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-400">
                          {new Date(preLead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {preLeads.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400">
                        No pre-leads yet. Create your first pre-lead to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leads Table */}
          <div className="glass-card p-6 h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Leads</h2>
              <button
                onClick={() => window.location.href = '/leads'}
                className="text-primary hover:text-primary-dark transition-colors duration-200 font-medium flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{lead.company_name}</div>
                          <div className="text-sm text-gray-400">{lead.address}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm text-white">{lead.contact_person}</div>
                          <div className="text-sm text-gray-400">{lead.phone}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.priority === 'hot'
                            ? 'bg-red-900/20 text-red-300'
                            : lead.priority === 'warm'
                            ? 'bg-yellow-900/20 text-yellow-300'
                            : 'bg-blue-900/20 text-blue-300'
                        }`}>
                          {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'assigned'
                            ? 'bg-blue-900/20 text-blue-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {lead.status === 'unassigned' && (
                          <button
                            onClick={() => handleFindNearby(lead)}
                            className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium"
                          >
                            Find & Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Lead Modal */}
        {showCreateLeadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Lead</h3>

              <form onSubmit={handleCreateLead} className="space-y-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newLead.company_name}
                  onChange={(e) => setNewLead({...newLead, company_name: e.target.value})}
                  className="input-field"
                  required
                />

                <input
                  type="text"
                  placeholder="Contact Person"
                  value={newLead.contact_person}
                  onChange={(e) => setNewLead({...newLead, contact_person: e.target.value})}
                  className="input-field"
                  required
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="input-field"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="input-field"
                />

                <textarea
                  placeholder="Address"
                  value={newLead.address}
                  onChange={(e) => setNewLead({...newLead, address: e.target.value})}
                  className="input-field h-20 resize-none"
                />

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Location (Google Maps Link)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste Google Maps link here (e.g., https://maps.google.com/@37.7749,-122.4194,15z)"
                      value={newLead.googleMapsLink}
                      onChange={(e) => handleGoogleMapsLink(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      title="Use current location"
                    >
                      📍
                    </button>
                  </div>
                  
                  {newLead.lat && newLead.lng && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-sm text-green-700">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Coordinates found: {parseFloat(newLead.lat).toFixed(6)}, {parseFloat(newLead.lng).toFixed(6)}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    <strong>How to get a Google Maps link:</strong>
                    <ol className="mt-1 ml-4 list-decimal space-y-1">
                      <li>Go to <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a></li>
                      <li>Search for or navigate to the location</li>
                      <li>Right-click on the location and select "What's here?" or click on the location</li>
                      <li>Copy the URL from your browser's address bar</li>
                      <li>Paste the URL in the field above</li>
                    </ol>
                    <p className="mt-2">
                      <strong>Supported formats:</strong> Standard Google Maps links, shortened links, place URLs, and coordinate pairs.
                    </p>
                  </div>
                </div>

                <select
                  value={newLead.priority}
                  onChange={(e) => setNewLead({...newLead, priority: e.target.value})}
                  className="input-field"
                >
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>

                <textarea
                  placeholder="Notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  className="input-field h-20 resize-none"
                />

                <div className="flex gap-3">
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

        {/* Create Pre-Lead Modal */}
        {showCreatePreLeadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Pre-Lead</h3>

              <form onSubmit={handleCreatePreLead} className="space-y-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newPreLead.company_name}
                  onChange={(e) => setNewPreLead({...newPreLead, company_name: e.target.value})}
                  className="input-field"
                  required
                />

                <select
                  value={newPreLead.country}
                  onChange={(e) => setNewPreLead({...newPreLead, country: e.target.value, state: ''})}
                  className="input-field"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>

                <select
                  value={newPreLead.state}
                  onChange={(e) => setNewPreLead({...newPreLead, state: e.target.value})}
                  className="input-field"
                  disabled={!newPreLead.country}
                >
                  <option value="">Select State (Optional)</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>

                <textarea
                  placeholder="Reason for prospecting (e.g., expanding manufacturing, automation needs)"
                  value={newPreLead.reason}
                  onChange={(e) => setNewPreLead({...newPreLead, reason: e.target.value})}
                  className="input-field h-20 resize-none"
                  required
                />

                <input
                  type="text"
                  placeholder="Source (e.g., website, trade show, referral, LinkedIn, cold call)"
                  value={newPreLead.source}
                  onChange={(e) => setNewPreLead({...newPreLead, source: e.target.value})}
                  className="input-field"
                  required
                />

                <textarea
                  placeholder="Additional notes"
                  value={newPreLead.notes}
                  onChange={(e) => setNewPreLead({...newPreLead, notes: e.target.value})}
                  className="input-field h-20 resize-none"
                />

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    Create Pre-Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePreLeadModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                Assign Lead: {selectedLead?.company_name}
              </h3>

              <div className="space-y-3">
                {nearbySalespersons.map((salesperson) => (
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
                ))}
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
      </div>
    </ProtectedRoute>
  );
}