// frontend/src/pages/QrCodeScanner.tsx

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Sidebar from "../components/Sidebar";

export default function QrCodeScanner() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const studentId = localStorage.getItem("studentId") || "N/A";

  useEffect(() => {
    const applyTheme = () => {
      const savedDarkMode = localStorage.getItem("darkMode");

      if (savedDarkMode === "true") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark-mode");
        document.body.classList.add("dark-mode");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark-mode");
        document.body.classList.remove("dark-mode");
      }
    };

    applyTheme();

    window.addEventListener("storage", applyTheme);

    return () => {
      window.removeEventListener("storage", applyTheme);
    };
  }, []);

const copyToClipboard = async () => {
  try {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(studentId);
    } else {
      // Fallback for HTTP / LAN IP
      const textArea = document.createElement("textarea");
      textArea.value = studentId;

      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand("copy");

      textArea.remove();
    }

    setShowTooltip(true);

    setTimeout(() => {
      setShowTooltip(false);
    }, 2000);

  } catch (error) {
    console.error("Copy failed:", error);
  }
};

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: isDarkMode
          ? "linear-gradient(135deg, #020617 0%, #08132c 50%, #0f172a 100%)"
          : "#f8fafc",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          overflow: "hidden",
        }}
      >
        {/* ================= BACKGROUND DECORATIONS ================= */}

        {/* Top left glow */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "6%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* Bottom right glow */}
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            right: "6%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
            filter: "blur(25px)",
          }}
        />

        {/* Center glow */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "30%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)",
            filter: "blur(35px)",
          }}
        />

        {/* Floating boxes */}
{[
  { top: "8%", left: "12%", size: 42, rotate: "15deg" },
  { top: "18%", right: "14%", size: 90, rotate: "45deg" },
  { top: "35%", left: "18%", size: 55, rotate: "25deg" },
  { top: "52%", right: "20%", size: 38, rotate: "10deg" },
  { top: "65%", left: "10%", size: 70, rotate: "35deg" },
  { top: "75%", right: "30%", size: 52, rotate: "55deg" },

  { bottom: "8%", left: "15%", size: 82, rotate: "25deg" },
  { bottom: "18%", right: "10%", size: 48, rotate: "35deg" },
  { bottom: "28%", left: "28%", size: 35, rotate: "65deg" },
  { bottom: "42%", right: "16%", size: 60, rotate: "12deg" },

  { top: "12%", left: "42%", size: 25, rotate: "10deg" },
  { top: "25%", right: "35%", size: 30, rotate: "40deg" },
  { top: "45%", left: "35%", size: 22, rotate: "20deg" },
  { bottom: "30%", left: "42%", size: 28, rotate: "15deg" },
  { bottom: "55%", right: "28%", size: 32, rotate: "50deg" },
  { bottom: "70%", right: "42%", size: 22, rotate: "20deg" },
].map((box, i) => (
  <div
    key={i}
    style={{
      position: "absolute",
      ...box,
      width: box.size,
      height: box.size,
      border: "1px solid rgba(59,130,246,0.12)",
      borderRadius: 18,
      transform: `rotate(${box.rotate})`,
      boxShadow: "0 0 20px rgba(59,130,246,0.08)",
      animation: `boxFloat ${12 + i * 0.8}s ease-in-out infinite`,
      animationDelay: `${i * 0.5}s`,
    }}
  />
))}

{/* Tiny glowing lights */}
{[...Array(35)].map((_, i) => (
  <div
    key={i}
    style={{
      position: "absolute",
      width: Math.random() * 4 + 2,
      height: Math.random() * 4 + 2,
      borderRadius: "50%",
      background: "rgba(96,165,250,0.6)",
      top: `${Math.random() * 95}%`,
      left: `${Math.random() * 95}%`,
      boxShadow: "0 0 12px rgba(96,165,250,0.6)",
    }}
  />
))}

        {/* Tiny particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "rgba(96,165,250,0.4)",
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              boxShadow: "0 0 10px rgba(96,165,250,0.5)",
            }}
          />
        ))}

        {/* ================= CONTENT ================= */}

        {/* Floating phone icon */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // ito ang totoong center fix
    justifyContent: "center",
    marginBottom: 20,
    zIndex: 10,
  }}
