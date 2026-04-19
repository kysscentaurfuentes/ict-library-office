// frontend/src/pages/Router.tsx

import Sidebar from '../components/Sidebar';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Activity, Shield, ShieldOff, Clock, Server, RefreshCw } from 'lucide-react';

type Device = {
  ip: string;
  mac: string;
  name: string;
  isAlive: boolean;
  isBlocked: boolean;
};

type DeviceState = {
  [mac: string]: {
    ip: string;
    mac: string;
    name: string;
    isAlive: boolean;
    isBlocked: boolean;
    lastSeenTs: number;
  };
};

const GET_DEVICES = gql`
  query {
    routerDevices {
      ip
      mac
      name
      isAlive
      isBlocked
    }
  }
`;

const BLOCK_DEVICE = gql`
  mutation($mac: String!) {
    blockDevice(mac: $mac)
  }
`;

const UNBLOCK_DEVICE = gql`
  mutation($mac: String!) {
    unblockDevice(mac: $mac)
  }
`;

export default function Router() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
  const savedDarkMode = localStorage.getItem('darkMode');
  const bgDay = '#f8fafc';
  const bgNight = '#0f172a'; // Match your component background
  
  if (savedDarkMode === 'true') {
    // ... existing code ...
    document.body.style.backgroundColor = bgNight;
  } else {
    // ... existing code ...
    document.body.style.backgroundColor = bgDay;
  }
}, [isDarkMode]);

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

  const { data, refetch } = useQuery<{ routerDevices: Device[] }>(
    GET_DEVICES,
    { pollInterval: 3000 }
  );

  const [blockDevice] = useMutation(BLOCK_DEVICE);
  const [unblockDevice] = useMutation(UNBLOCK_DEVICE);

  const [devices, setDevices] = useState<DeviceState>({});

  // Update last updated timestamp when data changes
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [data]);

  useEffect(() => {
    if (!data?.routerDevices) return;

    const now = Date.now();

    setDevices((prev) => {
      const updated: DeviceState = { ...prev };

      data.routerDevices.forEach((d) => {
        const prevDevice = prev[d.mac];

        let lastSeenTs = prevDevice?.lastSeenTs ?? now;

        if (d.isAlive) {
          lastSeenTs = now;
        }

        if (d.isBlocked && !prevDevice?.isBlocked) {
          lastSeenTs = now;
        }

        updated[d.mac] = {
          ip: d.ip,
          mac: d.mac,
          name: d.name,
          isAlive: d.isAlive,
          isBlocked: d.isBlocked,
          lastSeenTs: d.isAlive
            ? now
            : prev[d.mac]?.lastSeenTs ?? now,
        };
      });

      const JUST_SEEN_THRESHOLD = 5000;

      Object.values(updated).forEach((d) => {
        const recentlySeen = now - d.lastSeenTs < JUST_SEEN_THRESHOLD;

        if (!d.isBlocked) {
          d.isAlive = d.isAlive || recentlySeen;
        }
      });

      return updated;
    });
  }, [data]);

  const handleToggleBlock = async (device: DeviceState[string]) => {
    if (device.isBlocked) {
      await unblockDevice({ variables: { mac: device.mac } });
    } else {
      await blockDevice({ variables: { mac: device.mac } });
    }

    setTimeout(() => refetch(), 1000);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  const allDevices = Object.values(devices);
  const network8 = allDevices.filter(d => d.ip.startsWith('192.168.8.'));
  const network1 = allDevices.filter(d => d.ip.startsWith('192.168.1.'));

  const onlineCount = allDevices.filter(d => d.isAlive && !d.isBlocked).length;
  const blockedCount = allDevices.filter(d => d.isBlocked).length;
  const offlineCount = allDevices.filter(d => !d.isAlive && !d.isBlocked).length;

  return (
    <div style={{ 
  display: 'flex', 
  height: '100vh', 
  width: '100vw', // Force full viewport width
  margin: 0,      // Ensure no browser margins
  overflow: 'hidden', 
  background: isDarkMode ? '#0f172a' : '#f8fafc' 
}}>
      {/* Fixed Sidebar - never scrolls */}
      <div style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Scrollable Content Area - takes all remaining space */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
        height: '100vh',
        background: isDarkMode ? '#0f172a' : '#f8fafc'
      }}>
        <div style={{ 
          padding: '30px 20px',
          width: '100%',
          minHeight: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 20px rgba(59,130,246,0.3)'
                }}>
                  <Wifi size={26} color="white" />
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: '700', 
                    margin: 0,
                    color: isDarkMode ? 'white' : '#1e293b'
                  }}>
                    Network Router Monitor
                  </h1>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    fontSize: '0.85rem'
                  }}>
                    Real-time device tracking and management
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: isDarkMode ? '#1e293b' : '#ffffff',
                padding: '8px 16px',
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Clock size={14} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                <span style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  Last updated: {lastUpdated}
                </span>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                style={{
                  background: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={14} color={isDarkMode ? '#94a3b8' : '#64748b'} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                <span style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              padding: '16px',
              borderRadius: '16px',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '10px', borderRadius: '12px' }}>
                <Wifi size={24} color="#22c55e" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Online Devices</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#22c55e' }}>{onlineCount}</div>
              </div>
            </div>
            <div style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              padding: '16px',
              borderRadius: '16px',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '12px' }}>
                <ShieldOff size={24} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Blocked Devices</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#ef4444' }}>{blockedCount}</div>
              </div>
            </div>
            <div style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              padding: '16px',
              borderRadius: '16px',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ background: 'rgba(100, 116, 139, 0.15)', padding: '10px', borderRadius: '12px' }}>
                <WifiOff size={24} color={isDarkMode ? '#94a3b8' : '#64748b'} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Offline Devices</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: isDarkMode ? '#cbd5e1' : '#475569' }}>{offlineCount}</div>
              </div>
            </div>
            <div style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              padding: '16px',
              borderRadius: '16px',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '12px' }}>
                <Server size={24} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Total Devices</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: isDarkMode ? 'white' : '#1e293b' }}>{allDevices.length}</div>
              </div>
            </div>
          </div>

          {/* Main Network Section */}
          <div style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '16px 20px',
              background: isDarkMode ? '#0f172a' : '#f8fafc',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e'
              }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: isDarkMode ? 'white' : '#1e293b' }}>
                🌐 Main Network (192.168.8.x)
              </h3>
              <span style={{
                marginLeft: 'auto',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '20px',
                background: isDarkMode ? '#334155' : '#e2e8f0',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                {network8.length} device(s)
              </span>
            </div>
            <div>
              {network8.length > 0 ? (
                network8.map((device) => (
                  <DeviceCard
                    key={device.mac}
                    device={device}
                    formatTime={formatTime}
                    onToggleBlock={handleToggleBlock}
                    isDarkMode={isDarkMode}
                  />
                ))
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: isDarkMode ? '#64748b' : '#94a3b8'
                }}>
                  No devices found on this network
                </div>
              )}
            </div>
          </div>

          {/* Router Subnet Section */}
          <div style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '16px 20px',
              background: isDarkMode ? '#0f172a' : '#f8fafc',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#a78bfa',
                boxShadow: '0 0 8px #a78bfa'
              }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: isDarkMode ? 'white' : '#1e293b' }}>
                📡 Router Subnet (192.168.1.x)
              </h3>
              <span style={{
                marginLeft: 'auto',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '20px',
                background: isDarkMode ? '#334155' : '#e2e8f0',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                {network1.length} device(s)
              </span>
            </div>
            <div>
              {network1.length > 0 ? (
                network1.map((device) => (
                  <DeviceCard
                    key={device.mac}
                    device={device}
                    formatTime={formatTime}
                    onToggleBlock={handleToggleBlock}
                    isDarkMode={isDarkMode}
                  />
                ))
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: isDarkMode ? '#64748b' : '#94a3b8'
                }}>
                  No devices found on this subnet
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            textAlign: 'center',
            borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            color: isDarkMode ? '#64748b' : '#94a3b8',
            fontSize: '0.7rem'
          }}>
            <p>Live network monitoring • Auto-refresh</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Custom scrollbar styling */
        .scrollable-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollable-content::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#1e293b' : '#e2e8f0'};
          border-radius: 10px;
        }
        
        .scrollable-content::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#475569' : '#94a3b8'};
          border-radius: 10px;
        }
        
        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#64748b' : '#64748b'};
        }
      `}</style>
    </div>
  );
}

// 🔥 DEVICE CARD - Improved Design
function DeviceCard({ device, formatTime, onToggleBlock, isDarkMode }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        background: isHovered ? (isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)') : 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Device Icon based on status */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: device.isBlocked 
            ? 'rgba(239, 68, 68, 0.15)' 
            : device.isAlive 
              ? 'rgba(34, 197, 94, 0.15)' 
              : 'rgba(100, 116, 139, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {device.isBlocked ? (
            <ShieldOff size={20} color="#ef4444" />
          ) : device.isAlive ? (
            <Activity size={20} color="#22c55e" />
          ) : (
            <WifiOff size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
          )}
        </div>
        
        <div>
          <p style={{ margin: 0, fontWeight: 'bold', color: isDarkMode ? 'white' : '#1e293b', fontSize: '14px' }}>
            {device.name || 'Unknown Device'}
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              IP: {device.ip}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              MAC: {device.mac.slice(-8)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* STATUS */}
        <div>
          {device.isBlocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500' }}>Blocked</span>
              <span style={{ fontSize: '10px', color: isDarkMode ? '#666' : '#94a3b8' }}>
                {formatTime(device.lastSeenTs)}
              </span>
            </div>
          ) : device.isAlive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: '500' }}>Online</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isDarkMode ? '#64748b' : '#94a3b8' }} />
              <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '12px' }}>Offline</span>
              <span style={{ fontSize: '10px', color: isDarkMode ? '#666' : '#94a3b8' }}>
                {formatTime(device.lastSeenTs)}
              </span>
            </div>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={() => onToggleBlock(device)}
          style={{
            padding: '6px 14px',
            cursor: 'pointer',
            backgroundColor: device.isBlocked ? '#22c55e' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            opacity: isHovered ? 1 : 0.85
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {device.isBlocked ? 'Unblock' : 'Block'}
        </button>
      </div>
    </div>
  );
}