// frontend/src/pages/Router.tsx
import Sidebar from '../components/Sidebar';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';

type Device = {
  ip: string;
  mac: string;
  name: string;
  isAlive: boolean; // ✅ ADD THIS
};

type DeviceStatus = {
  ip: string;
  mac: string;
  name: string;
  lastSeen: number;
  isActive: boolean;
};

const GET_DEVICES = gql`
  query {
    routerDevices {
      ip
      mac
      name
      isAlive
    }
  }
`;

const OFFLINE_THRESHOLD = 10000; // 🔥 10 seconds bago maging offline

export default function Router() {
  const { data } = useQuery<{ routerDevices: Device[] }>(
    GET_DEVICES,
    { pollInterval: 3000 } // refresh every 3 sec
  );

  const [devices, setDevices] = useState<Record<string, DeviceStatus>>({});

  useEffect(() => {
    if (!data?.routerDevices) return;

    const now = Date.now();

    setDevices((prev) => {
      const updated = { ...prev };

      // ✅ Update / Add active devices
      data.routerDevices.forEach((d) => {
        updated[d.mac] = {
  ip: d.ip,
  mac: d.mac,
  name: d.name,
  isActive: d.isAlive, // ✅ ONLY ONE
  lastSeen: d.isAlive
    ? now
    : (prev[d.mac]?.lastSeen ?? now),
};
      });

      // 🔥 Timeout-based OFFLINE detection
      Object.keys(updated).forEach((mac) => {
        const device = updated[mac];

        if (now - device.lastSeen > OFFLINE_THRESHOLD) {
          device.isActive = false;
        }
      });

      return updated;
    });
  }, [data]);

  // 🧠 Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const allDevices = Object.values(devices);

  const network8 = allDevices.filter(d => d.ip.startsWith('192.168.8.'));
  const network1 = allDevices.filter(d => d.ip.startsWith('192.168.1.'));

  return (
    <div style={{ display: 'flex', background: '#0f172a', minHeight: '100vh' }}>
      
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div style={{ flex: 1, padding: '20px', color: 'white' }}>
        <h2>📶 Connected Devices</h2>
        <p style={{ fontSize: '12px', color: '#888' }}>
          🔄 Live monitoring (3s refresh)
        </p>

        {/* 🔵 MAIN NETWORK */}
        <h3 style={{ marginTop: '20px', color: '#60a5fa' }}>
          🌐 Main Network (192.168.8.x)
        </h3>

        {network8.map((device) => (
          <DeviceCard key={device.mac} device={device} formatTime={formatTime} />
        ))}

        {/* 🟣 SUBNET */}
        <h3 style={{ marginTop: '20px', color: '#a78bfa' }}>
          📡 Router Subnet (192.168.1.x)
        </h3>

        {network1.map((device) => (
          <DeviceCard key={device.mac} device={device} formatTime={formatTime} />
        ))}
      </div>
    </div>
  );
}

// 🔥 CLEAN COMPONENT
function DeviceCard({ device, formatTime }: any) {
  return (
    <div style={{
      padding: '12px',
      borderBottom: '1px solid #333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
  <p style={{ margin: 0, fontWeight: 'bold' }}>
    {device.name}
  </p>
  <p style={{ margin: 0 }}>IP: {device.ip}</p>
  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
    MAC: {device.mac}
  </p>
</div>

      <div style={{ textAlign: 'right' }}>
        {device.isActive ? (
          <div style={{
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#22c55e',
              borderRadius: '50%',
              display: 'inline-block'
            }} />
            Active
          </div>
        ) : (
          <div style={{ color: '#ef4444', fontSize: '13px' }}>
            Offline
            <div style={{ fontSize: '11px', color: '#888' }}>
              Last seen: {formatTime(device.lastSeen)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}