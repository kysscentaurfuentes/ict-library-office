// frontend/src/pages/LiveView.tsx
import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';

export default function LiveView() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const streamUrl = 'http://192.168.8.236:4000/video';

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

  // Simulate loading (remove this in production)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    if (imgRef.current) {
      const currentSrc = imgRef.current.src;
      imgRef.current.src = '';
      imgRef.current.src = currentSrc;
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      background: isDarkMode ? '#0f172a' : '#f8fafc', 
      fontFamily: 'sans-serif' 
    }}>
      <Sidebar />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        {/* Decorative top bar */}
        <div style={{
          width: '100%',
          maxWidth: '850px',
          marginBottom: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            flex: 1,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #ec4899, transparent)',
            borderRadius: '2px'
          }} />
          <div style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
          }}>
            VIEW ONLY
          </div>
          <div style={{
            flex: 1,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #ec4899, #8b5cf6, #3b82f6, transparent)',
            borderRadius: '2px'
          }} />
        </div>

        <div style={{ 
          background: isDarkMode ? '#1e293b' : '#ffffff', 
          padding: '20px', 
          borderRadius: '24px', 
          boxShadow: isDarkMode 
            ? '0 20px 50px rgba(0,0,0,0.6)' 
            : '0 20px 50px rgba(0,0,0,0.1)',
          maxWidth: '850px', 
          width: '100%',
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
        }}>
          {/* Header with icon and title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>
                📹
              </div>
              <div>
                <h2 style={{ 
                  color: isDarkMode ? 'white' : '#1e293b', 
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  margin: 0
                }}>
                  CCTV LIVE VIEW
                </h2>
                <p style={{
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  fontSize: '0.7rem',
                  margin: '4px 0 0 0'
                }}>
                  Library Surveillance System
                </p>
              </div>
            </div>
            
            {/* Status Badge - Green Recording Indicator outside video */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isDarkMode ? '#0f172a' : '#f1f5f9',
              padding: '6px 12px',
              borderRadius: '20px'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                animation: 'pulse 1.5s infinite'
              }} />
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '500' }}>
                LIVE
              </span>
            </div>
          </div>
          
          {/* Video Container */}
          <div 
            ref={videoContainerRef}
            style={{ 
              position: 'relative', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              backgroundColor: '#000',
              border: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #334155',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Connecting to camera...</span>
              </div>
            )}
            
            <img
              ref={imgRef}
              src={streamUrl}
              alt="CCTV Stream"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />

            {/* Combined Recording Indicator + Camera Info (Upper Right) */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 5
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  animation: 'pulse 1s infinite'
                }} />
                <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 'bold' }}>REC</span>
              </div>
              <div style={{
                width: '1px',
                height: '12px',
                background: '#475569'
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '10px', color: '#cbd5e1' }}>🎥</span>
                <span style={{ fontSize: '10px', color: '#cbd5e1' }}>Camera 01</span>
              </div>
            </div>
          </div>

          {/* Status Footer */}
          <div style={{ 
            marginTop: '15px', 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#10b981',
                  animation: 'pulse 1.5s infinite'
                }} />
                <span style={{ color: '#10b981', fontSize: '0.75rem' }}>Streaming</span>
              </div>
              <span style={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>|</span>
              <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.7rem' }}>
                Resolution: 800x450
              </span>
              <span style={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>|</span>
              <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.7rem' }}>
                FPS: 60
              </span>
            </div>
            
            {/* Control Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={toggleFullscreen}
                style={{
                  background: isDarkMode ? '#334155' : '#e2e8f0',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: isDarkMode ? '#cbd5e1' : '#475569',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#475569' : '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#334155' : '#e2e8f0';
                }}
              >
                ⛶ Fullscreen
              </button>
              <button
                onClick={handleRefresh}
                style={{
                  background: isDarkMode ? '#334155' : '#e2e8f0',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: isDarkMode ? '#cbd5e1' : '#475569',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#475569' : '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#334155' : '#e2e8f0';
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Decorative bottom bar */}
        <div style={{
          width: '100%',
          maxWidth: '850px',
          marginTop: '15px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isDarkMode ? '#334155' : '#cbd5e1',
              opacity: 0.5
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}