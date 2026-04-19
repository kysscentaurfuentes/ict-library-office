// frontend/src/pages/QrCodeScanner.tsx
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../components/Sidebar';

export default function QrCodeScanner() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  const studentId = localStorage.getItem('studentId') || "N/A";

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Listen for changes in localStorage from Settings page
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode === 'true') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(studentId);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <div style={{ 
      display: 'flex', 
      background: isDarkMode ? '#0f172a' : '#f8fafc', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden' 
    }}>
      <Sidebar />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: isDarkMode ? 'white' : '#1e293b',
        position: 'relative'
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        
        {/* Animated border decoration */}
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '100px',
          height: '100px',
          border: '2px solid rgba(59,130,246,0.2)',
          borderRadius: '20px',
          transform: 'rotate(45deg)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: '80px',
          height: '80px',
          border: '2px solid rgba(139,92,246,0.2)',
          borderRadius: '20px',
          transform: 'rotate(15deg)',
          pointerEvents: 'none'
        }} />

        {/* Header with icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            width: '60px',
            height: '60px',
            borderRadius: '20px',
            marginBottom: '15px',
            boxShadow: '0 10px 25px rgba(59,130,246,0.3)'
          }}>
            <span style={{ fontSize: '30px' }}>📱</span>
          </div>
          <h1 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            QR Code Scanner
          </h1>
          <p style={{ 
            marginTop: '8px', 
            color: isDarkMode ? '#94a3b8' : '#64748b', 
            fontSize: '0.85rem' 
          }}>
            Present this QR code at the library entrance
          </p>
        </div>
        
        <p style={{ 
          marginBottom: '20px', 
          color: isDarkMode ? '#94a3b8' : '#64748b', 
          fontSize: '0.9rem', 
          fontWeight: '500',
          letterSpacing: '1px'
        }}>
          Your Registered QR Code
        </p>
        
        {/* QR Code Container with glow effect */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ 
            background: isDarkMode ? '#1e293b' : '#ffffff',
            padding: '25px',
            borderRadius: '28px',
            boxShadow: isHovered 
              ? '0 25px 50px rgba(59,130,246,0.3), 0 0 0 2px rgba(59,130,246,0.2)' 
              : '0 20px 40px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
          }}
        >
          <QRCodeSVG 
            value={studentId} 
            size={260}
            level={"H"}
            includeMargin={false}
            bgColor={isDarkMode ? '#1e293b' : '#ffffff'}
            fgColor={isDarkMode ? '#ffffff' : '#000000'}
          />
        </div>

        {/* Student ID Section with Copy Feature */}
        <div style={{ marginTop: '35px', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#60a5fa', fontSize: '0.7rem', letterSpacing: '2px' }}>
              STUDENT ID
            </span>
            <div style={{
              width: '30px',
              height: '1px',
              background: 'linear-gradient(90deg, #60a5fa, transparent)'
            }} />
          </div>
          
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
            <div
              onClick={copyToClipboard}
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                padding: '12px 35px',
                borderRadius: '16px',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#60a5fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
              }}
            >
              <h2 style={{ 
                fontSize: '1.8rem',
                letterSpacing: '3px', 
                color: '#60a5fa', 
                margin: 0,
                fontFamily: 'monospace',
                fontWeight: '600'
              }}>
                {studentId}
              </h2>
            </div>
            
            {/* Tooltip */}
            {showTooltip && (
              <div style={{
                position: 'absolute',
                bottom: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#10b981',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                animation: 'fadeInUp 0.3s ease'
              }}>
                ✓ Copied to clipboard!
              </div>
            )}
          </div>
          
          <p style={{ 
            marginTop: '20px', 
            color: isDarkMode ? '#64748b' : '#94a3b8', 
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <span>🖱️</span>
            Click the ID to copy
            <span style={{ marginLeft: '6px' }}>📋</span>
          </p>
        </div>

        {/* Instructions Card */}
        <div style={{
          marginTop: '30px',
          padding: '12px 20px',
          background: isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
          borderRadius: '40px',
          border: `1px solid ${isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '14px' }}>📌</span>
          <span style={{ fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            Present this QR code to the librarian for scanning
          </span>
          <span style={{ fontSize: '14px' }}>✅</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}