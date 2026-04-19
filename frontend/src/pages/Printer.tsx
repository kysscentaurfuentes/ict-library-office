// frontend/src/pages/Printer.tsx
// FILE PATH: frontend/src/pages/Printer.tsx
// COMPONENT: Printer Services Page
// DESCRIPTION: Print documents directly without Microsoft Word or PDF reader
// INTEGRATION: Uses Sidebar component for navigation
// BACKEND NOTES: For Electron app with IPP/RAW 9100/CUPS support

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';

// Types
interface PrintJob {
  id: string;
  fileName: string;
  fileType: string;
  copies: number;
  pageRange: string;
  colorMode: 'color' | 'grayscale';
  paperSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  duplex: boolean;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  submittedAt: string;
  printedAt?: string;
  errorMessage?: string;
}

interface PrinterInfo {
  name: string;
  model: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  paperLevel: number;
  inkLevel: {
    black: number;
    cyan: number;
    magenta: number;
    yellow: number;
  };
  totalPagesPrinted: number;
}

const Printer: React.FC = () => {
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'print' | 'history'>('print');
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for print settings
  const [printSettings, setPrintSettings] = useState({
    copies: 1,
    pageRange: 'all',
    colorMode: 'color' as 'color' | 'grayscale',
    paperSize: 'A4' as 'A4' | 'Letter' | 'Legal',
    orientation: 'portrait' as 'portrait' | 'landscape',
    duplex: false,
    printQuality: 'normal' as 'draft' | 'normal' | 'high'
  });
  
  // State for print jobs history
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  
  // State for printer info
  const [printerInfo, setPrinterInfo] = useState<PrinterInfo>({
    name: 'Brother DCP-T710W',
    model: 'DCP-T710W',
    status: 'online',
    paperLevel: 100,
    inkLevel: {
      black: 75,
      cyan: 65,
      magenta: 60,
      yellow: 70
    },
    totalPagesPrinted: 1247
  });
  
  // State for messages
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }
    
    // Load print history from localStorage
    const savedJobs = localStorage.getItem('printJobs');
    if (savedJobs) {
      try {
        setPrintJobs(JSON.parse(savedJobs));
      } catch (e) {
        console.error('Failed to load print jobs');
      }
    }
  }, []);

  // Save print jobs to localStorage
  useEffect(() => {
    localStorage.setItem('printJobs', JSON.stringify(printJobs));
  }, [printJobs]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type (allow common document types)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.oasis.opendocument.text'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|odt)$/i)) {
      setErrorMessage('Unsupported file type. Please upload PDF, DOC, DOCX, TXT, JPG, PNG, GIF, or ODT files.');
      return;
    }
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File too large. Maximum size is 50MB.');
      return;
    }
    
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    
    // For text files, read content for preview
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setFileContent('');
    }
    
    setErrorMessage('');
  };

  // Handle print submission
  const handlePrint = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to print.');
      return;
    }
    
    setIsPrinting(true);
    
    // Create print job record
    const newJob: PrintJob = {
      id: Date.now().toString(),
      fileName: selectedFile.name,
      fileType: selectedFile.type || selectedFile.name.split('.').pop() || 'unknown',
      copies: printSettings.copies,
      pageRange: printSettings.pageRange,
      colorMode: printSettings.colorMode,
      paperSize: printSettings.paperSize,
      orientation: printSettings.orientation,
      duplex: printSettings.duplex,
      status: 'pending',
      submittedAt: new Date().toLocaleString()
    };
    
    setPrintJobs(prev => [newJob, ...prev]);
    
    // ============================================================
    // BACKEND INTEGRATION CODE (COMMENTED - READY FOR ELECTRON)
    // ============================================================
    // When ready to implement backend with Electron, uncomment the code below.
    // This component is designed to work with Electron's print capabilities
    // which bypass browser security restrictions for printing.
    //
    // For Electron implementation:
    // 1. Use ipcRenderer to send print job to main process
    // 2. Main process can use Node.js libraries for printing:
    //    - 'ipp' package for IPP protocol
    //    - 'net' for RAW 9100 printing
    //    - 'child_process' for CUPS commands
    // 3. Or use Electron's built-in webContents.print() for PDF/HTML
    //
    // ============================================================
    
    /*
    // === ELECTRON IPC PRINTING EXAMPLE ===
    // Uncomment when Electron is integrated
    
    const { ipcRenderer } = window.require('electron');
    
    try {
      // Read file as buffer or base64
      const reader = new FileReader();
      reader.onload = async () => {
        const fileData = reader.result;
        
        // Send to main process for printing
        const result = await ipcRenderer.invoke('print-document', {
          fileData: fileData,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          printerName: 'Brother_DCP_T710W',
          copies: printSettings.copies,
          colorMode: printSettings.colorMode,
          paperSize: printSettings.paperSize,
          orientation: printSettings.orientation,
          duplex: printSettings.duplex,
          printQuality: printSettings.printQuality,
          pageRange: printSettings.pageRange
        });
        
        if (result.success) {
          // Update job status
          setPrintJobs(prev => prev.map(job => 
            job.id === newJob.id 
              ? { ...job, status: 'completed', printedAt: new Date().toLocaleString() }
              : job
          ));
          setSuccessMessage(`Successfully printed ${selectedFile.name}`);
          setSelectedFile(null);
          setFilePreview('');
          setFileContent('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          throw new Error(result.error);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setPrintJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'failed', errorMessage: error.message }
          : job
      ));
      setErrorMessage(`Print failed: ${error.message}`);
    }
    */
    
    // ============================================================
    // IPP PROTOCOL EXAMPLE (Network Printers)
    // ============================================================
    /*
    // Using 'ipp' npm package
    const IPP = require('ipp');
    const printer = IPP.Printer('http://192.168.1.100:631/ipp/print');
    
    const data = {
      'operation-attributes-tag': {
        'requesting-user-name': 'User',
        'job-name': selectedFile.name,
        'document-format': 'application/pdf'
      },
      'job-attributes-tag': {
        'copies': printSettings.copies,
        'sides': printSettings.duplex ? 'two-sided-long-edge' : 'one-sided',
        'print-color-mode': printSettings.colorMode,
        'media': printSettings.paperSize
      }
    };
    
    printer.execute('Print-Job', data, (err, res) => {
      if (err) console.error(err);
      else console.log('Printed:', res);
    });
    */
    
    // ============================================================
    // RAW 9100 PROTOCOL EXAMPLE (Direct TCP/IP Printing)
    // ============================================================
    /*
    // Using 'net' module in Node.js
    const net = require('net');
    const client = new net.Socket();
    
    client.connect(9100, '192.168.1.100', () => {
      client.write(printDataBuffer);
      client.end();
    });
    */
    
    // ============================================================
    // CUPS COMMAND LINE EXAMPLE (Linux/Mac)
    // ============================================================
    /*
    // Using 'child_process' in Node.js
    const { exec } = require('child_process');
    exec(`lp -d Brother_DCP_T710W -n ${printSettings.copies} -o media=${printSettings.paperSize} "${selectedFile.path}"`, 
      (error, stdout, stderr) => {
        if (error) console.error(error);
        else console.log('Print job sent:', stdout);
      }
    );
    */
    
    // ============================================================
    // ELECTRON WEB CONTENTS PRINT (for PDF/HTML preview)
    // ============================================================
    /*
    // In Electron renderer process
    const printWindow = new BrowserWindow({ show: false });
    printWindow.loadURL(filePreview);
    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print({
        silent: false,
        printBackground: true,
        deviceName: 'Brother DCP-T710W',
        copies: printSettings.copies
      }, (success, errorType) => {
        if (success) console.log('Print success');
        else console.log('Print failed:', errorType);
        printWindow.close();
      });
    });
    */
    
    // ============================================================
    // CURRENT: SIMULATED PRINT (Frontend-only demo)
    // ============================================================
    // This simulates printing for frontend testing
    setTimeout(() => {
      setPrintJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'completed', printedAt: new Date().toLocaleString() }
          : job
      ));
      setSuccessMessage(`✓ Print job submitted! "${selectedFile.name}" has been sent to ${printerInfo.name}`);
      setSelectedFile(null);
      setFilePreview('');
      setFileContent('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsPrinting(false);
      
      // Update printer stats
      setPrinterInfo(prev => ({
        ...prev,
        totalPagesPrinted: prev.totalPagesPrinted + 1,
        inkLevel: {
          ...prev.inkLevel,
          black: Math.max(0, prev.inkLevel.black - 0.5),
          cyan: Math.max(0, prev.inkLevel.cyan - 0.3),
          magenta: Math.max(0, prev.inkLevel.magenta - 0.3),
          yellow: Math.max(0, prev.inkLevel.yellow - 0.3)
        }
      }));
      
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 2000);
  };

  // Cancel a print job
  const cancelPrintJob = (jobId: string) => {
    setPrintJobs(prev => prev.map(job => 
      job.id === jobId && job.status === 'pending'
        ? { ...job, status: 'failed', errorMessage: 'Cancelled by user' }
        : job
    ));
    setSuccessMessage('Print job cancelled');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Clear print history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all print history?')) {
      setPrintJobs([]);
      setSuccessMessage('Print history cleared');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Get status badge class
  const getStatusBadge = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'printing': return 'status-printing';
      case 'completed': return 'status-completed';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'printing': return 'Printing';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Pending';
    }
  };

  return (
    <div className={`printer-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <Sidebar />
      <div className="printer-container">
        <main className="printer-main">
          <div className="printer-header">
            <h1 className="printer-title">🖨️ Printing Services</h1>
            <p className="printer-subtitle">Print documents directly without Microsoft Word or PDF reader</p>
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

          {/* Printer Status Card */}
          <div className="printer-status-card">
            <div className="printer-info">
              <div className="printer-icon">🖨️</div>
              <div className="printer-details">
                <h3>{printerInfo.name}</h3>
                <p className="printer-model">Model: {printerInfo.model}</p>
                <div className="printer-status">
                  <span className={`status-dot ${printerInfo.status}`}></span>
                  <span className="status-text">
                    {printerInfo.status === 'online' ? 'Online & Ready' : 
                     printerInfo.status === 'offline' ? 'Offline' : 
                     printerInfo.status === 'busy' ? 'Busy' : 'Error'}
                  </span>
                </div>
              </div>
              <div className="printer-stats">
                <div className="stat">
                  <span className="stat-label">Pages Printed</span>
                  <span className="stat-value">{printerInfo.totalPagesPrinted}</span>
                </div>
              </div>
            </div>
            
            <div className="printer-supplies">
              <div className="supply-item">
                <span className="supply-label">📄 Paper</span>
                <div className="progress-bar">
                  <div className="progress-fill paper" style={{ width: `${printerInfo.paperLevel}%` }}></div>
                </div>
                <span className="supply-percent">{Math.round(printerInfo.paperLevel)}%</span>
              </div>
              <div className="supply-item">
                <span className="supply-label">⚫ Black</span>
                <div className="progress-bar">
                  <div className="progress-fill black" style={{ width: `${printerInfo.inkLevel.black}%` }}></div>
                </div>
                <span className="supply-percent">{Math.round(printerInfo.inkLevel.black)}%</span>
              </div>
              <div className="supply-item">
                <span className="supply-label">🔵 Cyan</span>
                <div className="progress-bar">
                  <div className="progress-fill cyan" style={{ width: `${printerInfo.inkLevel.cyan}%` }}></div>
                </div>
                <span className="supply-percent">{Math.round(printerInfo.inkLevel.cyan)}%</span>
              </div>
              <div className="supply-item">
                <span className="supply-label">🔴 Magenta</span>
                <div className="progress-bar">
                  <div className="progress-fill magenta" style={{ width: `${printerInfo.inkLevel.magenta}%` }}></div>
                </div>
                <span className="supply-percent">{Math.round(printerInfo.inkLevel.magenta)}%</span>
              </div>
              <div className="supply-item">
                <span className="supply-label">🟡 Yellow</span>
                <div className="progress-bar">
                  <div className="progress-fill yellow" style={{ width: `${printerInfo.inkLevel.yellow}%` }}></div>
                </div>
                <span className="supply-percent">{Math.round(printerInfo.inkLevel.yellow)}%</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'print' ? 'active' : ''}`}
              onClick={() => setActiveTab('print')}
            >
              📄 Print Document
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📜 Print History ({printJobs.length})
            </button>
          </div>

          {/* Print Tab */}
          {activeTab === 'print' && (
            <div className="print-container">
              <div className="print-layout">
                {/* File Upload Area */}
                <div className="file-upload-area">
                  <h3>📁 Select Document</h3>
                  <div 
                    className={`upload-box ${selectedFile ? 'has-file' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.odt"
                      style={{ display: 'none' }}
                    />
                    {!selectedFile ? (
                      <>
                        <span className="upload-icon">📂</span>
                        <p>Click to browse or drag & drop</p>
                        <small>Supports: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ODT (Max 50MB)</small>
                      </>
                    ) : (
                      <>
                        <span className="file-icon">📄</span>
                        <p className="file-name">{selectedFile.name}</p>
                        <small>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                        <button 
                          className="remove-file"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setFilePreview('');
                            setFileContent('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          ✕ Remove
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* File Preview */}
                  {filePreview && (
                    <div className="file-preview">
                      <h4>Preview</h4>
                      {selectedFile?.type === 'text/plain' || selectedFile?.name.endsWith('.txt') ? (
                        <pre className="text-preview">{fileContent.substring(0, 500)}...</pre>
                      ) : selectedFile?.type.startsWith('image/') ? (
                        <img src={filePreview} alt="Preview" className="image-preview" />
                      ) : (
                        <div className="generic-preview">
                          <span>📄</span>
                          <p>{selectedFile?.name}</p>
                          <small>Preview not available for this file type</small>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Print Settings Area */}
                <div className="print-settings-area">
                  <h3>⚙️ Print Settings</h3>
                  
                  <div className="settings-grid">
                    <div className="setting-group">
                      <label>Copies</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={printSettings.copies}
                        onChange={(e) => setPrintSettings(prev => ({ ...prev, copies: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    
                    <div className="setting-group">
                      <label>Page Range</label>
                      <select
                        value={printSettings.pageRange}
                        onChange={(e) => setPrintSettings(prev => ({ ...prev, pageRange: e.target.value }))}
                      >
                        <option value="all">All Pages</option>
                        <option value="1">Page 1</option>
                        <option value="1-5">Pages 1-5</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>
                    
                    <div className="setting-group">
                      <label>Color Mode</label>
                      <select
                        value={printSettings.colorMode}
                        onChange={(e) => setPrintSettings(prev => ({ ...prev, colorMode: e.target.value as 'color' | 'grayscale' }))}
                      >
                        <option value="color">🖨️ Color</option>
                        <option value="grayscale">⚫ Grayscale</option>
                      </select>
                    </div>
                    
                    <div className="setting-group">
                      <label>Paper Size</label>
                      <select
                        value={printSettings.paperSize}
                        onChange={(e) => setPrintSettings(prev => ({ ...prev, paperSize: e.target.value as 'A4' | 'Letter' | 'Legal' }))}
                      >
                        <option value="A4">A4 (210 × 297 mm)</option>
                        <option value="Letter">Letter (8.5 × 11 in)</option>
                        <option value="Legal">Legal (8.5 × 14 in)</option>
                      </select>
                    </div>
                    
                    <div className="setting-group">
                      <label>Orientation</label>
                      <select
                        value={printSettings.orientation}
                        onChange={(e) => setPrintSettings(prev => ({ ...prev, orientation: e.target.value as 'portrait' | 'landscape' }))}
                      >
                        <option value="portrait">📄 Portrait</option>
                        <option value="landscape">📄 Landscape</option>
                      </select>
                    </div>
                    
                    <div className="setting-group">
                      <label>Print Quality</label>
                      <select
                        value={printSettings.printQuality}
                        onChange={(e) => setPrintSettings(prev => ({ ...prev, printQuality: e.target.value as 'draft' | 'normal' | 'high' }))}
                      >
                        <option value="draft">Draft (Fast)</option>
                        <option value="normal">Normal</option>
                        <option value="high">High (Best)</option>
                      </select>
                    </div>
                    
                    <div className="setting-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={printSettings.duplex}
                          onChange={(e) => setPrintSettings(prev => ({ ...prev, duplex: e.target.checked }))}
                        />
                        Double-sided (Duplex)
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    className="print-button"
                    onClick={handlePrint}
                    disabled={isPrinting || !selectedFile}
                  >
                    {isPrinting ? (
                      <>⏳ Printing... <span className="spinner"></span></>
                    ) : (
                      <>🖨️ Print to {printerInfo.name}</>
                    )}
                  </button>
                  
                  <div className="print-note">
                    <p>ℹ️ <strong>Note:</strong> For actual printing, this app requires Electron backend. 
                    The current demo simulates print jobs for testing purposes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="history-container">
              <div className="history-header">
                <h3>📜 Recent Print Jobs</h3>
                {printJobs.length > 0 && (
                  <button className="clear-history-btn" onClick={clearHistory}>
                    Clear All
                  </button>
                )}
              </div>
              
              {printJobs.length > 0 ? (
                <div className="jobs-list">
                  {printJobs.map(job => (
                    <div key={job.id} className={`job-card ${job.status}`}>
                      <div className="job-header">
                        <div className="job-info">
                          <span className="job-icon">📄</span>
                          <div>
                            <h4>{job.fileName}</h4>
                            <p className="job-meta">
                              {job.copies} copy(ies) • {job.colorMode} • {job.paperSize} • 
                              {job.orientation} • {job.duplex ? 'Duplex' : 'Simplex'}
                            </p>
                            <p className="job-date">Submitted: {job.submittedAt}</p>
                            {job.printedAt && <p className="job-date">Printed: {job.printedAt}</p>}
                            {job.errorMessage && <p className="job-error">{job.errorMessage}</p>}
                          </div>
                        </div>
                        <div className="job-status">
                          <span className={`status-badge ${getStatusBadge(job.status)}`}>
                            {getStatusText(job.status)}
                          </span>
                          {job.status === 'pending' && (
                            <button 
                              className="cancel-job-btn"
                              onClick={() => cancelPrintJob(job.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-history">
                  <p>🖨️ No print jobs yet</p>
                  <button onClick={() => setActiveTab('print')}>
                    Print Your First Document
                  </button>
                </div>
              )}
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
        }

        body.dark-mode {
          --bg: #0f172a;
          --card-bg: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --border: #334155;
          background: var(--bg);
        }

        .printer-wrapper {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: var(--bg);
        }

        .printer-container {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
          height: 100vh;
          scrollbar-width: thin;
        }

        .printer-container::-webkit-scrollbar {
          width: 10px;
        }

        .printer-container::-webkit-scrollbar-track {
          background: #e2e8f0;
        }

        .printer-container::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
        }

        .dark-mode .printer-container::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark-mode .printer-container::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .printer-main {
          max-width: 1400px;
          margin: 0 auto;
        }

        .printer-header {
          margin-bottom: 1.5rem;
        }

        .printer-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .printer-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        /* Printer Status Card */
        .printer-status-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 2rem;
        }

        .printer-info {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .printer-icon {
          font-size: 3rem;
        }

        .printer-details h3 {
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .printer-model {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .printer-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #10b981;
          box-shadow: 0 0 5px #10b981;
        }

        .status-dot.offline {
          background: #ef4444;
        }

        .status-dot.busy {
          background: #f59e0b;
        }

        .status-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .printer-stats {
          margin-left: auto;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent);
        }

        .printer-supplies {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .supply-item {
          flex: 1;
          min-width: 120px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .supply-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-primary);
          min-width: 55px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }

        .progress-fill.paper { background: #8b5cf6; }
        .progress-fill.black { background: #1e293b; }
        .dark-mode .progress-fill.black { background: #94a3b8; }
        .progress-fill.cyan { background: #06b6d4; }
        .progress-fill.magenta { background: #ec4899; }
        .progress-fill.yellow { background: #eab308; }

        .supply-percent {
          font-size: 0.7rem;
          color: var(--text-secondary);
          min-width: 40px;
          text-align: right;
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid var(--border);
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
        }

        .tab:hover {
          color: var(--accent);
        }

        .tab.active {
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
          margin-bottom: -2px;
        }

        /* Print Layout */
        .print-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .file-upload-area, .print-settings-area {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .file-upload-area h3, .print-settings-area h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .upload-box {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-box:hover {
          border-color: var(--accent);
          background: var(--bg);
        }

        .upload-box.has-file {
          border-color: #10b981;
          border-style: solid;
        }

        .upload-icon, .file-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .file-name {
          font-weight: 600;
          color: var(--text-primary);
          word-break: break-all;
        }

        .remove-file {
          margin-top: 0.5rem;
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
        }

        .file-preview {
          margin-top: 1rem;
        }

        .file-preview h4 {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .image-preview {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
        }

        .text-preview {
          background: var(--bg);
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          max-height: 150px;
          overflow-y: auto;
          color: var(--text-secondary);
        }

        .generic-preview {
          text-align: center;
          padding: 1rem;
          background: var(--bg);
          border-radius: 8px;
        }

        .generic-preview span {
          font-size: 2rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .setting-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .setting-group input, .setting-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--card-bg);
          color: var(--text-primary);
          font-size: 0.85rem;
        }

        .setting-group.checkbox {
          display: flex;
          align-items: center;
        }

        .setting-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .print-button {
          width: 100%;
          padding: 0.85rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .print-button:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .print-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .print-note {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 0.75rem;
          color: #92400e;
        }

        .dark-mode .print-note {
          background: #451a03;
          color: #fbbf24;
        }

        /* History */
        .history-container {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .history-header h3 {
          color: var(--text-primary);
        }

        .clear-history-btn {
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .job-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem;
        }

        .job-card.pending {
          border-left: 4px solid #f59e0b;
        }

        .job-card.completed {
          border-left: 4px solid #10b981;
        }

        .job-card.failed {
          border-left: 4px solid #ef4444;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .job-info {
          display: flex;
          gap: 1rem;
        }

        .job-icon {
          font-size: 1.5rem;
        }

        .job-info h4 {
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .job-meta, .job-date {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .job-error {
          font-size: 0.7rem;
          color: #ef4444;
          margin-top: 0.25rem;
        }

        .job-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .status-pending { background: #fef3c7; color: #d97706; }
        .status-printing { background: #dbeafe; color: #2563eb; }
        .status-completed { background: #d1fae5; color: #059669; }
        .status-failed { background: #fee2e2; color: #dc2626; }

        .dark-mode .status-pending { background: #451a03; color: #fbbf24; }
        .dark-mode .status-printing { background: #1e3a5f; color: #60a5fa; }
        .dark-mode .status-completed { background: #064e3b; color: #34d399; }
        .dark-mode .status-failed { background: #7f1d1d; color: #fca5a5; }

        .cancel-job-btn {
          padding: 0.25rem 0.75rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.7rem;
        }

        .empty-history {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .empty-history button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Messages */
        .success-message {
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          border-left: 4px solid #10b981;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
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

        /* Responsive */
        @media (max-width: 768px) {
          .printer-container {
            padding: 1rem;
          }
          
          .print-layout {
            grid-template-columns: 1fr;
          }
          
          .printer-info {
            flex-direction: column;
            text-align: center;
          }
          
          .printer-stats {
            margin-left: 0;
          }
          
          .settings-grid {
            grid-template-columns: 1fr;
          }
          
          .supply-item {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Printer;