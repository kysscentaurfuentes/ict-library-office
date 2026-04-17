// frontend/src/pages/HomeScreen.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  QrCode, Tv, Wifi, ClipboardList, Search, 
  Monitor, AlertTriangle, User, Settings, 
  Code, Printer, MessageSquare, Info, LogOut 
} from 'lucide-react';

export default function HomeScreen() {
  const navigate = useNavigate();
  // Ito ang magko-kontrol sa sabay na highlight
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuCards = [
    { name: 'QR Code Scanner', icon: <QrCode size={32} />, path: '/qr-scanner' },
    { name: 'Live View', icon: <Tv size={32} />, path: '/live' },
    { name: 'Router', icon: <Wifi size={32} />, path: '/router' },
    { name: 'Attendance Log', icon: <ClipboardList size={32} />, path: '#' },
    { name: 'Check Availability', icon: <Search size={32} />, path: '#' },
    { name: 'Reserve a Computer', icon: <Monitor size={32} />, path: '#' },
    { name: 'My Account', icon: <User size={32} />, path: '#' },
    { name: 'Settings', icon: <Settings size={32} />, path: '#' },
    { name: 'Software Access', icon: <Code size={32} />, path: '#' },
    { name: 'Printing Services', icon: <Printer size={32} />, path: '#' },
    { name: 'Feedback', icon: <MessageSquare size={32} />, path: '#' },
    { name: 'About', icon: <Info size={32} />, path: '#' },
    { name: 'Log Out', icon: <LogOut size={32} />, path: 'logout' },
  ];

  const handleAction = (path: string) => {
    if (path === 'logout') {
      localStorage.clear();
      window.location.href = '/signin';
    } else if (path !== '#') {
      navigate(path);
    }
  };

  return (
    <div style={{ display: 'flex', background: '#000', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Ipinapasa natin ang hover state sa Sidebar */}
      <Sidebar hoveredFromParent={hoveredItem} setHoverFromParent={setHoveredItem} />
      
      <div style={{ 
        flex: 1, 
        padding: '20px 40px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '40px', color: 'white' }}>
          Main Menu
        </h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '16px',
          width: '100%',
          maxWidth: '1150px',
          background: 'rgba(255,255,255,0.02)',
          padding: '35px',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {menuCards.map((card) => {
            const isHighlighted = hoveredItem === card.name;
            return (
              <div 
                key={card.name}
                onClick={() => handleAction(card.path)}
                onMouseEnter={() => setHoveredItem(card.name)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  background: isHighlighted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
                  transform: isHighlighted ? 'translateY(-5px)' : 'translateY(0)',
                  padding: '25px 10px',
                  borderRadius: '16px',
                  cursor: card.path !== '#' ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease-out',
                  border: isHighlighted ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
                }}
              >
                <div style={{ color: card.path === 'logout' ? '#ef4444' : (isHighlighted ? '#60a5fa' : '#fff') }}>
                  {card.icon}
                </div>
                <span style={{ 
                  fontSize: '0.6rem', 
                  fontWeight: '800', 
                  textAlign: 'center',
                  color: isHighlighted ? '#fff' : '#bbb'
                }}>
                  {card.name.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}