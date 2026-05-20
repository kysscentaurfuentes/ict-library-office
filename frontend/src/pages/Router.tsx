// frontend/src/pages/Router.tsx

import Sidebar from '../components/Sidebar';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Activity, Shield, ShieldOff, Clock, Server, RefreshCw } from 'lucide-react';
import { useNavigate } from "react-router-dom";

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

const ME = gql`
  query {
    me {
      role
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
  const [devices, setDevices] = useState<DeviceState>({});

const navigate = useNavigate();
  const { data: meData } =
  useQuery(ME);

const userRole =
  meData?.me?.role || '';


  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const bgDay = '#f8fafc';
    const bgNight = '#0f172a';
    
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.body.style.backgroundColor = bgNight;
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.style.backgroundColor = bgDay;
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      setIsDarkMode(savedDarkMode === 'true');
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

  useEffect(() => {
    if (data) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [data]);

  useEffect(() => {
    if (!data?.routerDevices) return;

    const now = Date.now();
    setDevices((prev) => {
      const updated: DeviceState = { ...prev };

      data.routerDevices.forEach((d) => {
        const prevDevice = prev[d.mac];
        let lastSeenTs = prevDevice?.lastSeenTs ?? now;

        if (d.isAlive) lastSeenTs = now;
        if (d.isBlocked && !prevDevice?.isBlocked) lastSeenTs = now;

        updated[d.mac] = {
          ip: d.ip,
          mac: d.mac,
          name: d.name,
          isAlive: d.isAlive,
          isBlocked: d.isBlocked,
          lastSeenTs: d.isAlive ? now : (prev[d.mac]?.lastSeenTs ?? now),
        };
      });

      const JUST_SEEN_THRESHOLD = 4000;
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
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      width: '100%', 
      margin: 0,      
      overflow: 'hidden', 
      background: isDarkMode ? '#0f172a' : '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>

      {/* Main Container Area */}
      <div 
        className="scrollable-content"
        style={{ 
          flex: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100vh',
          background: isDarkMode ? '#0f172a' : '#f8fafc',
          padding: '24px clamp(16px, 3vw, 40px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 8px 20px rgba(59,130,246,0.2)'
            }}>
              <Wifi size={24} color="white" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ 
                fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', 
                fontWeight: '700', 
                margin: 0,
                color: isDarkMode ? '#f8fafc' : '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Network Router Monitor
              </h1>
              <p style={{ 
                margin: '2px 0 0 0', 
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Real-time connection access and active logs
              </p>
            </div>
          </div>

          {/* Time logs & Manual controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
              padding: '8px 14px',
              borderRadius: '12px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Clock size={14} color={isDarkMode ? '#64748b' : '#94a3b8'} />
              <span style={{ fontSize: '12px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                Updated: {lastUpdated}
              </span>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{
                background: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                padding: '8px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw 
                size={14} 
                color={isDarkMode ? '#cbd5e1' : '#334155'} 
                style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} 
              />
              <span style={{ fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#cbd5e1' : '#334155' }}>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid Dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
          width: '100%'
        }}>
          {/* Card 1 */}
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <Wifi size={20} color="#22c55e" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Online</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>{onlineCount}</div>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <ShieldOff size={20} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Blocked</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{blockedCount}</div>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <WifiOff size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Offline</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: isDarkMode ? '#cbd5e1' : '#475569' }}>{offlineCount}</div>
            </div>
          </div>

          {/* Card 4 */}
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <Server size={20} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Total Devices</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: isDarkMode ? '#ffffff' : '#1e293b' }}>{allDevices.length}</div>
            </div>
          </div>
        </div>

        {/* Subnet 1: 192.168.8.x */}
        <div style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
          borderRadius: '20px',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
          overflow: 'hidden',
          marginBottom: '24px',
          width: '100%'
        }}>
          <div style={{
            padding: '14px 20px',
            background: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#fafafa',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                🌐 Main Network Subnet (192.168.8.x)
              </h3>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '12px',
              background: isDarkMode ? '#1e293b' : '#e2e8f0',
              color: isDarkMode ? '#38bdf8' : '#2563eb'
            }}>
              {network8.length} Devices
            </span>
          </div>
          <div style={{ width: '100%' }}>
            {network8.length > 0 ? (
              network8.map((device) => (
                <DeviceCard
                  key={device.mac}
                  device={device}
                  formatTime={formatTime}
                  onToggleBlock={handleToggleBlock}
                  isDarkMode={isDarkMode}
                  userRole={userRole}
                />
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: '0.9rem' }}>
                No devices found on this network.
              </div>
            )}
          </div>
        </div>

        {/* Subnet 2: 192.168.1.x */}
        <div style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
          borderRadius: '20px',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
          overflow: 'hidden',
          marginBottom: '24px',
          width: '100%'
        }}>
          <div style={{
            padding: '14px 20px',
            background: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#fafafa',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                📡 Router Subnet (192.168.1.x)
              </h3>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '12px',
              background: isDarkMode ? '#1e293b' : '#e2e8f0',
              color: isDarkMode ? '#c084fc' : '#7c3aed'
            }}>
              {network1.length} Devices
            </span>
          </div>
          <div style={{ width: '100%' }}>
            {network1.length > 0 ? (
              network1.map((device) => (
                <DeviceCard
                  key={device.mac}
                  device={device}
                  formatTime={formatTime}
                  onToggleBlock={handleToggleBlock}
                  isDarkMode={isDarkMode}
                  userRole={userRole}
                />
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: '0.9rem' }}>
                No devices found on this subnet.
              </div>
            )}
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
          50% { opacity: 0.4; }
        }
        .scrollable-content::-webkit-scrollbar {
          width: 6px;
        }
        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollable-content::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'};
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// Fixed Row-Card Layout Component
function DeviceCard({ device, formatTime, onToggleBlock, isDarkMode, userRole }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '14px 20px',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap', // Safe wrap controls para hindi lumabas sa right container boundary
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'background 0.2s ease',
        background: isHovered ? (isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)') : 'transparent'
      }}
    >
      {/* Left side: Icons and Identifiers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1', minWidth: '240px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: device.isBlocked 
            ? 'rgba(239, 68, 68, 0.12)' 
            : device.isAlive 
              ? 'rgba(34, 197, 94, 0.12)' 
              : 'rgba(148, 163, 184, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {device.isBlocked ? (
            <ShieldOff size={20} color="#ef4444" />
          ) : device.isAlive ? (
            <Activity size={20} color="#22c55e" />
          ) : (
            <WifiOff size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
          )}
        </div>
        
        <div style={{ minWidth: 0 }}>
          <p style={{ 
            margin: 0, 
            fontWeight: '600', 
            color: isDarkMode ? '#f1f5f9' : '#1e293b', 
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {device.name || 'Unknown Device'}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '2px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8', fontFamily: 'monospace' }}>
              IP: {device.ip}
            </span>
            <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8', fontFamily: 'monospace' }}>
              MAC: {device.mac}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Connection log pills + Security Actions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        justifyContent: 'flex-end',
        flexShrink: 0
      }}>
        <div>
          {device.isBlocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8' }}>{formatTime(device.lastSeenTs)}</span>
              <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Blocked</span>
            </div>
          ) : device.isAlive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Online</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8' }}>Seen {formatTime(device.lastSeenTs)}</span>
              <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b', background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '500' }}>Offline</span>
            </div>
          )}
        </div>

        {/* Admin control validation toggles */}
        {userRole === 'Admin' && (
          <button
            onClick={() => onToggleBlock(device)}
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              backgroundColor: device.isBlocked ? '#22c55e' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {device.isBlocked ? 'Unblock' : 'Block Access'}
          </button>
        )}
      </div>
    </div>
  );
}