// frontend/src/components/Sidebar.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, QrCode, Tv, Wifi, ClipboardList, Search, 
  Monitor, AlertTriangle, User, Settings, 
  Code, Printer, MessageSquare, Info, LogOut 
} from 'lucide-react';

interface SidebarProps {
  hoveredFromParent?: string | null;
  setHoverFromParent?: (name: string | null) => void;
}

export default function Sidebar({ hoveredFromParent, setHoverFromParent }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'QR Code Scanner', icon: <QrCode size={20} />, path: '/qr-scanner' },
    { name: 'Live View', icon: <Tv size={20} />, path: '/live' },
    { name: 'Router', icon: <Wifi size={20} />, path: '#' },
    { name: 'Attendance Log', icon: <ClipboardList size={20} />, path: '#' },
    { name: 'Check Availability', icon: <Search size={20} />, path: '#' },
    { name: 'Reserve a Computer', icon: <Monitor size={20} />, path: '#' },
    { name: 'My Account', icon: <User size={20} />, path: '#' },
    { name: 'Settings', icon: <Settings size={20} />, path: '#' },
    { name: 'Software Access', icon: <Code size={20} />, path: '#' },
    { name: 'Printing Services', icon: <Printer size={20} />, path: '#' },
    { name: 'Feedback', icon: <MessageSquare size={20} />, path: '#' },
    { name: 'About', icon: <Info size={20} />, path: '#' },
  ];

  return (
    <div style={{ 
      width: '260px', 
      background: '#000', 
      height: '100vh', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #222',
      boxSizing: 'border-box'
    }}>
      <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', gap: '10px', marginBottom: '30px', cursor: 'pointer', padding: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>🏠</span>
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#fff' }}>Home</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          // Ito ang magic: highlighted ito kung ang mouse ay nasa box (parent) OR nasa sidebar item mismo
          const isSyncHighlighted = hoveredFromParent === item.name;

          return (
            <div 
              key={item.name}
              onClick={() => item.path !== '#' && navigate(item.path)}
              onMouseEnter={() => setHoverFromParent?.(item.name)}
              onMouseLeave={() => setHoverFromParent?.(null)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                borderRadius: '8px',
                transition: '0.2s',
                background: (isActive || isSyncHighlighted) ? '#1e293b' : 'transparent',
                color: (isActive || isSyncHighlighted) ? '#fff' : '#888',
                cursor: item.path !== '#' ? 'pointer' : 'default'
              }}
            >
              <div style={{ color: (isActive || isSyncHighlighted) ? '#60a5fa' : 'inherit' }}>{item.icon}</div>
              <span style={{ fontSize: '0.85rem' }}>{item.name}</span>
            </div>
          );
        })}
      </div>
      
      <div 
        onClick={() => { localStorage.clear(); window.location.href = '/signin'; }}
        onMouseEnter={() => setHoverFromParent?.('Log Out')}
        onMouseLeave={() => setHoverFromParent?.(null)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '15px 12px', 
          marginBottom: '40px', // Tinaasan natin para hindi putol (from 20px to 40px)
          color: '#ef4444',
          borderTop: '1px solid #222',
          cursor: 'pointer',
          background: hoveredFromParent === 'Log Out' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
        }}
      >
        <LogOut size={20} />
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Log Out</span>
      </div>
    </div>
  );
}