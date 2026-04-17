import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState } from 'react';

export default function MainLayout() {
  const [hoveredFromParent, setHoverFromParent] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      {/* Laging nandito ang Sidebar */}
      <Sidebar 
        hoveredFromParent={hoveredFromParent} 
        setHoverFromParent={setHoverFromParent} 
      />

      {/* Dito papasok ang mga Pages (Home, Router, etc.) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet context={{ setHoverFromParent }} />
      </div>
    </div>
  );
}