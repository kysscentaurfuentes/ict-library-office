// display-client/src/ScanDisplay.tsx
import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import CSULogo from "./images/Caraga_State_University_Logo.png";
import LibraryLogo from "./images/CSU_LIBRARY_LOGO.jpg";
import backgroundImage from "./images/Caraga_State_University_Background.jpg";

// Updated Electron API declaration for the new data flow
declare global {
  interface Window {
    electronAPI?: {
      sendScanData: (data: string) => void;
      onScanResult: (callback: (data: ScanData) => void) => () => void;
    };
  }
}

interface ScanData {
  status: "success" | "fail";
  student_id: string;
  name?: string;
  course?: string;
  time?: string;
  date?: string;
  message?: string;
}

const ScanDisplay: React.FC = () => {
  const [data, setData] = useState<ScanData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const displayTimer = useRef<NodeJS.Timeout | null>(null);
  const scannerBufferRef = useRef<string>("");

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onScanResult(
        (result: ScanData) => {
          console.log("Received scan result from main process:", result);

          // Create a copy of the result object to modify it
          const processedResult = { ...result };

          setData(processedResult);
          setIsLoading(false);

          if (processedResult.student_id) {
            const formattedId = formatStudentId(processedResult.student_id);
            setInputValue(formattedId);
            console.log(`Input value set to formatted ID: "${formattedId}"`);
          }

          if (displayTimer.current) {
            clearTimeout(displayTimer.current);
          }

          displayTimer.current = setTimeout(() => {
            setData(null);
            setInputValue("");
            console.log("Result display and input cleared after 5 seconds.");
          }, 4000);

          if (inputRef.current) {
            inputRef.current.focus();
            console.log("Input field refocused.");
          }
        }
      );
      return () => unsubscribe();
    }
  }, []);

  const processScan = (value: string) => {
    const processedValue = value.replace(/[^0-9]/g, "").trim();

    if (processedValue.length === 8 && window.electronAPI) {
      console.log("Submitting scan data:", processedValue);
      setIsLoading(true);
      setData(null);

      window.electronAPI.sendScanData(processedValue);
    } else {
      console.log("Invalid ID length or electronAPI not available.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/[^0-9]/g, "");

    let formattedValue = numericValue;
    if (numericValue.length > 8) {
      formattedValue = numericValue.substring(0, 8);
    }

    let displayValue = formattedValue;
    if (formattedValue.length > 3) {
      displayValue = formattedValue.slice(0, 3) + "-" + formattedValue.slice(3);
    }

    setInputValue(displayValue);

    // ✅ AUTO PROCESS DIN PAG MANUAL TYPE (OPTIONAL)
    if (formattedValue.length === 8 && !isLoading) {
      processScan(formattedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(`Key down event: key = "${e.key}", code = "${e.code}"`);

    const isScannerInput =
      e.key !== "Enter" && e.key.length === 1 && /[0-9]/.test(e.key);

    if (isScannerInput) {
      scannerBufferRef.current += e.key;

      // para hindi lumabas sa input field bawat digit
      e.preventDefault();

      console.log(
        `Appending to buffer: "${e.key}". Current buffer: "${scannerBufferRef.current}"`
      );

      // ✅ AUTO PROCESS (kahit walang Enter)
      if (scannerBufferRef.current.length === 8) {
        console.log(
          "Auto-processing (scanner, no Enter):",
          scannerBufferRef.current
        );

        processScan(scannerBufferRef.current);

        // reset buffer after send
        scannerBufferRef.current = "";
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      console.log("Enter key pressed. Processing input.");

      const valueToProcess =
        scannerBufferRef.current || inputValue.replace(/[^0-9]/g, "");

      if (valueToProcess.length === 8) {
        processScan(valueToProcess);
      } else {
        console.log("Input length is not 8 digits. Not processing.");
      }

      scannerBufferRef.current = "";
    } else if (e.key === "Backspace" || e.key === "Delete") {
      scannerBufferRef.current = "";
    }
  };

  const formatStudentId = (id: string): string => {
    if (id && id.length === 8 && /^\d+$/.test(id)) {
      return id.substring(0, 3) + "-" + id.substring(3);
    }
    return id;
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#fff",
        fontFamily: "Arial",
        padding: "20px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Helmet>
        <title>CSU ICT Library Attendance</title>
        <meta
          name="description"
          content="Attendance logging via QR scanning at CSU Library"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={CSULogo} />
      </Helmet>
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}
      </style>
      <img
        src={LibraryLogo}
        alt="Library Logo"
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 100,
          height: "auto",
          zIndex: 10,
        }}
      />
      <img
        src={CSULogo}
        alt="CSU Logo"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 100,
          height: "auto",
          zIndex: 10,
        }}
      />
      <div
        style={{
          textAlign: "center",
          marginTop: 80,
          position: "relative",
          zIndex: 10,
        }}
      >
        <h1 style={{ fontSize: "2.5em", marginBottom: 10 }}>
          Caraga State University
        </h1>
        <h2 style={{ fontSize: "1.5em", fontWeight: "normal" }}>
          Ampayon, Butuan City
        </h2>
        <h3 style={{ fontSize: "1.8em", fontWeight: "normal" }}>
          Library ICT Office Occupancy And Attendance Monitoring System
        </h3>
        <p style={{ marginTop: 30, fontSize: "1.2em" }}>
          Please scan your QR code below
        </p>
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 50,
          position: "relative",
          zIndex: 10,
        }}
      >
        <h3 style={{ fontSize: "1.5em", marginBottom: "20px" }}>
          Scan & Log Attendance
        </h3>
        <p style={{ color: "#ccc", marginBottom: "15px" }}>
          Point your QR Code to the scanner or type your ID.
        </p>
        <div style={{ position: "relative", display: "inline-block" }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{
              padding: "15px",
              fontSize: "1.2em",
              borderRadius: "10px",
              border: "2px solid #0f5c9e",
              width: "300px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
              color: "#333",
            }}
            placeholder="ex. 211-01850"
            autoFocus
          />
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 50,
          position: "relative",
          zIndex: 10,
        }}
      >
        {isLoading && !data && (
          <p style={{ fontSize: "1.5em" }}>Processing scan...</p>
        )}
        {!isLoading && !data && (
          <>
            <p style={{ fontSize: "1.5em" }}>
              Waiting for scan
              <span className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
            {/* 3D ANIMATION: Independent Torus + Vehicle Coil Springs */}
            <div className="torus-container">
              <div className="scene3d">
                {/* TORUS: Thick segments - continuous round-robin flow */}
                <div className="torus-core">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={`torus-${i}`}
                      className="torus-segment"
                      style={{ "--i": i } as React.CSSProperties}
                    />
                  ))}
                </div>

                {/* COIL SPRINGS: Realistic vehicle suspension springs */}
                <div className="springs-system">
                  <div className="coil-spring spring-1"></div>
                  <div className="coil-spring spring-2"></div>
                  <div className="coil-spring spring-3"></div>
                  <div className="coil-spring spring-4"></div>
                  <div className="coil-spring spring-5"></div>
                </div>
              </div>
            </div>
          </>
        )}
        {data && (
          <div
            style={{
              background: data.status === "success" ? "#198754" : "#dc3545",
              padding: 20,
              borderRadius: 15,
              display: "inline-block",
              animation: "fadeIn 0.5s",
              backdropFilter: "blur(4px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            }}
          >
            {data.status === "success" ? (
              <>
                <h2>✅ Scan Successful</h2>
                <p>
                  <strong>Name:</strong> {data.name}
                </p>
                <p>
                  <strong>ID:</strong> {formatStudentId(data.student_id)}
                </p>
                <p>
                  <strong>Course:</strong> {data.course}
                </p>
                <p>
                  <strong>Time-In:</strong> {data.time}
                </p>
                <p>
                  <strong>Date:</strong> {data.date}
                </p>
              </>
            ) : (
              <>
                <h2>❌ Scan Failed</h2>
                <p>{data.message}</p>
                <p>
                  <strong>ID:</strong> {formatStudentId(data.student_id)}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <style>
        {`
      .spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 4px solid #fff;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      .loading-dots span {
        animation: blink 1.4s infinite;
        animation-fill-mode: both;
        font-size: 1.5em;
        font-weight: bold;
        display: inline-block;
      }
      .loading-dots span:nth-child(1) { animation-delay: 0.3s; }
      .loading-dots span:nth-child(2) { animation-delay: 0.6s; }
      .loading-dots span:nth-child(3) { animation-delay: 0.9s; }
      @keyframes blink {
        0% { opacity: 0; }
        20% { opacity: 1; transform: translateY(0) scale(1); }
        80% { opacity: 1; transform: translateY(-5px) scale(1.2); }
        100% { opacity: 0; transform: translateY(0) scale(1); }
      }
      
      /* ========== 3D SCENE - ALL WHITE ========== */
      .torus-container {
        position: relative;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 30px;
        margin-bottom: 40px;
        width: 260px;
        height: 260px;
        perspective: 1200px;
        perspective-origin: 50% 50%;
      }
      
      .scene3d {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        animation: subtleCameraBreathing 6s ease-in-out infinite;
      }
      
      @keyframes subtleCameraBreathing {
        0% { transform: rotateX(0deg) rotateY(0deg); }
        50% { transform: rotateX(2deg) rotateY(3deg); }
        100% { transform: rotateX(0deg) rotateY(0deg); }
      }
      
      /* === TORUS - WHITE SEGMENTS CONTINUOUS FLOW (NO PAUSES) === */
      .torus-core {
        position: absolute;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
      }
      
      .torus-segment {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 22px;
        height: 22px;
        margin-left: -11px;
        margin-top: -11px;
        background: radial-gradient(circle, #ffffff, #cccccc);
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(255,255,255,0.8), 0 0 3px rgba(255,255,255,0.5);
        transform-style: preserve-3d;
        animation: swapPositionContinuous 3.5s linear infinite;
        animation-delay: calc(var(--i) * 0.045s);
      }
      
      @keyframes swapPositionContinuous {
        0% {
          transform: rotateY(0deg) translateX(110px) rotateY(0deg);
          opacity: 0.8;
        }
        12.5% {
          transform: rotateY(45deg) translateX(110px) rotateY(-45deg);
          opacity: 0.9;
        }
        25% {
          transform: rotateY(90deg) translateX(110px) rotateY(-90deg);
          opacity: 1;
        }
        37.5% {
          transform: rotateY(135deg) translateX(110px) rotateY(-135deg);
          opacity: 0.9;
        }
        50% {
          transform: rotateY(180deg) translateX(110px) rotateY(-180deg);
          opacity: 0.8;
        }
        62.5% {
          transform: rotateY(225deg) translateX(110px) rotateY(-225deg);
          opacity: 0.9;
        }
        75% {
          transform: rotateY(270deg) translateX(110px) rotateY(-270deg);
          opacity: 1;
        }
        87.5% {
          transform: rotateY(315deg) translateX(110px) rotateY(-315deg);
          opacity: 0.9;
        }
        100% {
          transform: rotateY(360deg) translateX(110px) rotateY(-360deg);
          opacity: 0.8;
        }
      }
      
      .torus-segment::before {
        content: '';
        position: absolute;
        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        filter: blur(3px);
        z-index: -1;
      }
      
      /* === COIL SPRINGS (VEHICLE SUSPENSION STYLE) === */
      .springs-system {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        transform-style: preserve-3d;
        pointer-events: none;
      }
      
      /* Coil spring base style - looks like real vehicle suspension springs */
      .coil-spring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 140px;
        height: 140px;
        margin-left: -70px;
        margin-top: -70px;
        border-radius: 50%;
        box-sizing: border-box;
        transform-style: preserve-3d;
        will-change: transform;
        animation: springCoilBounce 2.5s cubic-bezier(0.25, 0.46, 0.3, 1) infinite alternate;
      }
      
      /* Create helical/coil effect using multiple borders and pseudo-elements */
      .coil-spring::before {
        content: '';
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.4);
        box-sizing: border-box;
      }
      
      .coil-spring::after {
        content: '';
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        bottom: 8px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.3);
        box-sizing: border-box;
      }
      
      /* Individual spring layers with different coil densities */
      .spring-1 {
        animation-delay: 0s;
        border: 2.5px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 0 10px rgba(255,255,255,0.4), inset 0 0 8px rgba(255,255,255,0.2);
      }
      .spring-1::before { border-width: 2px; border-color: rgba(255,255,255,0.6); top: -6px; left: -6px; right: -6px; bottom: -6px; }
      .spring-1::after { border-width: 1.5px; border-color: rgba(255,255,255,0.4); top: 6px; left: 6px; right: 6px; bottom: 6px; }
      
      .spring-2 {
        animation-delay: 0.25s;
        border: 2px solid rgba(255, 255, 255, 0.85);
        box-shadow: 0 0 8px rgba(255,255,255,0.35), inset 0 0 6px rgba(255,255,255,0.15);
      }
      .spring-2::before { border-width: 1.8px; border-color: rgba(255,255,255,0.55); top: -5px; left: -5px; right: -5px; bottom: -5px; }
      .spring-2::after { border-width: 1.3px; border-color: rgba(255,255,255,0.35); top: 5px; left: 5px; right: 5px; bottom: 5px; }
      
      .spring-3 {
        animation-delay: 0.5s;
        border: 1.8px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 7px rgba(255,255,255,0.3), inset 0 0 5px rgba(255,255,255,0.12);
      }
      .spring-3::before { border-width: 1.5px; border-color: rgba(255,255,255,0.5); top: -4px; left: -4px; right: -4px; bottom: -4px; }
      .spring-3::after { border-width: 1.2px; border-color: rgba(255,255,255,0.3); top: 4px; left: 4px; right: 4px; bottom: 4px; }
      
      .spring-4 {
        animation-delay: 0.75s;
        border: 1.5px solid rgba(255, 255, 255, 0.75);
        box-shadow: 0 0 6px rgba(255,255,255,0.25), inset 0 0 4px rgba(255,255,255,0.1);
      }
      .spring-4::before { border-width: 1.3px; border-color: rgba(255,255,255,0.45); top: -3px; left: -3px; right: -3px; bottom: -3px; }
      .spring-4::after { border-width: 1px; border-color: rgba(255,255,255,0.25); top: 3px; left: 3px; right: 3px; bottom: 3px; }
      
      .spring-5 {
        animation-delay: 1.0s;
        border: 1.2px solid rgba(255, 255, 255, 0.7);
        box-shadow: 0 0 5px rgba(255,255,255,0.2), inset 0 0 3px rgba(255,255,255,0.08);
      }
      .spring-5::before { border-width: 1px; border-color: rgba(255,255,255,0.4); top: -2px; left: -2px; right: -2px; bottom: -2px; }
      .spring-5::after { border-width: 0.8px; border-color: rgba(255,255,255,0.2); top: 2px; left: 2px; right: 2px; bottom: 2px; }
      
      /* Coil spring bounce animation - realistic suspension spring motion */
      @keyframes springCoilBounce {
        0% {
          transform: translateY(-50px) scale(1.12);
          opacity: 0.7;
        }
        30% {
          transform: translateY(-15px) scale(1.02);
          opacity: 0.88;
        }
        50% {
          transform: translateY(10px) scale(0.97);
          opacity: 0.95;
        }
        70% {
          transform: translateY(35px) scale(1.04);
          opacity: 0.88;
        }
        100% {
          transform: translateY(50px) scale(1.12);
          opacity: 0.7;
        }
      }
      
      /* Hover effect - springs glow when hovered */
      .coil-spring:hover {
        border-color: rgba(255, 255, 255, 1);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.3);
      }
      
      /* Ambient glow underneath */
      .torus-container::after {
        content: '';
        position: absolute;
        bottom: -20px;
        left: 10%;
        width: 80%;
        height: 2px;
        background: radial-gradient(ellipse, rgba(255,255,255,0.2), transparent);
        filter: blur(3px);
        border-radius: 50%;
        pointer-events: none;
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .torus-container {
          width: 220px;
          height: 220px;
        }
        .torus-segment {
          width: 18px;
          height: 18px;
          margin-left: -9px;
          margin-top: -9px;
        }
        @keyframes swapPositionContinuous {
          0% { transform: rotateY(0deg) translateX(90px) rotateY(0deg); }
          25% { transform: rotateY(90deg) translateX(90px) rotateY(-90deg); }
          50% { transform: rotateY(180deg) translateX(90px) rotateY(-180deg); }
          75% { transform: rotateY(270deg) translateX(90px) rotateY(-270deg); }
          100% { transform: rotateY(360deg) translateX(90px) rotateY(-360deg); }
        }
        .coil-spring {
          width: 120px;
          height: 120px;
          margin-left: -60px;
          margin-top: -60px;
        }
        @keyframes springCoilBounce {
          0% { transform: translateY(-40px) scale(1.1); }
          30% { transform: translateY(-12px) scale(1.02); }
          50% { transform: translateY(8px) scale(0.97); }
          70% { transform: translateY(28px) scale(1.04); }
          100% { transform: translateY(40px) scale(1.1); }
        }
      }
      
      /* Ensure text and UI stay above 3D canvas */
      div[style*="zIndex: 10"] {
        text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
      }
    `}
      </style>
    </div>
  );
};

export default ScanDisplay;
