// frontend/src/MainLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [hoveredFromParent, setHoverFromParent] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        background: '#0f172a',
        overflow: 'hidden', // 🔥 IMPORTANT
      }}
    >
      {/* SIDEBAR FIXED */}
      <Sidebar
        hoveredFromParent={hoveredFromParent}
        setHoverFromParent={setHoverFromParent}
      />

      {/* CONTENT AREA */}
      <div
        style={{
          marginLeft: '260px', // 🔥 IMPORTANT (prevents overlap)
          flex: 1,
          height: '100vh',
          overflowY: 'auto', // ONLY ONE SCROLL
          minWidth: 0,
        }}
      >
        <Outlet context={{ setHoverFromParent }} />
      </div>
    </div>
  );
}