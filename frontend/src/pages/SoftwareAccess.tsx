// frontend/src/pages/SoftwareAccess.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

// Types
interface Software {
  id: string;
  name: string;
  version: string;
  category: string;
  size: string;
  description: string;
  icon: string;
  popularity: number;
  requiresAdmin: boolean;
  isPreInstalled?: boolean;
}

interface InstalledSoftware {
  id: string;
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  size: string;
  icon: string;
  category: string;
  description: string;
}

interface SoftwareRequest {
  id: string;
  softwareId: string;
  softwareName: string;
  computerNumber: string;
  requesterName: string;
  requesterEmail: string;
  purpose: string;
  status: 'pending' | 'approved' | 'installed' | 'rejected' | 'completed';
  requestDate: string;
  approvedDate?: string;
  completedDate?: string;
  adminNotes?: string;
}

const SoftwareAccess: React.FC = () => {
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'installed' | 'available' | 'requests'>('installed');
  
  // Pre-installed / Built-in Windows Software
  const [installedSoftware] = useState<InstalledSoftware[]>([
    { id: 'inst1', name: 'Windows 11 Pro', version: '22H2', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '25 GB', icon: '🪟', category: 'Operating System', description: 'Windows 11 Pro operating system with latest updates' },
    { id: 'inst2', name: 'Microsoft Edge', version: '120.0.2210.121', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '450 MB', icon: '🌐', category: 'Browser', description: 'Fast and secure web browser built on Chromium' },
    { id: 'inst3', name: 'File Explorer', version: '11.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: 'N/A', icon: '📁', category: 'System Tool', description: 'Manage files and folders on your computer' },
    { id: 'inst4', name: 'Windows Security', version: '10.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '120 MB', icon: '🛡️', category: 'Security', description: 'Antivirus and threat protection' },
    { id: 'inst5', name: 'Calculator', version: '11.2307.1.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '15 MB', icon: '🧮', category: 'Utility', description: 'Basic and scientific calculator' },
    { id: 'inst6', name: 'Notepad', version: '11.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '5 MB', icon: '📝', category: 'Text Editor', description: 'Simple text editor' },
    { id: 'inst7', name: 'Paint', version: '11.2304.17.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '25 MB', icon: '🎨', category: 'Graphics', description: 'Basic image editing and drawing' },
    { id: 'inst8', name: 'Snipping Tool', version: '11.2308.20.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '8 MB', icon: '✂️', category: 'Utility', description: 'Capture screenshots' },
    { id: 'inst9', name: 'Windows Media Player', version: '12.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '180 MB', icon: '🎵', category: 'Media Player', description: 'Play audio and video files' },
    { id: 'inst10', name: 'Microsoft Store', version: '22310.1401.1.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '95 MB', icon: '🛒', category: 'App Store', description: 'Download and install apps' },
    { id: 'inst11', name: 'Task Manager', version: '11.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: 'N/A', icon: '⚙️', category: 'System Tool', description: 'Monitor system performance and processes' },
    { id: 'inst12', name: 'Command Prompt', version: '11.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '2 MB', icon: '💻', category: 'Developer Tool', description: 'Command-line interface' },
    { id: 'inst13', name: 'PowerShell', version: '7.4.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '150 MB', icon: '⚡', category: 'Developer Tool', description: 'Advanced command-line shell and scripting' },
    { id: 'inst14', name: 'Windows Terminal', version: '1.18.3181', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '85 MB', icon: '📟', category: 'Developer Tool', description: 'Modern terminal for command-line tools' },
    { id: 'inst15', name: 'Clock', version: '11.2307.12.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '12 MB', icon: '⏰', category: 'Utility', description: 'Alarms, timers, and world clock' },
    { id: 'inst16', name: 'Camera', version: '2023.2309.1.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '18 MB', icon: '📷', category: 'Utility', description: 'Use your webcam to take photos and videos' },
    { id: 'inst17', name: 'Voice Recorder', version: '11.2307.15.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '22 MB', icon: '🎙️', category: 'Utility', description: 'Record audio' },
    { id: 'inst18', name: 'Maps', version: '11.2309.1.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '210 MB', icon: '🗺️', category: 'Navigation', description: 'Get directions and explore maps' },
    { id: 'inst19', name: 'Microsoft WordPad', version: '11.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '45 MB', icon: '📄', category: 'Text Editor', description: 'Rich text document editor' },
    { id: 'inst20', name: 'Windows Backup', version: '11.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '35 MB', icon: '💾', category: 'System Tool', description: 'Backup and restore files' },
    { id: 'inst21', name: 'Disk Cleanup', version: '10.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '8 MB', icon: '🧹', category: 'System Tool', description: 'Free up disk space' },
    { id: 'inst22', name: 'Defragment and Optimize Drives', version: '10.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '6 MB', icon: '💿', category: 'System Tool', description: 'Optimize drive performance' },
    { id: 'inst23', name: 'Character Map', version: '5.0', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '3 MB', icon: '🔣', category: 'Utility', description: 'Insert special characters' },
    { id: 'inst24', name: 'Remote Desktop Connection', version: '10.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '28 MB', icon: '🖥️', category: 'Network Tool', description: 'Connect to remote computers' },
    { id: 'inst25', name: 'Steps Recorder', version: '10.0.22621.1', publisher: 'Microsoft Corporation', installDate: '2024-01-15', size: '4 MB', icon: '📹', category: 'Utility', description: 'Record steps to troubleshoot issues' }
  ]);

  // Available Software Catalog (requestable)
  const [availableSoftware] = useState<Software[]>([
    { id: '1', name: 'Microsoft Office 2021', version: '2021', category: 'Office Suite', size: '4.2 GB', description: 'Word, Excel, PowerPoint, Outlook, and more', icon: '📊', popularity: 95, requiresAdmin: true, isPreInstalled: false },
    { id: '2', name: 'Adobe Photoshop', version: '2024', category: 'Graphics', size: '3.1 GB', description: 'Professional image editing and design', icon: '🎨', popularity: 88, requiresAdmin: true, isPreInstalled: false },
    { id: '3', name: 'Visual Studio Code', version: '1.85', category: 'Development', size: '120 MB', description: 'Lightweight code editor', icon: '💻', popularity: 92, requiresAdmin: false, isPreInstalled: false },
    { id: '4', name: 'Google Chrome', version: '120.0', category: 'Browser', size: '85 MB', description: 'Fast and secure web browser', icon: '🌐', popularity: 98, requiresAdmin: false, isPreInstalled: false },
    { id: '5', name: 'AutoCAD', version: '2024', category: 'Engineering', size: '6.5 GB', description: '2D and 3D CAD design software', icon: '📐', popularity: 75, requiresAdmin: true, isPreInstalled: false },
    { id: '6', name: 'Zoom', version: '5.16', category: 'Communication', size: '250 MB', description: 'Video conferencing and meetings', icon: '🎥', popularity: 90, requiresAdmin: false, isPreInstalled: false },
    { id: '7', name: 'MATLAB', version: 'R2023b', category: 'Development', size: '8.2 GB', description: 'Numerical computing environment', icon: '📈', popularity: 70, requiresAdmin: true, isPreInstalled: false },
    { id: '8', name: 'Figma', version: '116.0', category: 'Design', size: '180 MB', description: 'UI/UX design tool', icon: '🎯', popularity: 85, requiresAdmin: false, isPreInstalled: false },
    { id: '9', name: 'VMware Workstation', version: '17.5', category: 'Virtualization', size: '550 MB', description: 'Run multiple operating systems', icon: '🖥️', popularity: 65, requiresAdmin: true, isPreInstalled: false },
    { id: '10', name: 'Python', version: '3.12', category: 'Development', size: '45 MB', description: 'Programming language', icon: '🐍', popularity: 94, requiresAdmin: false, isPreInstalled: false },
    { id: '11', name: 'Adobe Premiere Pro', version: '2024', category: 'Video Editing', size: '7.8 GB', description: 'Professional video editing', icon: '🎬', popularity: 80, requiresAdmin: true, isPreInstalled: false },
    { id: '12', name: 'Slack', version: '4.35', category: 'Communication', size: '200 MB', description: 'Team collaboration tool', icon: '💬', popularity: 82, requiresAdmin: false, isPreInstalled: false },
    { id: '13', name: 'Unity', version: '2022.3', category: 'Game Dev', size: '4.5 GB', description: 'Game development platform', icon: '🎮', popularity: 78, requiresAdmin: true, isPreInstalled: false },
    { id: '14', name: 'Notepad++', version: '8.5', category: 'Development', size: '8 MB', description: 'Advanced text editor', icon: '📝', popularity: 88, requiresAdmin: false, isPreInstalled: false },
    { id: '15', name: 'SolidWorks', version: '2024', category: 'Engineering', size: '12 GB', description: '3D CAD design software', icon: '⚙️', popularity: 72, requiresAdmin: true, isPreInstalled: false },
    { id: '16', name: 'Git', version: '2.43', category: 'Development', size: '65 MB', description: 'Version control system', icon: '📦', popularity: 91, requiresAdmin: false, isPreInstalled: false },
    { id: '17', name: 'Node.js', version: '20.10', category: 'Development', size: '85 MB', description: 'JavaScript runtime', icon: '💚', popularity: 89, requiresAdmin: false, isPreInstalled: false },
    { id: '18', name: 'Docker Desktop', version: '4.25', category: 'Development', size: '980 MB', description: 'Containerization platform', icon: '🐳', popularity: 83, requiresAdmin: true, isPreInstalled: false },
    { id: '19', name: 'MongoDB Compass', version: '1.41', category: 'Database', size: '210 MB', description: 'GUI for MongoDB', icon: '🍃', popularity: 76, requiresAdmin: false, isPreInstalled: false },
    { id: '20', name: 'Postman', version: '10.21', category: 'Development', size: '180 MB', description: 'API testing and development', icon: '📮', popularity: 87, requiresAdmin: false, isPreInstalled: false }
  ]);

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [installedCategory, setInstalledCategory] = useState<string>('all');
  const [installedSearchTerm, setInstalledSearchTerm] = useState<string>('');
  
  // State for request form
  const [requestForm, setRequestForm] = useState({
    computerNumber: '',
    requesterName: '',
    requesterEmail: '',
    purpose: '',
    additionalNotes: ''
  });
  
  // State for user's requests
  const [userRequests, setUserRequests] = useState<SoftwareRequest[]>([]);
  
  // State for success/error messages
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }
    
    // Load saved requests from localStorage
    const savedRequests = localStorage.getItem('softwareRequests');
    if (savedRequests) {
      try {
        setUserRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error('Failed to load saved requests');
      }
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('softwareRequests', JSON.stringify(userRequests));
  }, [userRequests]);

  // Filter installed software
  const filteredInstalledSoftware = installedSoftware.filter(software => {
    const matchesCategory = installedCategory === 'all' || software.category === installedCategory;
    const matchesSearch = software.name.toLowerCase().includes(installedSearchTerm.toLowerCase()) ||
                          software.description.toLowerCase().includes(installedSearchTerm.toLowerCase()) ||
                          software.publisher.toLowerCase().includes(installedSearchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter available software
  const filteredAvailableSoftware = availableSoftware.filter(software => {
    const matchesCategory = selectedCategory === 'all' || software.category === selectedCategory;
    const matchesSearch = software.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          software.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get unique categories for installed software
  const installedCategories = ['all', ...new Set(installedSoftware.map(s => s.category))];
  
  // Get unique categories for available software
  const availableCategories = ['all', ...new Set(availableSoftware.map(s => s.category))];

  // Handle request submission
  const handleRequestSubmit = (): void => {
    if (!selectedSoftware) {
      setErrorMessage('Please select a software first');
      return;
    }
    
    if (!requestForm.computerNumber.trim()) {
      setErrorMessage('Please enter computer number');
      return;
    }
    
    if (!requestForm.requesterName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    
    if (!requestForm.requesterEmail.trim() || !requestForm.requesterEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    if (!requestForm.purpose.trim()) {
      setErrorMessage('Please state your purpose for this request');
      return;
    }
    
    const newRequest: SoftwareRequest = {
      id: Date.now().toString(),
      softwareId: selectedSoftware.id,
      softwareName: selectedSoftware.name,
      computerNumber: requestForm.computerNumber,
      requesterName: requestForm.requesterName,
      requesterEmail: requestForm.requesterEmail,
      purpose: requestForm.purpose,
      status: 'pending',
      requestDate: new Date().toLocaleString(),
      adminNotes: requestForm.additionalNotes || undefined
    };
    
    setUserRequests(prev => [newRequest, ...prev]);
    setSuccessMessage(`Request for ${selectedSoftware.name} submitted successfully!`);
    setShowRequestModal(false);
    setSelectedSoftware(null);
    setRequestForm({
      computerNumber: '',
      requesterName: '',
      requesterEmail: '',
      purpose: '',
      additionalNotes: ''
    });
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getStatusBadge = (status: SoftwareRequest['status']): string => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'installed': return 'status-installed';
      case 'rejected': return 'status-rejected';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status: SoftwareRequest['status']): string => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'installed': return 'Installing';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      default: return 'Pending';
    }
  };

  return (
    <div className={`software-access-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <Sidebar />
      <div className="software-container">
        <main className="software-main">
          <div className="software-header">
            <h1 className="software-title">Software Access Center</h1>
            <p className="software-subtitle">View installed software or request new installations on public computers</p>
          </div>
          
          {successMessage && (
            <div className="success-message">
              <span>✓ {successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="error-message">
              <span>⚠ {errorMessage}</span>
              <button onClick={() => setErrorMessage('')}>×</button>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'installed' ? 'active' : ''}`}
              onClick={() => setActiveTab('installed')}
            >
              💻 Installed Software ({installedSoftware.length})
            </button>
            <button 
              className={`tab ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              📦 Available Software ({availableSoftware.length})
            </button>
            <button 
              className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              📋 My Requests ({userRequests.length})
            </button>
          </div>

          {/* Installed Software Tab */}
          {activeTab === 'installed' && (
            <>
              <div className="search-filter-bar">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search installed software by name, publisher, or description..."
                    value={installedSearchTerm}
                    onChange={(e) => setInstalledSearchTerm(e.target.value)}
                  />
                  {installedSearchTerm && (
                    <button className="clear-search" onClick={() => setInstalledSearchTerm('')}>×</button>
                  )}
                </div>
                
                <div className="filter-buttons">
                  {installedCategories.map(category => (
                    <button
                      key={category}
                      className={`filter-btn ${installedCategory === category ? 'active' : ''}`}
                      onClick={() => setInstalledCategory(category)}
                    >
                      {category === 'all' ? 'All' : category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stats-bar">
                <span>📊 Total Installed: {filteredInstalledSoftware.length} applications</span>
                <span>💾 Includes Windows built-in applications</span>
              </div>

              <div className="software-grid">
                {filteredInstalledSoftware.length > 0 ? (
                  filteredInstalledSoftware.map(software => (
                    <div key={software.id} className="software-card installed-card">
                      <div className="software-card-header">
                        <div className="software-icon">{software.icon}</div>
                        <div className="software-info">
                          <h3>{software.name}</h3>
                          <p className="software-version">Version {software.version}</p>
                          <p className="software-publisher">{software.publisher}</p>
                        </div>
                        <span className="installed-badge">✅ Installed</span>
                      </div>
                      <p className="software-description">{software.description}</p>
                      <div className="software-meta">
                        <span className="meta-item">📦 {software.size}</span>
                        <span className="meta-item">📅 Installed: {software.installDate}</span>
                        <span className="meta-item">📂 {software.category}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>🔍 No installed software found matching your search.</p>
                    <button onClick={() => { setInstalledSearchTerm(''); setInstalledCategory('all'); }}>
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Available Software Tab */}
          {activeTab === 'available' && (
            <>
              <div className="search-filter-bar">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search software by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
                  )}
                </div>
                
                <div className="filter-buttons">
                  {availableCategories.map(category => (
                    <button
                      key={category}
                      className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All' : category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stats-bar">
                <span>📊 Available for Request: {filteredAvailableSoftware.length} applications</span>
                <span>👑 Admin approval may be required for some software</span>
              </div>

              <div className="software-grid">
                {filteredAvailableSoftware.length > 0 ? (
                  filteredAvailableSoftware.map(software => (
                    <div key={software.id} className="software-card">
                      <div className="software-card-header">
                        <div className="software-icon">{software.icon}</div>
                        <div className="software-info">
                          <h3>{software.name}</h3>
                          <p className="software-version">Version {software.version}</p>
                        </div>
                        {software.requiresAdmin && (
                          <span className="admin-badge" title="Requires administrator approval">👑 Admin</span>
                        )}
                      </div>
                      <p className="software-description">{software.description}</p>
                      <div className="software-meta">
                        <span className="meta-item">📦 {software.size}</span>
                        <span className="meta-item">⭐ {software.popularity}%</span>
                        <span className="meta-item">📂 {software.category}</span>
                      </div>
                      <button 
                        className="request-btn"
                        onClick={() => {
                          setSelectedSoftware(software);
                          setShowRequestModal(true);
                        }}
                      >
                        Request Installation
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>🔍 No software found matching your search.</p>
                    <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* My Requests Tab */}
          {activeTab === 'requests' && (
            <div className="requests-container">
              {userRequests.length > 0 ? (
                userRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div className="request-software">
                        <span className="request-icon">📦</span>
                        <div>
                          <h4>{request.softwareName}</h4>
                          <p className="request-meta">Computer #{request.computerNumber} • {request.requestDate}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusBadge(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    <div className="request-details">
                      <p><strong>Purpose:</strong> {request.purpose}</p>
                      {request.adminNotes && (
                        <p><strong>Admin Notes:</strong> {request.adminNotes}</p>
                      )}
                      {request.approvedDate && (
                        <p className="request-date"><strong>Approved:</strong> {request.approvedDate}</p>
                      )}
                      {request.completedDate && (
                        <p className="request-date"><strong>Completed:</strong> {request.completedDate}</p>
                      )}
                    </div>
                    {request.status === 'pending' && (
                      <div className="request-actions">
                        <button 
                          className="cancel-request-btn"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this request?')) {
                              setUserRequests(prev => prev.filter(r => r.id !== request.id));
                              setSuccessMessage('Request cancelled successfully');
                              setTimeout(() => setSuccessMessage(''), 3000);
                            }
                          }}
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-requests">
                  <p>📭 You haven't made any software requests yet.</p>
                  <button onClick={() => setActiveTab('available')}>
                    Browse Available Software
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Request Modal */}
          {showRequestModal && selectedSoftware && (
            <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Request Installation</h3>
                  <button className="modal-close" onClick={() => setShowRequestModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="selected-software-info">
                    <span className="selected-icon">{selectedSoftware.icon}</span>
                    <div>
                      <strong>{selectedSoftware.name}</strong>
                      <p>Version {selectedSoftware.version} • {selectedSoftware.size}</p>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Computer Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., PC-01, Lab 2 - Computer 5"
                      value={requestForm.computerNumber}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, computerNumber: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={requestForm.requesterName}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, requesterName: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={requestForm.requesterEmail}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, requesterEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Purpose of Request *</label>
                    <textarea
                      rows={3}
                      placeholder="Explain why you need this software (e.g., for thesis, research, project, etc.)"
                      value={requestForm.purpose}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, purpose: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Additional Notes (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Any special requirements or notes for the admin"
                      value={requestForm.additionalNotes}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    />
                  </div>
                  
                  <div className="info-box">
                    <p>ℹ️ <strong>Request Process:</strong></p>
                    <ul>
                      <li>Your request will be reviewed by an administrator</li>
                      <li>Approved requests will be processed within 24 hours</li>
                      <li>You will be notified when the software is ready for use</li>
                      <li>For urgent requests, please contact the ICT office directly</li>
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowRequestModal(false)}>Cancel</button>
                  <button className="btn-submit" onClick={handleRequestSubmit}>Submit Request</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        :root {
          font-size: 14px;
          --bg: #f8fafc;
          --card-bg: #ffffff;
          --text-primary: #1e293b;
          --text-secondary: #475569;
          --border: #e2e8f0;
          --accent: #3b82f6;
          --accent-hover: #2563eb;
          --pending: #f59e0b;
          --approved: #10b981;
          --rejected: #ef4444;
          --installed: #8b5cf6;
          --completed: #06b6d4;
        }

        body.dark-mode {
          --bg: #0f172a;
          --card-bg: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --border: #334155;
          background: var(--bg);
        }

        .software-access-wrapper {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: var(--bg);
        }

        .software-container {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
          height: 100vh;
          scrollbar-width: thin;
        }

        .software-container::-webkit-scrollbar {
          width: 10px;
        }

        .software-container::-webkit-scrollbar-track {
          background: #e2e8f0;
        }

        .software-container::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
        }

        .dark-mode .software-container::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark-mode .software-container::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .software-main {
          max-width: 1400px;
          margin: 0 auto;
        }

        .software-header {
          margin-bottom: 2rem;
        }

        .software-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .software-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid var(--border);
          flex-wrap: wrap;
        }

        .tab {
          background: none;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .tab:hover {
          color: var(--accent);
        }

        .tab.active {
          color: var(--accent);
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent);
        }

        .search-filter-bar {
          margin-bottom: 1.5rem;
        }

        .search-box {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 1rem;
          background: var(--card-bg);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--card-bg);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .filter-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .filter-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }

        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .software-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .software-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .software-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .installed-card {
          border-left: 4px solid #10b981;
        }

        .dark-mode .installed-card {
          border-left-color: #34d399;
        }

        .software-card-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .software-icon {
          font-size: 2.5rem;
        }

        .software-info {
          flex: 1;
        }

        .software-info h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .software-version {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .software-publisher {
          font-size: 0.65rem;
          color: #64748b;
          margin-top: 0.2rem;
        }

        .admin-badge, .installed-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          white-space: nowrap;
        }

        .admin-badge {
          background: #fef3c7;
          color: #d97706;
        }

        .installed-badge {
          background: #d1fae5;
          color: #059669;
        }

        .dark-mode .admin-badge {
          background: #451a03;
          color: #fbbf24;
        }

        .dark-mode .installed-badge {
          background: #064e3b;
          color: #34d399;
        }

        .software-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .software-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.7rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .request-btn {
          width: 100%;
          padding: 0.6rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .request-btn:hover {
          background: var(--accent-hover);
        }

        .requests-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .request-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .request-software {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .request-icon {
          font-size: 1.5rem;
        }

        .request-software h4 {
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .request-meta {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .dark-mode .status-pending { background: #451a03; color: #fbbf24; }
        .status-approved { background: #d1fae5; color: #059669; }
        .dark-mode .status-approved { background: #064e3b; color: #34d399; }
        .status-installed { background: #ede9fe; color: #7c3aed; }
        .dark-mode .status-installed { background: #2e1065; color: #a78bfa; }
        .status-rejected { background: #fee2e2; color: #dc2626; }
        .dark-mode .status-rejected { background: #7f1d1d; color: #fca5a5; }
        .status-completed { background: #cffafe; color: #0891b2; }
        .dark-mode .status-completed { background: #164e63; color: #67e8f9; }

        .request-details {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .request-details p {
          margin-bottom: 0.5rem;
        }

        .cancel-request-btn {
          padding: 0.4rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .cancel-request-btn:hover {
          background: #dc2626;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 16px;
          width: 550px;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h3 {
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .selected-software-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .selected-icon {
          font-size: 2rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--card-bg);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--accent);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .info-box {
          background: var(--bg);
          border-left: 4px solid var(--accent);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .info-box ul {
          margin-top: 0.5rem;
          margin-left: 1.25rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .info-box li {
          margin-bottom: 0.25rem;
        }

        .btn-submit {
          background: var(--accent);
          color: white;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-submit:hover {
          background: var(--accent-hover);
        }

        .btn-cancel {
          background: #64748b;
          color: white;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .success-message {
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          border-left: 4px solid #10b981;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          border-left: 4px solid #ef4444;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-message button {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #991b1b;
        }

        .no-results,
        .empty-requests {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .no-results button,
        .empty-requests button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .software-container {
            padding: 1rem;
          }
          
          .software-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .filter-buttons {
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }
          
          .tabs {
            gap: 0.25rem;
          }
          
          .tab {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }
          
          .stats-bar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default SoftwareAccess;