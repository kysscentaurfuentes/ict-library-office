// frontend/src/pages/HomeScreen.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { usePC } from '../context/PCContext';
import { 
  QrCode, Tv, Wifi, ClipboardList, Search, 
  Monitor, Settings, Code, Printer, MessageSquare, 
  Info, LogOut, Home, Clock, AlertCircle, Shield
} from 'lucide-react';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  
  // Get PC data from shared context - synchronized with CheckAvailability
  const { vacantCount, totalPCs } = usePC();

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

  // Update time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if library is open
  const isLibraryOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const isBusinessHours = hour >= 7 && hour < 17;
    return isWeekday && isBusinessHours;
  };

  const menuCards = [
    { name: 'QR Code Scanner', icon: <QrCode size={28} />, path: '/qr-scanner', color: '#3b82f6', description: 'Scan & Verify' },
    { name: 'Live View', icon: <Tv size={28} />, path: '/live', color: '#ef4444', description: 'CCTV Feed' },
    { name: 'Router', icon: <Wifi size={28} />, path: '/router', color: '#10b981', description: 'Network Monitor' },
    { name: 'Attendance Log', icon: <ClipboardList size={28} />, path: '/attendance-log', color: '#f59e0b', description: 'Track Records' },
    { name: 'Check Availability', icon: <Search size={28} />, path: '/check-availability', color: '#8b5cf6', description: 'PC Status' },
    { name: 'Settings', icon: <Settings size={28} />, path: '/settings', color: '#64748b', description: 'Preferences' },
    { name: 'Software Access', icon: <Code size={28} />, path: '/software-access', color: '#06b6d4', description: 'Install Apps' },
    { name: 'Printing Services', icon: <Printer size={28} />, path: '/printer', color: '#ec4899', description: 'Print Docs' },
    { name: 'Feedback', icon: <MessageSquare size={28} />, path: '/feedback', color: '#14b8a6', description: 'Send Report' },
    { name: 'About', icon: <Info size={28} />, path: '/about', color: '#a855f7', description: 'Developer Info' },
    { name: 'Log Out', icon: <LogOut size={28} />, path: 'logout', color: '#ef4444', description: 'Exit Session' },
  ];

  // Split menu cards into two rows (first 6, next 5)
  const firstRowCards = menuCards.slice(0, 6);
  const secondRowCards = menuCards.slice(6);

  const handleAction = (path: string) => {
    if (path === 'logout') {
      localStorage.clear();
      window.location.href = '/signin';
    } else if (path !== '#') {
      navigate(path);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get user name from localStorage or use default
  const userName = localStorage.getItem('userName') || 'Guest';
  const userFirstName = userName.split(' ')[0];

  // Announcements data
  const announcements = [
    { date: 'April 9, 2026', title: 'Araw ng Kagitingan', message: 'Library will be closed on April 9, 2026 in observance of Araw ng Kagitingan.', type: 'holiday' },
    { date: 'April 17-18, 2026', title: 'Midterm Examinations', message: 'Extended library hours: 7:00 AM - 7:00 PM during exam week.', type: 'event' },
    { date: 'May 1, 2026', title: 'Labor Day', message: 'Library closed on May 1, 2026. Regular operations resume on May 2.', type: 'holiday' },
    { date: 'Ongoing', title: 'New Software Available', message: 'Adobe Photoshop and AutoCAD are now available for request via Software Access.', type: 'update' },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      background: isDarkMode ? '#0f172a' : '#f8fafc', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden' 
    }}>
      <Sidebar hoveredFromParent={hoveredItem} setHoverFromParent={setHoveredItem} />
      
      <div style={{ 
        flex: 1, 
        padding: '20px 35px', 
        display: 'flex', 
        flexDirection: 'column',
        overflowY: 'auto',
        scrollbarWidth: 'thin'
      }}>
        {/* Header Section with Greeting and DateTime */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '25px',
          flexWrap: 'wrap',
          gap: '15px'
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
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(59,130,246,0.3)'
              }}>
                <Home size={28} color="white" />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: '700', 
                  margin: 0,
                  color: isDarkMode ? 'white' : '#1e293b'
                }}>
                  {getGreeting()}, {userFirstName}!
                </h1>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  fontSize: '0.85rem'
                }}>
                  Welcome to ICT Library Office Management System
                </p>
              </div>
            </div>
          </div>
          
          <div style={{
            textAlign: 'right',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            padding: '12px 20px',
            borderRadius: '20px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
              fontFamily: 'monospace'
            }}>
              {currentTime}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              marginTop: '4px'
            }}>
              {currentDate}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '6px',
              marginTop: '8px',
              paddingTop: '6px',
              borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
            }}>
              <Clock size={12} color={isLibraryOpen() ? '#10b981' : '#ef4444'} />
              <span style={{ 
                fontSize: '0.65rem', 
                color: isLibraryOpen() ? '#10b981' : '#ef4444',
                fontWeight: '500'
              }}>
                {isLibraryOpen() ? 'OPEN • 7AM - 5PM' : 'CLOSED • Weekdays 7AM-5PM'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Card - Available PCs Only (Synchronized with CheckAvailability) */}
        <div style={{
          background: isDarkMode ? '#1e293b' : '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '25px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(59,130,246,0.15)',
              padding: '12px',
              borderRadius: '14px'
            }}>
              <Monitor size={28} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Available Computers</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>{vacantCount}</div>
            </div>
          </div>
          <div style={{
            width: '1px',
            height: '40px',
            background: isDarkMode ? '#334155' : '#e2e8f0'
          }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Total Library Computers</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600', color: isDarkMode ? 'white' : '#1e293b' }}>{totalPCs}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>Currently In-Use</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ef4444' }}>{totalPCs - vacantCount}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            fontSize: '0.7rem',
            color: isDarkMode ? '#64748b' : '#94a3b8',
            fontStyle: 'italic'
          }}>
            Last updated: just now
          </div>
        </div>

        {/* Menu Grid - Two Rows */}
        {/* Row 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {firstRowCards.map((card) => {
            const isHighlighted = hoveredItem === card.name;
            return (
              <div 
                key={card.name}
                onClick={() => handleAction(card.path)}
                onMouseEnter={() => setHoveredItem(card.name)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  background: isHighlighted 
                    ? `linear-gradient(135deg, ${card.color}20, ${card.color}10)` 
                    : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  transform: isHighlighted ? 'translateY(-4px)' : 'translateY(0)',
                  padding: '20px 12px',
                  borderRadius: '16px',
                  cursor: card.path !== '#' ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: isHighlighted 
                    ? `1px solid ${card.color}40` 
                    : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  boxShadow: isHighlighted ? `0 8px 20px ${card.color}20` : 'none'
                }}
              >
                <div style={{ 
                  color: isHighlighted ? card.color : (card.path === 'logout' ? '#ef4444' : (isDarkMode ? '#cbd5e1' : '#64748b')),
                  transition: 'color 0.2s'
                }}>
                  {card.icon}
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: '700', 
                  textAlign: 'center',
                  color: isHighlighted ? card.color : (isDarkMode ? '#94a3b8' : '#64748b')
                }}>
                  {card.name.toUpperCase()}
                </span>
                <span style={{
                  fontSize: '0.6rem',
                  color: isDarkMode ? '#64748b' : '#94a3b8',
                  textAlign: 'center'
                }}>
                  {card.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* Row 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginBottom: '25px'
        }}>
          {secondRowCards.map((card) => {
            const isHighlighted = hoveredItem === card.name;
            return (
              <div 
                key={card.name}
                onClick={() => handleAction(card.path)}
                onMouseEnter={() => setHoveredItem(card.name)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  background: isHighlighted 
                    ? `linear-gradient(135deg, ${card.color}20, ${card.color}10)` 
                    : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  transform: isHighlighted ? 'translateY(-4px)' : 'translateY(0)',
                  padding: '20px 12px',
                  borderRadius: '16px',
                  cursor: card.path !== '#' ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: isHighlighted 
                    ? `1px solid ${card.color}40` 
                    : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  boxShadow: isHighlighted ? `0 8px 20px ${card.color}20` : 'none'
                }}
              >
                <div style={{ 
                  color: isHighlighted ? card.color : (card.path === 'logout' ? '#ef4444' : (isDarkMode ? '#cbd5e1' : '#64748b')),
                  transition: 'color 0.2s'
                }}>
                  {card.icon}
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: '700', 
                  textAlign: 'center',
                  color: isHighlighted ? card.color : (isDarkMode ? '#94a3b8' : '#64748b')
                }}>
                  {card.name.toUpperCase()}
                </span>
                <span style={{
                  fontSize: '0.6rem',
                  color: isDarkMode ? '#64748b' : '#94a3b8',
                  textAlign: 'center'
                }}>
                  {card.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* Announcements & Updates Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Announcements */}
          <div style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '15px 20px',
              background: isDarkMode ? '#0f172a' : '#f8fafc',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={20} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: isDarkMode ? 'white' : '#1e293b' }}>
                Announcements & Updates
              </h3>
            </div>
            <div style={{ padding: '15px 20px' }}>
              {announcements.map((announcement, idx) => (
                <div key={idx} style={{
                  marginBottom: idx < announcements.length - 1 ? '15px' : 0,
                  paddingBottom: idx < announcements.length - 1 ? '15px' : 0,
                  borderBottom: idx < announcements.length - 1 ? `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: announcement.type === 'holiday' ? '#ef444420' : announcement.type === 'event' ? '#3b82f620' : '#10b98120',
                      color: announcement.type === 'holiday' ? '#ef4444' : announcement.type === 'event' ? '#3b82f6' : '#10b981'
                    }}>
                      {announcement.date}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: isDarkMode ? '#cbd5e1' : '#475569'
                    }}>
                      {announcement.title}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    lineHeight: '1.4'
                  }}>
                    {announcement.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Library Policies */}
          <div style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '15px 20px',
              background: isDarkMode ? '#0f172a' : '#f8fafc',
              borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Shield size={20} color="#8b5cf6" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: isDarkMode ? 'white' : '#1e293b' }}>
                Library Policies
              </h3>
            </div>
            <div style={{ padding: '15px 20px' }}>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: '0.75rem',
                lineHeight: '1.6'
              }}>
                <li>No littering - Keep the library clean at all times</li>
                <li>No theft - Stealing library property or personal belongings is strictly prohibited</li>
                <li>No unauthorized downloads - Do not download software or files that may compromise computer security</li>
                <li>No fraudulent activities - Any form of anomaly or fraud will be reported to authorities</li>
                <li>No food or drinks near computers - To prevent damage to equipment</li>
                <li>Maintain silence - Respect other library users</li>
                <li>Return borrowed items on time - Late returns may incur penalties</li>
                <li>Report issues immediately - Notify staff of any technical problems or concerns</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '10px',
          padding: '15px',
          textAlign: 'center',
          borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          color: isDarkMode ? '#64748b' : '#94a3b8',
          fontSize: '0.7rem'
        }}>
          <p>© 2026 ICT Library Office Management System | All Rights Reserved</p>
        </div>
      </div>

      <style>{`
        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#1e293b' : '#f1f5f9'};
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#475569' : '#cbd5e1'};
          borderRadius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#64748b' : '#94a3b8'};
        }
      `}</style>
    </div>
  );
}