>
          <div
  style={{
    width: 62,
    height: 62,
    borderRadius: 22,
    background:
      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    display: "flex", // pwede nang flex, hindi na inline-flex
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14, // para sakto sa title
    boxShadow: "0 0 35px rgba(59,130,246,0.25)",
    animation: "phoneFloat 8s ease-in-out infinite",
  }}
>
            <span style={{ fontSize: 28 }}>📱</span>
          </div>

         <h1
  style={{
    display: "inline-block", // FIX
    marginTop: 14,
    marginBottom: 8,
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.2,
    background:
      "linear-gradient(135deg, #60a5fa 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }}
>
  QR Code Scanner
</h1>

        <div
  style={{
    textAlign: "center",
  }}
>
  <p
    style={{
      color: "#94a3b8",
      fontSize: ".9rem",
      marginBottom: "6px",
    }}
  >
    Present this QR code at the library entrance
  </p>

  <p
    style={{
      color: "#60a5fa",
      fontSize: ".75rem",
      fontWeight: 600,
      letterSpacing: "2px",
      margin: 0,
    }}
  >
    🔹 REQUIRED 🔹
  </p>
</div>
</div>

        <p
          style={{
            marginBottom: 22,
            color: "#94a3b8",
            letterSpacing: 1.5,
            zIndex: 10,
          }}
        >
          Your Registered QR Code
        </p>

        {/* QR Container */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            zIndex: 10,
            padding: 28,
            borderRadius: 28,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255,255,255,0.08)",
            transition: "0.4s ease",
            boxShadow: isHovered
              ? "0 0 60px rgba(59,130,246,0.2)"
              : "0 0 30px rgba(0,0,0,0.3)",
          }}
        >
          <QRCodeSVG
            value={studentId}
            size={260}
            level="H"
            bgColor="#1e293b"
            fgColor="#ffffff"
          />
        </div>

        {/* Student ID */}
        <div
          style={{
            marginTop: 30,
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              color: "#60a5fa",
              fontSize: ".75rem",
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            STUDENT ID
          </div>

          <div
            onClick={copyToClipboard}
            style={{
              cursor: "pointer",
              padding: "14px 36px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "inline-block",
              position: "relative",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#60a5fa",
                fontFamily: "monospace",
                fontSize: "2rem",
                letterSpacing: 3,
              }}
            >
              {studentId}
            </h2>

            {showTooltip && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: -38,
                  transform: "translateX(-50%)",
                  background: "#10b981",
                  color: "white",
                  fontSize: 11,
                  padding: "4px 12px",
                  borderRadius: 20,
                }}
              >
                ✓ Copied!
              </div>
            )}
          </div>

          <p
            style={{
              marginTop: 18,
              color: "#64748b",
              fontSize: ".75rem",
            }}
          >
            🖱️ Click the ID to copy 📋
          </p>
        </div>

        {/* Footer instruction */}
        <div
          style={{
            marginTop: 28,
            padding: "12px 22px",
            borderRadius: 40,
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.12)",
            fontSize: ".75rem",
            color: "#94a3b8",
            zIndex: 10,
          }}
        >
          📌 Present this QR code to the Scanner for scanning ✅
        </div>
      </div>

      <style>{`
    @keyframes boxFloat {
  0% {
    transform: translate(0px, 0px);
  }

  25% {
    transform: translate(18px, -14px);
  }

  50% {
    transform: translate(25px, 16px);
  }

  75% {
    transform: translate(-18px, 14px);
  }

  100% {
    transform: translate(0px, 0px);
  }
}
  
  @keyframes phoneFloat {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}
      `}</style>
    </div>
  );
}