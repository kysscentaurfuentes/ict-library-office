// frontend/src/pages/CheckAvailability.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { usePC, PC } from "../context/PCContext";

const BOX_SIZE = 44;

const CheckAvailability: React.FC = () => {
  const [selected, setSelected] = useState<PC | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [hoveredPC, setHoveredPC] = useState<PC | null>(null);
  
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'vacant': return { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#22c55e' };
      case 'in-use': return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#ef4444' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', border: '#64748b', text: '#64748b' };
    }
  };

  const renderBox = (pc: PC, index: number) => {
    const colors = getStatusColor(pc.status);
    const isHovered = hoveredPC?.id === pc.id;
    const isEmpty = pc.status === "empty";

    if (isEmpty) {
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
            borderRadius: "12px",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            background: isDarkMode ? "#1e293b" : "#f1f5f9",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: 20 }}>🚫</span>
        </div>
      );
    }

    return (
      <div
        key={pc.id}
        onClick={() => setSelected(pc)}
        onMouseEnter={() => setHoveredPC(pc)}
        onMouseLeave={() => setHoveredPC(null)}
        style={{
          position: "absolute",
          left: pc.x,
          top: pc.y,
          width: BOX_SIZE,
          height: BOX_SIZE,
          borderRadius: "12px",
          fontSize: 11,
          fontWeight: "bold",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: `2px solid ${colors.border}`,
          backgroundColor: colors.bg,
          color: colors.text,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isHovered ? `0 0 0 3px ${colors.border}40` : (selected?.id === pc.id ? `0 0 0 3px ${colors.border}` : "none"),
          transform: isHovered ? "scale(1.02)" : "scale(1)",
          zIndex: isHovered ? 10 : 5,
          backdropFilter: "blur(2px)",
        }}
      >
        <span style={{ fontSize: 18, marginBottom: 2 }}>{pc.status === "vacant" ? "🖥️" : "💻"}</span>
        <span style={{ fontSize: 9, fontWeight: 600 }}>PC {pc.id}</span>
        <span style={{ 
          fontSize: 8, 
          position: "absolute", 
          bottom: 4, 
          right: 6,
          opacity: 0.7
        }}>
          {pc.status === "vacant" ? "○" : "●"}
        </span>
      </div>
    );
  };

  return (
    <div className={`check-availability-wrapper ${isDarkMode ? 'dark-mode' : ''}`} style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sidebar />

      <div style={{ 
        flex: 1, 
        position: "relative", 
        overflow: "auto", 
        background: isDarkMode ? 
          "radial-gradient(circle at 20% 50%, #0f172a, #020617)" : 
          "radial-gradient(circle at 20% 50%, #f8fafc, #f1f5f9)"
      }}>
        
        <div style={{ 
  minWidth: "1100px",
  minHeight: "900px",
  position: "relative",
  padding: "10px 40px 40px 40px"
}}>
          
          {/* Header */}
          <div style={{ 
            position: "sticky", 
            top: 0, 
            left: 0, 
            color: isDarkMode ? "#f1f5f9" : "#1e293b", 
            fontSize: 24, 
            fontWeight: "bold", 
            padding: "20px 0",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: isDarkMode ? "linear-gradient(135deg, #0f172a, #1e293b)" : "linear-gradient(135deg, #f8fafc, #ffffff)",
            borderRadius: "12px",
            marginBottom: "20px"
          }}>
            <span style={{ fontSize: 32 }}>🗺️</span>
            <span>Computer Availability Map</span>
          </div>

          {/* Entrance Marker */}
          <div style={{ 
            position: "absolute", 
            left: 60, 
            top: 180, 
            width: 140, 
            height: 120, 
            background: isDarkMode ? 
              "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))" : 
              "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
            border: `2px solid #22c55e`,
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#22c55e",
            fontWeight: "bold",
            boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)",
            backdropFilter: "blur(10px)",
            animation: "pulse 2s infinite"
          }}>
            <span style={{ fontSize: 32 }}>🚪</span>
            <span style={{ fontSize: 13, marginTop: 8 }}>ENTRANCE</span>
          </div>

          {/* Admin Panel Marker */}
          <div style={{ 
            position: "absolute", 
            left: 50, 
            top: 380, 
            width: 170, 
            height: 240, 
            background: isDarkMode ? 
              "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))" : 
              "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))",
            border: `2px solid #3b82f6`,
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#3b82f6",
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
            backdropFilter: "blur(10px)"
          }}>
            <span style={{ fontSize: 36 }}>👨‍💼</span>
            <span style={{ fontSize: 14, fontWeight: "bold", marginTop: 12 }}>Admin Panel</span>
            <span style={{ fontSize: 10, marginTop: 8, opacity: 0.7 }}>Report Issues Here</span>
          </div>

          {/* PC Grid */}
          {pcs.map((pc, index) => renderBox(pc, index))}
        </div>

        {/* Stats Footer */}
        <div style={{ 
          position: "fixed", 
          bottom: 24, 
          left: 280, 
          background: isDarkMode ? 
            "rgba(30, 41, 59, 0.95)" : 
            "rgba(255, 255, 255, 0.95)",
          padding: "14px 24px", 
          borderRadius: "16px", 
          border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
          zIndex: 20, 
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ 
                width: 20, 
                height: 20, 
                borderRadius: 6, 
                background: "rgba(34, 197, 94, 0.2)", 
                border: "2px solid #22c55e",
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.3)"
              }}></div>
              <span style={{ color: isDarkMode ? "#cbd5e1" : "#475569", fontSize: 13, fontWeight: 500 }}>
                Vacant <strong style={{ color: "#22c55e", fontSize: 16 }}>{vacantCount}</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ 
                width: 20, 
                height: 20, 
                borderRadius: 6, 
                background: "rgba(239, 68, 68, 0.2)", 
                border: "2px solid #ef4444",
                boxShadow: "0 0 8px rgba(239, 68, 68, 0.3)"
              }}></div>
              <span style={{ color: isDarkMode ? "#cbd5e1" : "#475569", fontSize: 13, fontWeight: 500 }}>
                In-Use <strong style={{ color: "#ef4444", fontSize: 16 }}>{inUseCount}</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ 
                width: 20, 
                height: 20, 
                borderRadius: 6, 
                background: isDarkMode ? "#1e293b" : "#f1f5f9", 
                border: "2px dashed #64748b"
              }}></div>
              <span style={{ color: isDarkMode ? "#cbd5e1" : "#475569", fontSize: 13, fontWeight: 500 }}>
                Empty <strong style={{ color: "#64748b", fontSize: 16 }}>{emptyCount}</strong>
              </span>
            </div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              borderLeft: `2px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`, 
              paddingLeft: "24px" 
            }}>
              <span style={{ fontSize: 20 }}>📊</span>
              <span style={{ color: isDarkMode ? "#cbd5e1" : "#475569", fontSize: 13, fontWeight: 500 }}>
                Total PCs: <strong style={{ color: "#3b82f6", fontSize: 16 }}>{totalPCs}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div style={{ 
          position: "fixed", 
          top: 0, 
          right: selected ? 0 : -450, 
          width: 420, 
          height: "100vh", 
          background: isDarkMode ? 
            "linear-gradient(135deg, #1e293b, #0f172a)" : 
            "linear-gradient(135deg, #ffffff, #f8fafc)",
          color: isDarkMode ? "#f1f5f9" : "#1e293b", 
          padding: 32, 
          transition: "right 0.4s cubic-bezier(0.4, 0, 0.2, 1)", 
          boxShadow: "-8px 0 48px rgba(0,0,0,0.3)", 
          zIndex: 100, 
          borderLeft: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
          overflowY: "auto"
        }}>
          {selected && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontSize: 28, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                    <span>🖥️</span> PC {selected.id}
                  </h2>
                  <p style={{ margin: "8px 0 0", fontSize: 12, opacity: 0.6 }}>Click outside to close</p>
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  style={{ 
                    background: isDarkMode ? "#334155" : "#e2e8f0", 
                    border: "none", 
                    color: isDarkMode ? "#f1f5f9" : "#475569", 
                    width: 36, 
                    height: 36, 
                    borderRadius: "50%", 
                    fontSize: 20, 
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  ✕
                </button>
              </div>

              <div style={{ 
                background: selected.status === "vacant" ? 
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))" : 
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))",
                borderRadius: "24px", 
                padding: "32px 20px", 
                textAlign: "center", 
                border: `2px solid ${selected.status === "vacant" ? "#22c55e" : "#ef4444"}`,
                marginBottom: 32,
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{ 
                  fontSize: 48, 
                  fontWeight: "bold", 
                  color: selected.status === "vacant" ? "#22c55e" : "#ef4444",
                  marginBottom: 12
                }}>
                  {selected.status === "vacant" ? "🟢 AVAILABLE" : "🔴 IN USE"}
                </div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>
                  {selected.status === "vacant" ? 
                    "This computer is ready for use" : 
                    "This computer is currently occupied"}
                </div>
              </div>

              <button 
                onClick={() => {
                  if (selected.id && selected.status === "vacant") {
                    updatePCStatus(selected.id, "in-use");
                    setSelected(null);
                  }
                }}
                style={{ 
                  width: "100%", 
                  padding: "14px", 
                  background: selected.status === "vacant" ? 
                    "linear-gradient(135deg, #22c55e, #16a34a)" : 
                    isDarkMode ? "#334155" : "#cbd5e1",
                  border: "none", 
                  borderRadius: "16px", 
                  color: selected.status === "vacant" ? "white" : (isDarkMode ? "#94a3b8" : "#64748b"),
                  fontWeight: "bold", 
                  fontSize: 16,
                  cursor: selected.status === "vacant" ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  opacity: selected.status === "vacant" ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (selected.status === "vacant") {
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {selected.status === "vacant" ? "✅ Mark as In Use" : "⛔ Currently Occupied"}
              </button>

              {/* Additional Info */}
              <div style={{ 
                marginTop: 32, 
                padding: 20, 
                background: isDarkMode ? "rgba(51, 65, 85, 0.3)" : "rgba(241, 245, 249, 0.5)",
                borderRadius: "16px",
                fontSize: 12,
                lineHeight: 1.6
              }}>
                <strong>📍 Location Info:</strong>
                <p style={{ margin: "8px 0 0" }}>
                  Coordinates: ({selected.x}, {selected.y})<br />
                  Status last updated: Just now
                </p>
              </div>
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

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
          }
        }

        /* Custom scrollbar */
        .check-availability-wrapper ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .check-availability-wrapper ::-webkit-scrollbar-track {
          background: rgba(100, 116, 139, 0.1);
          border-radius: 4px;
        }

        .check-availability-wrapper ::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 4px;
        }

        .check-availability-wrapper ::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CheckAvailability;