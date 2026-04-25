import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Hls from 'hls.js';

export default function LiveView() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [faceCount, setFaceCount] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [bufferHealth, setBufferHealth] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const STREAM_URL = 'http://192.168.8.236:5000/hls/stream.m3u8';
  const FACES_API = 'http://192.168.8.236:5000/faces';

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

  // Fetch face count from backend
  useEffect(() => {
    const fetchFaceCount = async () => {
      try {
        const response = await fetch(FACES_API);
        const data = await response.json();
        setFaceCount(data.faces);
      } catch (error) {
        console.error('Error fetching face count:', error);
      }
    };

    fetchFaceCount();
    const interval = setInterval(fetchFaceCount, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // Monitor latency and buffer
  // Monitor latency and buffer
useEffect(() => {
  const monitorPerformance = () => {
    if (hlsRef.current && videoRef.current) {
      const hls = hlsRef.current;
      const video = videoRef.current;
      
      if (hls.liveSyncPosition && video.currentTime > 0) {
        const currentLatency = Math.abs(video.currentTime - hls.liveSyncPosition) * 1000;
        setLatency(Math.round(currentLatency));
      }
      
      // Get buffer length from video element
      let bufferLen = 0;
      if (video.buffered.length > 0) {
        bufferLen = video.buffered.end(video.buffered.length - 1) - video.currentTime;
      }
      setBufferHealth(Math.max(0, bufferLen));
    }
  };
  
  const interval = setInterval(monitorPerformance, 500);
  return () => clearInterval(interval);
}, []);

  // Initialize HLS with ultra low latency settings
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Disable all video controls
    video.controls = false;
    video.disableRemotePlayback = true;
    
    // Force autoplay
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    
    // Prevent any user interaction
    video.style.pointerEvents = 'none';

    const initHls = () => {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 1,  // Reduced for lower latency
          liveMaxLatencyDurationCount: 2,
          maxLiveSyncPlaybackRate: 1.5,  // Allow faster catch-up
          startLevel: -1,
          maxBufferLength: 1,  // Smaller buffer for lower latency
          maxMaxBufferLength: 2,
          backBufferLength: 0.5,
          liveDurationInfinity: true,
          manifestLoadingTimeOut: 1000,
          manifestLoadingMaxRetry: 2,
          levelLoadingTimeOut: 1000,
          levelLoadingMaxRetry: 2,
          fragLoadingTimeOut: 2000,
          fragLoadingMaxRetry: 3,
          startFragPrefetch: true,
          testBandwidth: false,
          abrEwmaDefaultEstimate: 5000000,
          abrBandWidthFactor: 0.95,
          abrBandWidthUpFactor: 1,
          minAutoBitrate: 2000000
        });
        
        hls.loadSource(STREAM_URL);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.log('Auto-play:', e));
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, retrying...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, recovering...');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setTimeout(initHls, 1000);
                break;
            }
          } else if (data.details === 'bufferStalledError') {
            // Try to recover from buffer stall
            hls.startLoad();
          }
        });
        
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = STREAM_URL;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => console.log('Auto-play:', e));
        });
      }
    };
    
    initHls();
    
    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Refresh - reload HLS
  const handleRefresh = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      const video = videoRef.current;
      if (video) {
        const newHls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 1,
          liveMaxLatencyDurationCount: 2,
          maxLiveSyncPlaybackRate: 1.5,
          maxBufferLength: 1,
          maxMaxBufferLength: 2,
          backBufferLength: 0.5,
          liveDurationInfinity: true,
          manifestLoadingTimeOut: 1000,
          manifestLoadingMaxRetry: 2,
          levelLoadingTimeOut: 1000,
          fragLoadingTimeOut: 2000,
          startFragPrefetch: true
        });
        newHls.loadSource(STREAM_URL);
        newHls.attachMedia(video);
        hlsRef.current = newHls;
      }
    }
  };

  // Get latency color
  const getLatencyColor = () => {
    if (latency < 500) return '#10b981';
    if (latency < 1000) return '#fbbf24';
    return '#ef4444';
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
          {/* Header */}
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
            
            {/* LIVE Badge */}
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
          <div style={{ 
            position: 'relative', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            backgroundColor: '#000',
            border: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            cursor: 'default'
          }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              disablePictureInPicture
              controlsList="nodownload nofullscreen noplaybackrate"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                transformOrigin: 'center center',
              }}
            />

            {/* Face Detection Overlay */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: faceCount > 0 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 5,
              pointerEvents: 'none',
              transition: 'all 0.3s ease',
              boxShadow: faceCount > 0 ? '0 0 15px rgba(239,68,68,0.5)' : 'none'
            }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              <span style={{ 
                color: 'white', 
                fontSize: '14px', 
                fontWeight: 'bold'
              }}>
                Faces: {faceCount}
              </span>
              {faceCount > 0 && (
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 1s infinite',
                  marginLeft: '4px'
                }} />
              )}
            </div>

            {/* REC + Camera Overlay */}
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
              zIndex: 5,
              pointerEvents: 'none'
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
              gap: '12px',
              flexWrap: 'wrap'
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
              <span style={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: isDarkMode ? '#64748b' : '#94a3b8' }}>⚡ Latency:</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: getLatencyColor() }}>
                  {latency}ms
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: isDarkMode ? '#64748b' : '#94a3b8' }}>📊 Buffer:</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {bufferHealth.toFixed(1)}s
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: isDarkMode ? '#64748b' : '#94a3b8' }}>👤 Faces:</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: faceCount > 0 ? '#ef4444' : '#10b981' }}>
                  {faceCount}
                </span>
              </div>
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
        
        video::-webkit-media-controls {
          display: none !important;
        }
        
        video::-webkit-media-controls-enclosure {
          display: none !important;
        }
        
        video::-webkit-media-controls-panel {
          display: none !important;
        }
        
        video::-webkit-media-controls-overlay-play-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}