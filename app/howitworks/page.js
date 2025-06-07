'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  FileText, 
  MapPin, 
  Settings, 
  PieChart,
  Building,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  Play,
  Globe,
  Target,
  TrendingUp,
  Shield,
  Clock,
  Zap,
  Pause,
  RotateCcw,
  Database,
  Bell,
  Eye,
  Award
} from 'lucide-react';
import Link from 'next/link';

const WorkflowVisualization = ({ role, currentStep, onStepChange }) => {
  const roleData = {
    admin: {
      color: 'from-red-500 to-red-700',
      steps: [
        { id: 1, title: 'User Creation', icon: <Users className="w-5 h-5" />, connections: [2] },
        { id: 2, title: 'Role Assignment', icon: <Shield className="w-5 h-5" />, connections: [3, 4] },
        { id: 3, title: 'System Config', icon: <Settings className="w-5 h-5" />, connections: [4] },
        { id: 4, title: 'Monitor & Reports', icon: <Eye className="w-5 h-5" />, connections: [] }
      ]
    },
    executive: {
      color: 'from-purple-500 to-purple-700',
      steps: [
        { id: 1, title: 'Dashboard Review', icon: <PieChart className="w-5 h-5" />, connections: [2] },
        { id: 2, title: 'Performance Analysis', icon: <TrendingUp className="w-5 h-5" />, connections: [3] },
        { id: 3, title: 'Strategic Planning', icon: <Target className="w-5 h-5" />, connections: [4] },
        { id: 4, title: 'Team Oversight', icon: <Users className="w-5 h-5" />, connections: [] }
      ]
    },
    crm: {
      color: 'from-blue-500 to-blue-700',
      steps: [
        { id: 1, title: 'Lead Creation', icon: <FileText className="w-5 h-5" />, connections: [2] },
        { id: 2, title: 'Lead Qualification', icon: <Award className="w-5 h-5" />, connections: [3] },
        { id: 3, title: 'Assignment', icon: <MapPin className="w-5 h-5" />, connections: [4] },
        { id: 4, title: 'Monitoring', icon: <Eye className="w-5 h-5" />, connections: [] }
      ]
    },
    hr: {
      color: 'from-green-500 to-green-700',
      steps: [
        { id: 1, title: 'Employee Onboarding', icon: <UserCheck className="w-5 h-5" />, connections: [2] },
        { id: 2, title: 'Profile Setup', icon: <Users className="w-5 h-5" />, connections: [3] },
        { id: 3, title: 'Access Control', icon: <Shield className="w-5 h-5" />, connections: [4] },
        { id: 4, title: 'Directory Management', icon: <Database className="w-5 h-5" />, connections: [] }
      ]
    },
    salesperson: {
      color: 'from-orange-500 to-orange-700',
      steps: [
        { id: 1, title: 'Receive Assignment', icon: <Bell className="w-5 h-5" />, connections: [2] },
        { id: 2, title: 'Location Update', icon: <MapPin className="w-5 h-5" />, connections: [3] },
        { id: 3, title: 'Customer Contact', icon: <Phone className="w-5 h-5" />, connections: [4] },
        { id: 4, title: 'Status Update', icon: <CheckCircle className="w-5 h-5" />, connections: [] }
      ]
    }
  };

  const currentRoleData = roleData[role];
  if (!currentRoleData) return null;

  return (
    <div className="relative w-full h-64 bg-gray-900/50 rounded-xl p-6 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {/* Connection Lines */}
        {currentRoleData.steps.map((step, index) => 
          step.connections.map(connectionId => {
            const targetIndex = currentRoleData.steps.findIndex(s => s.id === connectionId);
            const sourceX = 25 + (index * (100 / (currentRoleData.steps.length - 1)));
            const sourceY = 50;
            const targetX = 25 + (targetIndex * (100 / (currentRoleData.steps.length - 1)));
            const targetY = 50;

            return (
              <motion.line
                key={`${step.id}-${connectionId}`}
                x1={`${sourceX}%`}
                y1={`${sourceY}%`}
                x2={`${targetX}%`}
                y2={`${targetY}%`}
                stroke="url(#gradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: currentStep >= index ? 1 : 0,
                  opacity: currentStep >= index ? 1 : 0.3 
                }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              />
            );
          })
        )}
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Step Nodes */}
      <div className="relative z-10 flex justify-between items-center h-full">
        {currentRoleData.steps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`relative cursor-pointer transition-all duration-300 ${
              currentStep >= index ? 'scale-110' : 'scale-100'
            }`}
            onClick={() => onStepChange(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-white ${
                currentStep >= index 
                  ? `bg-gradient-to-r ${currentRoleData.color} border-white shadow-lg` 
                  : 'bg-gray-700 border-gray-500'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {step.icon}
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-300 font-medium whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              {step.title}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Real-time Demo Section Component
const RealTimeDemo = ({ selectedRole }) => {
  const [demoStep, setDemoStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoData = {
    admin: [
      { action: "Creating new user account...", status: "✓", time: "2s" },
      { action: "Assigning CRM role...", status: "✓", time: "1s" },
      { action: "Setting permissions...", status: "✓", time: "1s" },
      { action: "Sending welcome email...", status: "✓", time: "3s" }
    ],
    crm: [
      { action: "Receiving new lead...", status: "✓", time: "1s" },
      { action: "Extracting GPS coordinates...", status: "✓", time: "2s" },
      { action: "Finding nearby salesperson...", status: "✓", time: "2s" },
      { action: "Assigning to John Doe...", status: "✓", time: "1s" }
    ],
    salesperson: [
      { action: "New assignment received!", status: "✓", time: "0s" },
      { action: "Accepting assignment...", status: "✓", time: "2s" },
      { action: "Updating location...", status: "✓", time: "1s" },
      { action: "Starting customer contact...", status: "✓", time: "3s" }
    ]
  };

  const currentDemo = demoData[selectedRole] || demoData.crm;

  useEffect(() => {
    if (isPlaying && demoStep < currentDemo.length) {
      const timer = setTimeout(() => {
        setDemoStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (demoStep >= currentDemo.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, demoStep, currentDemo.length]);

  const startDemo = () => {
    setDemoStep(0);
    setIsPlaying(true);
  };

  const resetDemo = () => {
    setDemoStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Live Demo Simulation</h3>
        <div className="flex space-x-2">
          <button
            onClick={startDemo}
            disabled={isPlaying}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
          <button
            onClick={resetDemo}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {currentDemo.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index <= demoStep ? 1 : 0.3,
              x: index <= demoStep ? 0 : -20
            }}
            transition={{ duration: 0.5 }}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              index <= demoStep ? 'bg-green-900/20 border border-green-700' : 'bg-gray-800/50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
              index <= demoStep ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'
            }`}>
              {index < demoStep ? '✓' : index + 1}
            </div>
            <span className={`flex-1 ${index <= demoStep ? 'text-white' : 'text-gray-400'}`}>
              {step.action}
            </span>
            {index <= demoStep && (
              <span className="text-green-400 text-sm">
                {step.time}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {demoStep >= currentDemo.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg text-center"
        >
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-medium">Demo completed successfully!</p>
        </motion.div>
      )}
    </div>
  );
};

const HowItWorksPage = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showDemo, setShowDemo] = useState(false);

  // Role definitions with their workflows
  const roles = {
    admin: {
      title: 'System Administrator',
      description: 'Complete system control and user management',
      color: 'from-red-500 to-red-700',
      icon: <Shield className="w-6 h-6" />,
      steps: [
        {
          title: 'User Management',
          description: 'Create and manage all user accounts across the organization',
          icon: <Users className="w-8 h-8" />,
          features: ['Create HR, CRM, Executive, and Salesperson accounts', 'Assign roles and permissions', 'Monitor user activity', 'Deactivate/reactivate accounts']
        },
        {
          title: 'System Configuration',
          description: 'Configure system-wide settings and parameters',
          icon: <Settings className="w-8 h-8" />,
          features: ['Database management', 'API configurations', 'Security settings', 'System monitoring']
        },
        {
          title: 'Lead Deletion Rights',
          description: 'Exclusive ability to permanently delete leads from the system',
          icon: <FileText className="w-8 h-8" />,
          features: ['Delete sensitive or duplicate leads', 'Maintain data integrity', 'Compliance management', 'Audit trail maintenance']
        },
        {
          title: 'Analytics & Reports',
          description: 'Access to comprehensive system analytics and reports',
          icon: <PieChart className="w-8 h-8" />,
          features: ['System performance metrics', 'User activity reports', 'Sales conversion analytics', 'Territory performance']
        }
      ]
    },
    executive: {
      title: 'Executive',
      description: 'Strategic oversight and business intelligence',
      color: 'from-purple-500 to-purple-700',
      icon: <TrendingUp className="w-6 h-6" />,
      steps: [
        {
          title: 'Dashboard Overview',
          description: 'High-level view of business performance and key metrics',
          icon: <PieChart className="w-8 h-8" />,
          features: ['Sales pipeline overview', 'Revenue tracking', 'Territory performance', 'Team productivity metrics']
        },
        {
          title: 'Strategic Reports',
          description: 'Access to detailed business intelligence and analytics',
          icon: <FileText className="w-8 h-8" />,
          features: ['Quarterly sales reports', 'Market analysis', 'Performance comparisons', 'Growth projections']
        },
        {
          title: 'Team Oversight',
          description: 'Monitor team performance and resource allocation',
          icon: <Users className="w-8 h-8" />,
          features: ['Salesperson performance tracking', 'Territory assignments', 'Resource utilization', 'Training needs assessment']
        },
        {
          title: 'User Management',
          description: 'Limited user management capabilities for operational needs',
          icon: <UserCheck className="w-8 h-8" />,
          features: ['View all user profiles', 'Monitor user activity', 'Generate user reports', 'Support decision making']
        }
      ]
    },
    crm: {
      title: 'CRM Manager',
      description: 'Lead management and sales coordination',
      color: 'from-blue-500 to-blue-700',
      icon: <Target className="w-6 h-6" />,
      steps: [
        {
          title: 'Lead Creation',
          description: 'Create and qualify new sales leads from various sources',
          icon: <FileText className="w-8 h-8" />,
          features: ['Create leads with GPS coordinates', 'Set lead priority (Hot/Warm/Cold)', 'Add contact information', 'Include detailed notes']
        },
        {
          title: 'Pre-Lead Management',
          description: 'Manage prospecting pipeline and potential opportunities',
          icon: <Building className="w-8 h-8" />,
          features: ['Track prospects by country/state', 'Categorize lead sources', 'Monitor qualification progress', 'Convert to active leads']
        },
        {
          title: 'Lead Assignment',
          description: 'Intelligently assign leads to salespersons based on location',
          icon: <MapPin className="w-8 h-8" />,
          features: ['GPS-based assignment', 'Load balancing', 'Skill-based matching', 'Priority consideration']
        },
        {
          title: 'Sales Coordination',
          description: 'Monitor and coordinate sales activities across the team',
          icon: <Users className="w-8 h-8" />,
          features: ['Track assignment status', 'Monitor follow-ups', 'Coordinate team activities', 'Performance reporting']
        }
      ]
    },
    hr: {
      title: 'HR Manager',
      description: 'Human resources and employee onboarding',
      color: 'from-green-500 to-green-700',
      icon: <Users className="w-6 h-6" />,
      steps: [
        {
          title: 'Employee Onboarding',
          description: 'Streamlined process for new employee registration',
          icon: <UserCheck className="w-8 h-8" />,
          features: ['Create new employee accounts', 'Assign initial roles', 'Set up profiles', 'Generate credentials']
        },
        {
          title: 'Profile Management',
          description: 'Manage employee profiles and information',
          icon: <Users className="w-8 h-8" />,
          features: ['Update employee details', 'Manage contact information', 'Handle profile photos', 'Track employment status']
        },
        {
          title: 'Access Control',
          description: 'Manage user access and permissions within HR scope',
          icon: <Shield className="w-8 h-8" />,
          features: ['Role assignment', 'Permission management', 'Account activation/deactivation', 'Access monitoring']
        },
        {
          title: 'Employee Directory',
          description: 'Maintain comprehensive employee directory and records',
          icon: <FileText className="w-8 h-8" />,
          features: ['Employee database', 'Contact directory', 'Organizational chart', 'Reporting structures']
        }
      ]
    },
    salesperson: {
      title: 'Sales Representative',
      description: 'Field sales and customer relationship management',
      color: 'from-orange-500 to-orange-700',
      icon: <MapPin className="w-6 h-6" />,
      steps: [
        {
          title: 'Assignment Reception',
          description: 'Receive and accept new lead assignments',
          icon: <FileText className="w-8 h-8" />,
          features: ['View assigned leads', 'Accept/reject assignments', 'Priority-based queue', 'Lead details access']
        },
        {
          title: 'Location Tracking',
          description: 'Real-time GPS location updates for field activities',
          icon: <MapPin className="w-8 h-8" />,
          features: ['GPS check-ins', 'Route optimization', 'Location history', 'Territory coverage']
        },
        {
          title: 'Customer Engagement',
          description: 'Direct customer interaction and relationship building',
          icon: <Phone className="w-8 h-8" />,
          features: ['Customer calls', 'Site visits', 'Proposal presentations', 'Relationship management']
        },
        {
          title: 'Status Updates',
          description: 'Real-time updates on lead progress and sales activities',
          icon: <CheckCircle className="w-8 h-8" />,
          features: ['Progress tracking', 'Status updates', 'Activity logging', 'Completion reports']
        }
      ]
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const maxSteps = roles[selectedRole].steps.length;
        return (prev + 1) % maxSteps;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedRole, isAutoPlaying]);

  // Reset step when role changes
  useEffect(() => {
    setCurrentStep(0);
  }, [selectedRole]);

  const currentRoleData = roles[selectedRole];
  const currentStepData = currentRoleData.steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className=" rounded-lg flex items-center justify-center">
                  <img src='/logo.png' className="w-15 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Bonhoeffer Machines CRM</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <Link 
                    href="/login" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                    Login
                </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              How Our CRM <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Works</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover how our role-based CRM system streamlines sales operations across India with intelligent lead management, real-time tracking, and comprehensive analytics.
            </p>
            
            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: <Users className="w-6 h-6" />, text: "5 User Roles" },
                { icon: <MapPin className="w-6 h-6" />, text: "GPS Tracking" },
                { icon: <Zap className="w-6 h-6" />, text: "Real-time Updates" },
                { icon: <PieChart className="w-6 h-6" />, text: "Advanced Analytics" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                >
                  <div className="text-blue-400 mb-2">{feature.icon}</div>
                  <p className="text-gray-300 text-sm font-medium">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Select Your Role</h2>
          <p className="text-gray-400 mb-8">Choose a role to see how the CRM system works for different user types</p>
          
          {/* Role Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Object.entries(roles).map(([key, role]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRole(key)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedRole === key
                    ? `bg-gradient-to-r ${role.color} border-transparent text-white shadow-lg`
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                {role.icon}
                <div className="text-left">
                  <div className="font-semibold">{role.title}</div>
                  <div className="text-sm opacity-80">{role.description}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Auto-play Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isAutoPlaying 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{isAutoPlaying ? 'Pause' : 'Play'} Auto-demo</span>
            </button>
          </div>
        </motion.div>

        {/* Workflow Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Step Navigation */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                {currentRoleData.title} Workflow
              </h3>
              
              <div className="space-y-4">
                {currentRoleData.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setCurrentStep(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                      currentStep === index
                        ? `bg-gradient-to-r ${currentRoleData.color} border-transparent text-white shadow-lg`
                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${currentStep === index ? 'bg-white/20' : 'bg-gray-700'}`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{step.title}</h4>
                        <p className="text-sm opacity-80">{step.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 opacity-60" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Step Details */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedRole}-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gray-900/50 rounded-xl p-6 border border-gray-600"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${currentRoleData.color}`}>
                      {currentStepData.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white">{currentStepData.title}</h4>
                      <p className="text-gray-400">{currentStepData.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-lg font-semibold text-white mb-4">Key Features:</h5>
                    {currentStepData.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">
                        Step {currentStep + 1} of {currentRoleData.steps.length}
                      </span>
                      <span className="text-sm text-gray-400">
                        {Math.round(((currentStep + 1) / currentRoleData.steps.length) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / currentRoleData.steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-2 rounded-full bg-gradient-to-r ${currentRoleData.color}`}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Workflow Diagram */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Interactive Workflow</h2>
          <p className="text-gray-400">
            See how tasks flow through the system for the {currentRoleData.title}
          </p>
        </motion.div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-8">
          <WorkflowVisualization 
            role={selectedRole} 
            currentStep={currentStep} 
            onStepChange={(step) => {
              setCurrentStep(step);
              setIsAutoPlaying(false);
            }} 
          />
        </div>

        {/* Real-time Demo Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RealTimeDemo selectedRole={selectedRole} />
          
          {/* System Stats */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">System Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Active Users', value: '247', change: '+12%', positive: true },
                { label: 'Leads Today', value: '89', change: '+23%', positive: true },
                { label: 'Conversions', value: '34', change: '+8%', positive: true },
                { label: 'Response Time', value: '1.2s', change: '-15%', positive: true }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
                  <div className={`text-xs font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Live Activity Feed */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-white mb-4">Live Activity</h4>
              <div className="space-y-2 max-h-32 overflow-hidden">
                {[
                  { user: 'John Doe', action: 'accepted lead assignment', time: '2m ago' },
                  { user: 'Sarah Smith', action: 'updated location', time: '5m ago' },
                  { user: 'CRM Manager', action: 'created new lead', time: '8m ago' },
                  { user: 'Mike Johnson', action: 'completed sales call', time: '12m ago' }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-300">
                      <span className="font-medium text-white">{activity.user}</span> {activity.action}
                    </span>
                    <span className="text-gray-500">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Accounts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Try It Yourself</h2>
          <p className="text-gray-400 mb-8">
            Experience the CRM system with our demo accounts. Each role has pre-configured data to showcase the functionality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { role: 'Admin', email: 'admin@bonhoeffer.com', password: 'admin123', description: 'Full system access' },
              { role: 'Executive', email: 'executive@bonhoeffer.com', password: 'exec123', description: 'Strategic oversight' },
              { role: 'CRM Manager', email: 'crm@bonhoeffer.com', password: 'crm123', description: 'Lead management' },
              { role: 'HR Manager', email: 'hr@bonhoeffer.com', password: 'hr123', description: 'Employee onboarding' },
              { role: 'Salesperson', email: 'salesperson@bonhoeffer.com', password: 'sales123', description: 'Field operations' }
            ].slice(0, 5).map((demo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-colors"
              >
                <div className="text-lg font-semibold text-white mb-2">{demo.role}</div>
                <div className="text-sm text-gray-400 mb-4">{demo.description}</div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div><span className="font-medium">Email:</span> {demo.email}</div>
                  <div><span className="font-medium">Password:</span> {demo.password}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <Link 
            href="/login"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>Start Your Demo</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      {/* System Features Overview */}
      <div className="bg-gray-800/30 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Comprehensive CRM Solution</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built specifically for Indian sales teams with advanced features for lead management, territory tracking, and performance analytics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "GPS Integration",
                description: "Real-time location tracking and intelligent lead assignment based on geographic proximity."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Role-Based Access",
                description: "Five distinct user roles with customized interfaces and permissions for each function."
              },
              {
                icon: <PieChart className="w-8 h-8" />,
                title: "Advanced Analytics",
                description: "Comprehensive reporting and analytics to track performance and optimize sales processes."
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Real-Time Updates",
                description: "Instant synchronization across all devices and users for up-to-date information."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure & Scalable",
                description: "Enterprise-grade security with scalable architecture to grow with your business."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "India-Focused",
                description: "Designed specifically for Indian markets with local language and cultural considerations."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-colors"
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
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
};

export default HowItWorksPage;
