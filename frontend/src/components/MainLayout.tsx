// frontend/src/MainLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function MainLayout() {

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        background: '#0f172a',
      }}
    >
      {/* SIDEBAR FIXED */}
<Sidebar />

      {/* CONTENT AREA */}
      <div
        style={{

          flex: 1,
          height: '100vh',
          overflowY: 'auto',
scrollbarGutter: 'stable',
          minWidth: 0,
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}