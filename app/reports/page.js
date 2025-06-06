'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { leadAPI, userAPI, assignmentAPI } from '../../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    territory: 'all',
    salesperson: 'all',
    dateRange: '30',
    status: 'all'
  });

  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    totalValue: 0,
    avgDealSize: 0,
    leadsPerTerritory: {},
    salesPerformance: [],
    statusDistribution: {},
    monthlyTrends: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [leads, assignments, salespersons, filters]);

  const fetchData = async () => {
    try {
      const [leadsData, assignmentsData, salespersonsData] = await Promise.all([
        leadAPI.getLeads(),
        assignmentAPI.getAssignments(),
        userAPI.getAllSalespersons(),
      ]);
      
      setLeads(leadsData);
      setAssignments(assignmentsData);
      setSalespersons(salespersonsData);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    let filteredLeads = leads;
    let filteredAssignments = assignments;

    // Apply filters
    if (filters.territory !== 'all') {
      const territorySalespersons = salespersons.filter(sp => sp.territory === filters.territory);
      const territoryIds = territorySalespersons.map(sp => sp.id);
      filteredAssignments = filteredAssignments.filter(a => territoryIds.includes(a.salesperson_id));
      filteredLeads = filteredLeads.filter(lead => 
        filteredAssignments.some(a => a.lead_id === lead.id)
      );
    }

    if (filters.salesperson !== 'all') {
      filteredAssignments = filteredAssignments.filter(a => a.salesperson_id === parseInt(filters.salesperson));
      filteredLeads = filteredLeads.filter(lead => 
        filteredAssignments.some(a => a.lead_id === lead.id)
      );
    }

    if (filters.status !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
    }

    // Calculate metrics
    const totalLeads = filteredLeads.length;
    const convertedLeads = filteredLeads.filter(lead => lead.status === 'closed').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100) : 0;
    const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
    const avgDealSize = convertedLeads > 0 ? (totalValue / convertedLeads) : 0;

    // Leads per territory
    const leadsPerTerritory = {};
    salespersons.forEach(sp => {
      const territoryLeads = filteredLeads.filter(lead => 
        filteredAssignments.some(a => a.lead_id === lead.id && a.salesperson_id === sp.id)
      );
      if (leadsPerTerritory[sp.territory]) {
        leadsPerTerritory[sp.territory] += territoryLeads.length;
      } else {
        leadsPerTerritory[sp.territory] = territoryLeads.length;
      }
    });

    // Sales performance
    const salesPerformance = salespersons.map(sp => {
      const spLeads = filteredLeads.filter(lead => 
        filteredAssignments.some(a => a.lead_id === lead.id && a.salesperson_id === sp.id)
      );
      const spConverted = spLeads.filter(lead => lead.status === 'closed').length;
      const spValue = spLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
      
      return {
        id: sp.id,
        name: sp.full_name,
        territory: sp.territory,
        totalLeads: spLeads.length,
        convertedLeads: spConverted,
        conversionRate: spLeads.length > 0 ? (spConverted / spLeads.length * 100) : 0,
        totalValue: spValue
      };
    }).filter(sp => sp.totalLeads > 0);

    // Status distribution
    const statusDistribution = {};
    filteredLeads.forEach(lead => {
      statusDistribution[lead.status] = (statusDistribution[lead.status] || 0) + 1;
    });

    setAnalytics({
      totalLeads,
      convertedLeads,
      conversionRate,
      totalValue,
      avgDealSize,
      leadsPerTerritory,
      salesPerformance,
      statusDistribution,
      monthlyTrends: [] // Placeholder for monthly trends
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add logo to PDF
    const logoImg = new Image();
    logoImg.onload = function() {
      // Logo
      doc.addImage(logoImg, 'PNG', pageWidth / 2 - 10, 10, 20, 20);
      
      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Executive Territorial Report', pageWidth / 2, 40, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 50, { align: 'center' });
      
      // User information
      doc.setFontSize(10);
      doc.text(`Report generated by: ${user.full_name} (${user.email})`, pageWidth / 2, 60, { align: 'center' });
      doc.text(`Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`, pageWidth / 2, 70, { align: 'center' });
      
      // Continue with rest of PDF generation
      generatePDFContent(doc, 85);
    };
    logoImg.src = '/logo.png';
  };

  const generatePDFContent = (doc, startY) => {
    const pageWidth = doc.internal.pageSize.width;
    
    // Executive Summary
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', 14, startY);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    let yPosition = startY + 10;
    
    const summaryData = [
      ['Total Leads', analytics.totalLeads.toString()],
      ['Converted Leads', analytics.convertedLeads.toString()],
      ['Conversion Rate', `${analytics.conversionRate.toFixed(1)}%`],
      ['Total Value', `₹${analytics.totalValue.toLocaleString()}`],
      ['Average Deal Size', `₹${analytics.avgDealSize.toLocaleString()}`]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 20;
    
    // Territory Performance
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Territory Performance', 14, yPosition);
    
    const territoryData = Object.entries(analytics.leadsPerTerritory).map(([territory, count]) => [
      territory || 'Unassigned',
      count.toString()
    ]);
    
    if (territoryData.length > 0) {
      autoTable(doc, {
        startY: yPosition + 10,
        head: [['Territory', 'Leads Count']],
        body: territoryData,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
    }
    
    // Sales Performance
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Sales Performance', 14, yPosition);
    
    const performanceData = analytics.salesPerformance.map(sp => [
      sp.name,
      sp.territory || 'Unassigned',
      sp.totalLeads.toString(),
      sp.convertedLeads.toString(),
      `${sp.conversionRate.toFixed(1)}%`,
      `₹${sp.totalValue.toLocaleString()}`
    ]);
    
    if (performanceData.length > 0) {
      autoTable(doc, {
        startY: yPosition + 10,
        head: [['Salesperson', 'Territory', 'Total Leads', 'Converted', 'Conversion %', 'Total Value']],
        body: performanceData,
        theme: 'grid',
        styles: { fontSize: 8 }
      });
    }
    
    // Save the PDF
    doc.save(`territorial-report-${user.full_name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
    setToast({ type: 'success', message: 'Report downloaded successfully!' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-900/20 text-blue-300';
      case 'contacted':
        return 'bg-yellow-900/20 text-yellow-300';
      case 'qualified':
        return 'bg-purple-900/20 text-purple-300';
      case 'closed':
        return 'bg-green-900/20 text-green-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const territories = [...new Set(salespersons.map(sp => sp.territory).filter(Boolean))];
  
  // Comprehensive list of Indian states and union territories for better filtering
  const indianStatesAndUTs = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
  
  // Combine actual territories from salespersons with standard Indian states/UTs
  const allTerritories = [...new Set([...territories, ...indianStatesAndUTs])].sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['crm', 'executive']}>
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
              Executive Territorial Report
            </h1>
            <p className="text-gray-400 mt-2">
              Comprehensive analytics and performance metrics across territories
            </p>
          </div>

          {/* Filters */}
          <div className="glass-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.territory}
                onChange={(e) => setFilters({...filters, territory: e.target.value})}
                className="input-field"
              >
                <option value="all">All Territories</option>
                {allTerritories.map(territory => (
                  <option key={territory} value={territory}>{territory}</option>
                ))}
              </select>
              
              <select
                value={filters.salesperson}
                onChange={(e) => setFilters({...filters, salesperson: e.target.value})}
                className="input-field"
              >
                <option value="all">All Salespersons</option>
                {salespersons.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.full_name}</option>
                ))}
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="closed">Closed</option>
              </select>
              
              <button
                onClick={generatePDF}
                className="btn-primary flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                  <p className="text-2xl font-bold text-white">{analytics.totalLeads}</p>
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
                  <p className="text-sm font-medium text-gray-400">Converted</p>
                  <p className="text-2xl font-bold text-white">{analytics.convertedLeads}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">{analytics.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">₹{parseInt(analytics.totalValue).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 card-hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-white">₹{analytics.avgDealSize.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Territory Performance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Territory Performance</h3>
              <div className="space-y-4">
                {Object.entries(analytics.leadsPerTerritory).map(([territory, count]) => (
                  <div key={territory} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">
                      {territory || 'Unassigned'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: `${(count / Math.max(...Object.values(analytics.leadsPerTerritory))) * 100}px`}}></div>
                      <span className="text-sm font-bold text-white">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
              <div className="space-y-4">
                {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: `${(count / Math.max(...Object.values(analytics.statusDistribution))) * 100}px`}}></div>
                      <span className="text-sm font-bold text-white">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Performance Table */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sales Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Salesperson</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Territory</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Total Leads</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Converted</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Conversion Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.salesPerformance
                    .sort((a, b) => b.conversionRate - a.conversionRate)
                    .map((performer) => (
                    <tr key={performer.id} className="border-b border-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{performer.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-400">{performer.territory || 'Unassigned'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-white">{performer.totalLeads}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-white">{performer.convertedLeads}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          performer.conversionRate >= 80 ? 'bg-green-900/20 text-green-300' :
                          performer.conversionRate >= 60 ? 'bg-yellow-900/20 text-yellow-300' :
                          'bg-red-900/20 text-red-300'
                        }`}>
                          {performer.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-white">₹{performer.totalValue.toLocaleString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
