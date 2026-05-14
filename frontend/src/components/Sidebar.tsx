// frontend/src/components/Sidebar.tsx

import {
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  Home,
  QrCode,
  Tv,
  Wifi,
  ClipboardList,
  Search,
  Settings,
  Code,
  Printer,
  MessageSquare,
  Info,
  LogOut,
  User,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

interface SidebarProps {
  hoveredFromParent?: string | null;

  setHoverFromParent?: (
    name: string | null
  ) => void;
}

export default function Sidebar({
  hoveredFromParent,
  setHoverFromParent,
}: SidebarProps) {

  const navigate = useNavigate();

  const location = useLocation();

  // ====================================
  // USER STATE
  // ====================================

  const [user, setUser] =
    useState<any>(null);

  const [imageError, setImageError] =
    useState(false);

  // ====================================
  // LOAD USER
  // ====================================

  useEffect(() => {

    const loadUser = () => {

      try {

        const storedUser =
          localStorage.getItem('user');

        if (!storedUser) {
          setUser(null);
          return;
        }

        const parsed =
          JSON.parse(storedUser);

        console.log(
          'SIDEBAR USER:',
          parsed
        );

        setUser(parsed);

        setImageError(false);

      } catch (error) {

        console.error(
          'Failed parsing user:',
          error
        );

        setUser(null);
      }
    };

    // INITIAL LOAD
    loadUser();

    // REALTIME UPDATE
    window.addEventListener(
      'profilePictureUpdated',
      loadUser
    );

    window.addEventListener(
      'storage',
      loadUser
    );

    return () => {

      window.removeEventListener(
        'profilePictureUpdated',
        loadUser
      );

      window.removeEventListener(
        'storage',
        loadUser
      );
    };

  }, []);

  // ====================================
  // PROFILE PICTURE URL
  // ====================================

 const profilePicture = useMemo(() => {

  if (!user?.profile_picture) {
    return null;
  }

  let cleaned = user.profile_picture.trim();

  // REMOVE TRAILING SPACES ONLY
 cleaned = cleaned.trim();

  // CACHE BUST
  const finalUrl =
    `${cleaned}?v=${user?.updatedAt || Date.now()}`

  console.log(
    'FINAL IMAGE URL:',
    finalUrl
  );

  return finalUrl;

}, [user]);

  // ====================================
  // MENU ITEMS
  // ====================================

  const menuItems = [

    {
      name: 'Home',
      icon: <Home size={20} />,
      path: '/homescreen',
    },

    {
      name: 'QR Code Scanner',
      icon: <QrCode size={20} />,
      path: '/qr-scanner',
    },

    {
      name: 'Live View',
      icon: <Tv size={20} />,
      path: '/live',
    },

    {
      name: 'Router',
      icon: <Wifi size={20} />,
      path: '/router',
    },

    {
      name: 'Attendance Log',
      icon: (
        <ClipboardList size={20} />
      ),
      path: '/attendance-log',
    },

    {
      name: 'Check Availability',
      icon: <Search size={20} />,
      path: '/check-availability',
    },

    {
      name: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
    },

    {
      name: 'Software Access',
      icon: <Code size={20} />,
      path: '/software-access',
    },

    {
      name: 'Printing Services',
      icon: <Printer size={20} />,
      path: '/printer',
    },

    {
      name: 'Feedback',
      icon: (
        <MessageSquare size={20} />
      ),
      path: '/feedback',
    },

    {
      name: 'About',
      icon: <Info size={20} />,
      path: '/about',
    },
  ];

  // ====================================
  // RENDER
  // ====================================

  return (

    <div
      style={{
        width: '260px',
        background: '#020617',
        height: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        borderRight:
          '2px solid #1e293b',
        boxSizing: 'border-box',
      }}
    >

      {/* ==================================== */}
      {/* HEADER */}
      {/* ==================================== */}

      
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '30px',
    padding: '10px',
  }}
>

        {/* PROFILE IMAGE */}

        {!imageError &&
        profilePicture ? (

          <img
            src={profilePicture}
            alt="Profile"

            onLoad={() => {

              console.log(
                'IMAGE LOADED SUCCESSFULLY'
              );
            }}

            onError={(e) => {

              console.error(
                'FAILED IMAGE URL:',
                profilePicture
              );

              setImageError(true);
            }}

            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              objectFit: 'cover',
              border:
                '2px solid #3b82f6',
            }}
          />

        ) : (

          <div
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <User size={20} />
          </div>
        )}

        {/* TITLE */}

        <div>

          <h2
  style={{
    fontSize: '1rem',
    margin: 0,
    color: '#fff',
  }}
>
  {user?.first_name} {user?.last_name || 'Student'}
</h2>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            {user?.role || 'Student'} Portal
          </span>

        </div>
      </div>

      {/* ==================================== */}
      {/* MENU */}
      {/* ==================================== */}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
        }}
      >

        {menuItems.map((item) => {

          const isActive =
            location.pathname ===
            item.path;

          const isSyncHighlighted =
            hoveredFromParent ===
            item.name;

          return (

            <div
              key={item.name}

              onClick={() =>
                navigate(item.path)
              }

              onMouseEnter={() =>
                setHoverFromParent?.(
                  item.name
                )
              }

              onMouseLeave={() =>
                setHoverFromParent?.(
                  null
                )
              }

              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                transition: '0.2s',

                background:
                  isActive ||
                  isSyncHighlighted
                    ? '#1e293b'
                    : 'transparent',

                color:
                  isActive ||
                  isSyncHighlighted
                    ? '#fff'
                    : '#888',

                cursor: 'pointer',
              }}
            >

              <div
                style={{
                  color:
                    isActive ||
                    isSyncHighlighted
                      ? '#60a5fa'
                      : 'inherit',
                }}
              >
                {item.icon}
              </div>

              <span
                style={{
                  fontSize: '0.85rem',
                }}
              >
                {item.name}
              </span>

            </div>
          );
        })}
      </div>

      {/* ==================================== */}
      {/* LOGOUT */}
      {/* ==================================== */}

      <div
        onClick={() => {

          localStorage.clear();

          navigate('/signin');
        }}

        onMouseEnter={() =>
          setHoverFromParent?.(
            'Log Out'
          )
        }

        onMouseLeave={() =>
          setHoverFromParent?.(null)
        }

        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '15px 12px',
          marginBottom: '40px',
          color: '#ef4444',
          borderTop:
            '1px solid #222',
          cursor: 'pointer',

          background:
            hoveredFromParent ===
            'Log Out'
              ? 'rgba(239,68,68,0.1)'
              : 'transparent',
        }}
      >

        <LogOut size={20} />

        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
          }}
        >
          Log Out
        </span>

      </div>
    </div>
  );
}