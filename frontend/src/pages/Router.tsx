// frontend/src/pages/Router.tsx

import Sidebar from '../components/Sidebar';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';

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

const OFFLINE_THRESHOLD = 1000;

export default function Router() {
  const { data, refetch } = useQuery<{ routerDevices: Device[] }>(
    GET_DEVICES,
    { pollInterval: 3000 }
  );

  const [blockDevice] = useMutation(BLOCK_DEVICE);
  const [unblockDevice] = useMutation(UNBLOCK_DEVICE);

  const [devices, setDevices] = useState<DeviceState>({});

  useEffect(() => {
    if (!data?.routerDevices) return;

    const now = Date.now();

    setDevices((prev) => {
      const updated: DeviceState = { ...prev };

      data.routerDevices.forEach((d) => {
        const prevDevice = prev[d.mac];

        let lastSeenTs = prevDevice?.lastSeenTs ?? now;

        // ✅ IF ONLINE → update last seen
        if (d.isAlive) {
          lastSeenTs = now;
        }

        // ✅ IF JUST BLOCKED → force last seen = now
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

      const JUST_SEEN_THRESHOLD = 5000; // 5 seconds

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

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  const allDevices = Object.values(devices);

  const network8 = allDevices.filter(d => d.ip.startsWith('192.168.8.'));
  const network1 = allDevices.filter(d => d.ip.startsWith('192.168.1.'));

  return (
    <div style={{ display: 'flex', background: '#0f172a', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '20px', color: 'white' }}>
        <h2>📶 Connected Devices</h2>
        <p style={{ fontSize: '12px', color: '#888' }}>
          🔄 Live monitoring
        </p>

        <h3 style={{ marginTop: '20px', color: '#60a5fa' }}>
          🌐 Main Network (192.168.8.x)
        </h3>

        {network8.map((device) => (
          <DeviceCard
            key={device.mac}
            device={device}
            formatTime={formatTime}
            onToggleBlock={handleToggleBlock}
          />
        ))}

        <h3 style={{ marginTop: '20px', color: '#a78bfa' }}>
          📡 Router Subnet (192.168.1.x)
        </h3>

        {network1.map((device) => (
          <DeviceCard
            key={device.mac}
            device={device}
            formatTime={formatTime}
            onToggleBlock={handleToggleBlock}
          />
        ))}
      </div>
    </div>
  );
}

// 🔥 DEVICE CARD
function DeviceCard({ device, formatTime, onToggleBlock }: any) {
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
        {/* 🔥 STATUS */}
        {device.isBlocked ? (
          <div style={{ color: '#ef4444', fontSize: '13px' }}>
            🔴 Blocked
            <div style={{ fontSize: '11px', color: '#666' }}>
              Last seen: {formatTime(device.lastSeenTs)}
            </div>
          </div>
        ) : device.isAlive ? (
          <div style={{ color: '#22c55e', fontSize: '13px' }}>
            🟢 Online
          </div>
        ) : (
          <div style={{ color: '#888', fontSize: '13px' }}>
            ⚪ Offline
            <div style={{ fontSize: '11px', color: '#666' }}>
              Last seen: {formatTime(device.lastSeenTs)}
            </div>
          </div>
        )}

        {/* 🔥 BUTTON */}
        <button
          onClick={() => onToggleBlock(device)}
          style={{
            marginTop: '6px',
            padding: '4px 8px',
            cursor: 'pointer'
          }}
        >
          {device.isBlocked ? 'Unblock' : 'Block'}
        </button>
      </div>
    </div>
  );
}