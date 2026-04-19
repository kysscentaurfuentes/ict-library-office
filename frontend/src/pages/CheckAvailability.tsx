// frontend/src/pages/CheckAvailability.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { usePC, PC } from "../context/PCContext";

const BOX_SIZE = 40;

const CheckAvailability: React.FC = () => {
  const [selected, setSelected] = useState<PC | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Get PC data from context
  const { pcs, vacantCount, inUseCount, emptyCount, totalPCs, updatePCStatus } = usePC();

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

  const renderBox = (pc: PC, index: number) => {
    if (pc.status === "empty") {
      return (
        <div
          key={`empty-${index}`}
          style={{
            position: "absolute",
            left: pc.x,
            top: pc.y,
            width: BOX_SIZE,
            height: BOX_SIZE,
            border: "2px dashed #64748b",
            borderRadius: "8px",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            background: "#1e293b",
          }}
        >
          🚫
        </div>
      );
    }

    return (
      <div
        key={pc.id}
        onClick={() => setSelected(pc)}
        style={{
          position: "absolute",
          left: pc.x,
          top: pc.y,
          width: BOX_SIZE,
          height: BOX_SIZE,
          borderRadius: "10px",
          fontSize: 11,
          fontWeight: "bold",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: pc.status === "vacant" ? "2px solid #22c55e" : "2px solid #ef4444",
          backgroundColor: pc.status === "vacant" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
          color: pc.status === "vacant" ? "#22c55e" : "#ef4444",
          transition: "all 0.2s ease",
          boxShadow: selected?.id === pc.id ? "0 0 0 3px rgba(59,130,246,0.5)" : "none",
          zIndex: 5,
        }}
      >
        <span style={{ fontSize: 14 }}>🖥️</span>
        <span style={{ fontSize: 9 }}>PC {pc.id}</span>
      </div>
    );
  };

  return (
    <div className={`check-availability-wrapper ${isDarkMode ? 'dark-mode' : ''}`} style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sidebar />

      <div style={{ flex: 1, position: "relative", overflow: "auto", display: "block", background: isDarkMode ? "#0f172a" : "#f8fafc" }}>
        
        <div style={{ minWidth: "1000px", minHeight: "900px", position: "relative", padding: "40px" }}>
          
          <div style={{ position: "sticky", top: 0, left: 0, color: isDarkMode ? "#f1f5f9" : "#1e293b", fontSize: 18, fontWeight: "bold", padding: "20px 0", zIndex: 10 }}>
             🖥️ Computer Availability Map
          </div>

          <div style={{ position: "absolute", left: 60, top: 160, width: 130, height: 110, background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))", border: "2px solid #22c55e", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#22c55e", fontWeight: "bold", boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)" }}>
            <span style={{ fontSize: 28 }}>🚪</span>
            <span style={{ fontSize: 12 }}>ENTRANCE</span>
          </div>

          <div style={{ position: "absolute", left: 50, top: 350, width: 160, height: 220, background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))", border: "2px solid #3b82f6", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#3b82f6", boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)" }}>
            <span style={{ fontSize: 32 }}>👨‍💼</span>
            <span style={{ fontSize: 14, fontWeight: "bold", marginTop: 8 }}>Admin Panel</span>
          </div>

          {pcs.map((pc, index) => renderBox(pc, index))}
        </div>

        <div style={{ position: "fixed", bottom: 20, left: 280, background: isDarkMode ? "#1e293b" : "#ffffff", padding: "12px 18px", borderRadius: "12px", border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`, zIndex: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, background: "rgba(34, 197, 94, 0.3)", border: "1px solid #22c55e" }}></div>
              <span style={{ color: isDarkMode ? "#cbd5e1" : "#475569", fontSize: 12 }}>Vacant ({vacantCount})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, background: "rgba(239, 68, 68, 0.3)", border: "1px solid #ef4444" }}></div>
              <span style={{ color: isDarkMode ? "#cbd5e1" : "#475569", fontSize: 12 }}>In-Use ({inUseCount})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, background: isDarkMode ? "#1e293b" : "#f1f5f9", border: "1px dashed #64748b" }}></div>
              <span style={{ color: isDarkMode ? "#cbd5e1" : "#475569", fontSize: 12 }}>Empty ({emptyCount})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`, paddingLeft: "16px" }}>
              <span style={{ color: isDarkMode ? "#cbd5e1" : "#475569", fontSize: 12 }}>📊 Total PCs: {totalPCs}</span>
            </div>
          </div>
        </div>

        <div style={{ position: "fixed", top: 0, right: selected ? 0 : -450, width: 380, height: "100vh", background: isDarkMode ? "#1e293b" : "#ffffff", color: isDarkMode ? "#f1f5f9" : "#1e293b", padding: 24, transition: "right 0.3s ease", boxShadow: "-8px 0 32px rgba(0,0,0,0.4)", zIndex: 100, borderLeft: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}` }}>
          {selected && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, margin: 0 }}>🖥️ PC {selected.id}</h2>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 24, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ background: selected.status === "vacant" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", borderRadius: "16px", padding: "20px", textAlign: "center", border: `2px solid ${selected.status === "vacant" ? "#22c55e" : "#ef4444"}`, marginBottom: 24 }}>
                <div style={{ fontSize: 28, fontWeight: "bold", color: selected.status === "vacant" ? "#22c55e" : "#ef4444" }}>
                  {selected.status === "vacant" ? "AVAILABLE" : "IN USE"}
                </div>
              </div>
              <button 
                onClick={() => {
                  if (selected.id && selected.status === "vacant") {
                    updatePCStatus(selected.id, "in-use");
                    setSelected(null);
                  }
                }}
                style={{ width: "100%", padding: "12px", background: selected.status === "vacant" ? "#22c55e" : "#475569", border: "none", borderRadius: "12px", color: "white", fontWeight: "bold", cursor: selected.status === "vacant" ? "pointer" : "not-allowed" }}>
                {selected.status === "vacant" ? "Vacant" : "Currently Occupied"}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .check-availability-wrapper {
          display: flex;
          width: 100%;
          height: 100vh;
        }

        .check-availability-wrapper.dark-mode {
          background: #0f172a;
        }
      `}</style>
    </div>
  );
};

export default CheckAvailability;