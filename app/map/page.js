'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import Navbar from '../../components/Navbar';
import api, { userAPI, leadAPI, locationAPI, getCurrentLocation } from '../../lib/api';
import { MapPin, Users, Target, Navigation } from 'lucide-react';

// Create a map component that properly handles React Strict Mode
const MapComponent = ({ salespeople, leads, selectedFilter }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Cleanup function for markers and map
  const cleanup = () => {
    // Clear all markers
    markersRef.current.forEach(marker => {
      try {
        if (marker && marker.remove) {
          marker.remove();
        }
      } catch (e) {
        console.log('Marker cleanup:', e.message);
      }
    });
    markersRef.current = [];

    // Clear map instance
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.log('Map cleanup:', e.message);
      }
      mapInstanceRef.current = null;
    }

    // Clear container
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
      // Remove Leaflet-specific data
      if (mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id;
      }
    }
  };

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;

    const initMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import('leaflet')).default;
        
        if (!mounted || !mapRef.current) return;

        // Clean up any existing map first
        cleanup();

        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!mounted || !mapRef.current) return;

        // Create map
        const map = L.map(mapRef.current, {
          center: [20.5937, 78.9629], // Center of India
          zoom: 5,
          scrollWheelZoom: true,
          zoomControl: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsMapReady(true);

        // Add markers after map is ready
        addMarkers(L, map);

      } catch (error) {
        console.error('Map initialization error:', error);
        cleanup();
      }
    };

    initMap();

    return () => {
      mounted = false;
      cleanup();
      setIsMapReady(false);
    };
  }, []); // Only run once on mount

  // Function to add markers to the map
  const addMarkers = (L, map) => {
    if (!map || !L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        if (marker && marker.remove) {
          marker.remove();
        }
      } catch (e) {
        console.log('Marker removal:', e.message);
      }
    });
    markersRef.current = [];

    // Filter data based on selected filter
    const filteredSalespeople = salespeople.filter(person => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'active') return person.current_latitude && person.current_longitude;
      if (selectedFilter === 'inactive') return !person.current_latitude || !person.current_longitude;
      return true;
    });

    const filteredLeads = leads.filter(lead => {
      if (selectedFilter === 'unassigned') return !lead.assigned_to;
      if (selectedFilter === 'assigned') return lead.assigned_to;
      return selectedFilter === 'all' || selectedFilter === 'leads';
    });

    // Add salesperson markers with prominent pin icons
    filteredSalespeople.forEach(person => {
      if (!person.current_latitude || !person.current_longitude) return;

      const color = getMarkerColor(person);
      
      // Create prominent pin-style marker for salespeople
      const icon = L.divIcon({
        html: `<div style="position: relative;">
                 <!-- Pin body -->
                 <div style="background: ${color}; width: 32px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); position: relative;">
                   <!-- Pin icon inside -->
                   <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); width: 16px; height: 16px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                     <div style="width: 6px; height: 6px; background: ${color}; border-radius: 50%;"></div>
                   </div>
                 </div>
                 <!-- Shadow -->
                 <div style="position: absolute; top: 36px; left: 8px; width: 16px; height: 8px; background: rgba(0,0,0,0.2); border-radius: 50%; transform: skew(20deg);"></div>
               </div>`,
        className: 'custom-pin-marker',
        iconSize: [32, 40],
        iconAnchor: [16, 36],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([person.current_latitude, person.current_longitude], { icon })
        .bindPopup(`
          <div class="glass-card map-popup">
            <h3 class="map-popup-title">${person.full_name}</h3>
            <div class="map-popup-field">
              <strong>Email:</strong> ${person.email}
            </div>
            <div class="map-popup-field">
              <strong>Phone:</strong> ${person.phone || 'N/A'}
            </div>
            <div class="map-popup-field">
              <strong>Role:</strong> ${person.role}
            </div>
            <div class="map-popup-timestamp">
              Last update: ${person.last_location_update ? 
                new Date(person.last_location_update).toLocaleString() : 
                'Never'
              }
            </div>
            <div style="margin-top: 12px;">
              <span class="status-badge ${
                color === '#10b981' ? 'status-active' :
                color === '#f59e0b' ? 'status-moderate' :
                'status-inactive'
              }">
                ${color === '#10b981' ? '🟢 Active' : color === '#f59e0b' ? '🟡 Moderate' : '🔴 Inactive'}
              </span>
            </div>
          </div>
        `)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Add lead markers with smaller circular icons
    filteredLeads.forEach(lead => {
      if (!lead.latitude || !lead.longitude) return;

      const icon = L.divIcon({
        html: `<div style="background: #dc2626; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.2);">
                 <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
               </div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([lead.latitude, lead.longitude], { icon })
        .bindPopup(`
          <div class="glass-card map-popup">
            <h3 class="map-popup-title">${lead.company_name}</h3>
            <div class="map-popup-field">
              <strong>Contact:</strong> ${lead.contact_person}
            </div>
            <div class="map-popup-field">
              <strong>Phone:</strong> ${lead.phone || 'N/A'}
            </div>
            <div class="map-popup-field">
              <strong>Email:</strong> ${lead.email || 'N/A'}
            </div>
            <div class="map-popup-field">
              <strong>Address:</strong> ${lead.address || 'N/A'}
            </div>
            <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="status-badge ${
                lead.status === 'new' ? 'lead-status-new' :
                lead.status === 'contacted' ? 'lead-status-contacted' :
                lead.status === 'qualified' ? 'lead-status-qualified' :
                lead.status === 'closed' ? 'lead-status-closed' :
                'lead-status-lost'
              }">
                ${lead.status}
              </span>
              <span class="status-badge ${lead.assigned_to ? 'assignment-assigned' : 'assignment-unassigned'}">
                ${lead.assigned_to ? '✅ Assigned' : '⚠️ Unassigned'}
              </span>
            </div>
            ${lead.estimated_value ? `<div class="map-popup-value">💰 Value: ₹${lead.estimated_value.toLocaleString()}</div>` : ''}
          </div>
        `)
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  // Update markers when data or filter changes
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      const L = window.L;
      if (L) {
        addMarkers(L, mapInstanceRef.current);
      }
    }
  }, [salespeople, leads, selectedFilter, isMapReady]);

  const getMarkerColor = (person) => {
    if (!person.last_location_update) return '#ef4444'; // Red for no location
    
    const lastUpdate = new Date(person.last_location_update);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 2) return '#10b981'; // Green for recent
    if (hoursSinceUpdate < 8) return '#f59e0b'; // Yellow for moderate
    return '#ef4444'; // Red for old
  };

  return (
    <div className="h-full w-full relative">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-xl"
        style={{ minHeight: '600px' }}
      />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm rounded-xl">
          <LoadingSpinner />
          <span className="ml-2 text-gray-400">Loading map...</span>
        </div>
      )}
    </div>
  );
};

// Dynamically import the map component to avoid SSR issues
const DynamicMapComponent = dynamic(() => Promise.resolve(MapComponent), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-900/90 backdrop-blur-sm rounded-xl">
      <LoadingSpinner />
      <span className="ml-2 text-gray-400">Initializing map...</span>
    </div>
  )
});

function MapView() {
  const { user } = useAuth();
  const [salespeople, setSalespeople] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salespeopleResponse, leadsResponse] = await Promise.all([
        userAPI.getAllSalespersons(),
        leadAPI.getLeads()
      ]);
      
      setSalespeople(salespeopleResponse);
      setLeads(leadsResponse);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark transition-colors duration-300">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-montserrat">
            Territory Map
          </h1>
          <p className="text-gray-400 mt-2">
            Real-time view of salespeople and leads across India
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Salespeople</p>
                <p className="text-2xl font-bold text-white">{salespeople.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-white">{leads.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Locations</p>
                <p className="text-2xl font-bold text-white">
                  {salespeople.filter(p => p.current_latitude && p.current_longitude).length}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 card-hover">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Unassigned Leads</p>
                <p className="text-2xl font-bold text-white">
                  {leads.filter(lead => !lead.assigned_to).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Map Filters</h3>
              <p className="text-sm text-gray-400">Filter the map view to show specific data</p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Data</option>
                <option value="active">Active Salespeople</option>
                <option value="inactive">Inactive Salespeople</option>
                <option value="leads">All Leads</option>
                <option value="unassigned">Unassigned Leads</option>
                <option value="assigned">Assigned Leads</option>
              </select>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="glass-card p-6 mb-8">
          <div className="h-[600px] relative">
            <DynamicMapComponent 
              salespeople={salespeople}
              leads={leads}
              selectedFilter={selectedFilter}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Map Legend</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-white mb-4">Salespeople Status</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-sm text-gray-400">🟢 Active (last 2 hours)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-sm text-gray-400">🟡 Moderate (2-8 hours)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-sm text-gray-400">🔴 Inactive (8+ hours)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Marker Types</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full mr-3 transform rotate-45 relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-400">📍 Salespeople (Pin Markers)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-600 mr-3"></div>
                  <span className="text-sm text-gray-400">🎯 Leads (Circle Markers)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-300">Pro Tip</h4>
                <p className="text-sm text-blue-400 mt-1">
                  Click on any marker to view detailed information. Use the filter dropdown to focus on specific data types.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <ProtectedRoute allowedRoles={['crm', 'admin', 'executive']}>
      <MapView />
    </ProtectedRoute>
  );
}
