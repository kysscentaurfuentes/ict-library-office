// frontend/src/auth/TwoFactor.tsx
import { useEffect, useState, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { useDynamicBackground } from "../hooks/useDynamicBackground";
import "../App.css";
import {
  gql,
  useMutation,
  useApolloClient,
} from "@apollo/client";

const VERIFY_2FA = gql`
  mutation VerifyTwoFactor($identifier: String!, $code: String!) {
    verifyTwoFactor(identifier: $identifier, code: $code) {
      token
      user {
        id
        first_name
        last_name
        role
        StudentId
        profile_picture
        vibration_enabled
        dark_mode
      }
    }
  }
`;

const CHECK_OTP_STATUS = gql`
  query CheckOtpStatus($identifier: String!) {
    checkOtpStatus(identifier: $identifier) {
      failedAttempts
      lockedUntil
    }
  }
`;

type VerifyResponse = {
  verifyTwoFactor: {
    token: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      role: string;
      StudentId: string;
      profile_picture?: string;
      vibration_enabled?: boolean;
      dark_mode?: boolean;
    };
  };
};

type VerifyVars = {
  identifier: string;
  code: string;
};

export default function TwoFactor() {
  const navigate = useNavigate();
  const backgroundImage = useDynamicBackground();

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
const [activeIndex, setActiveIndex] = useState(0);

const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [backendRemainingSeconds, setBackendRemainingSeconds] = useState(0);
  const [pendingEmail, setPendingEmail] = useState("");
  const [shake, setShake] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [checkingLock, setCheckingLock] = useState(true);
  const clearOtpInputs = () => {
  setCode(Array(6).fill(""));
  setActiveIndex(0);

  setTimeout(() => {
    inputRefs.current[0]?.focus();
  }, 50);
};

const getAttemptColor = (attempts: number) => {
  if (attempts === 0) return "#22c55e"; // GREEN (start state)
  if (attempts === 1) return "#3b82f6"; // BLUE
  if (attempts === 2) return "#facc15"; // YELLOW
  if (attempts === 3) return "#f97316"; // ORANGE
  if (attempts === 4) return "#ef4444"; // RED
  return "#a855f7"; // PURPLE (5+ critical)
};

const formatCooldown = (
  totalSeconds: number
) => {
  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(
      `${hours} hour${hours > 1 ? "s" : ""}`
    );
  }

  if (minutes > 0 || hours > 0) {
    parts.push(
      `${minutes} minute${minutes > 1 ? "s" : ""}`
    );
  }

  parts.push(
    `${seconds} second${seconds > 1 ? "s" : ""}`
  );

  return parts.join(", ");
};

  const [verifyTwoFactor] =
    useMutation<VerifyResponse, VerifyVars>(VERIFY_2FA);

const client = useApolloClient();

  const handleChange = (value: string, index: number) => {
  if (!/^[0-9]?$/.test(value)) return;

  const newCode = [...code];
  newCode[index] = value;
  setCode(newCode);

  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
    setActiveIndex(index + 1);
  }
};

const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  if (e.key === "Backspace") {
    if (!code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  }
};

const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault();

  const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);

  const newCode = [...code];

  for (let i = 0; i < paste.length; i++) {
    newCode[i] = paste[i];
  }

  setCode(newCode);

  const nextIndex = Math.min(paste.length, 5);
  inputRefs.current[nextIndex]?.focus();
  setActiveIndex(nextIndex);
};

const ran = useRef(false);
// 1
useEffect(() => {
  if (ran.current) return;
  ran.current = true;

  const savedEmail = localStorage.getItem("pendingEmail") || "";
  setPendingEmail(savedEmail);
}, []);

useEffect(() => {
  let mounted = true;

 const syncOtp = async () => {
  const identifier =
    localStorage.getItem("pendingIdentifier");

  console.log("========== OTP SYNC START ==========");
  console.log("LOCAL pendingIdentifier:", identifier);
  console.log("LOCAL pendingEmail:", pendingEmail);

  if (!identifier) {
    console.log("NO IDENTIFIER FOUND");
    
    if (mounted) {
      setOtpAttempts(0);
      setIsLocked(false);
      setCooldown(0);
      setLockMessage("");
      setCheckingLock(false);
    }

    return;
  }

  try {
    setCheckingLock(true);

    const { data } = await client.query({
      query: CHECK_OTP_STATUS,
      variables: { identifier },
      fetchPolicy: "network-only",
    });

    console.log("RAW BACKEND OTP DATA:", data);

    const otp =
      data?.checkOtpStatus;

    const attempts =
      otp?.failedAttempts ?? 0;

    const lockUntilRaw =
      otp?.lockedUntil || null;

    console.log("DB failedAttempts:", attempts);
    console.log("DB lockedUntil raw:", lockUntilRaw);

const lockUntil =
  lockUntilRaw != null
    ? Number(lockUntilRaw)
    : null; 

    console.log("PARSED lockUntil:", lockUntil);
    console.log("CURRENT Date.now():", Date.now());

    const remainingSeconds =
      lockUntil
        ? Math.max(
            0,
            Math.floor(
              (lockUntil - Date.now()) / 1000
            )
          )
        : 0;

    console.log("CALCULATED remainingSeconds:", remainingSeconds);

    const stillLocked =
      attempts >= 5 &&
      remainingSeconds > 0;

    console.log("FINAL stillLocked:", stillLocked);

    setOtpAttempts(Math.min(attempts, 5));

    if (stillLocked) {
      console.log("UI LOCK ACTIVATED");

      setIsLocked(true);
      setCooldown(remainingSeconds);
      setBackendRemainingSeconds(remainingSeconds);
      setLockMessage(
        "Too many attempts. Try again later."
      );

      setShowSupportModal(true);

      clearOtpInputs();

    } else {
      console.log("UI LOCK REMOVED");

      setIsLocked(false);
      setCooldown(0);
      setBackendRemainingSeconds(0);
      setLockMessage("");
    }

  } catch (err) {
    console.log("OTP SYNC ERROR:", err);
  } finally {
    console.log("========== OTP SYNC END ==========");

    if (mounted) {
      setCheckingLock(false);
    }
  }
};

  syncOtp();

  return () => {
    mounted = false;
  };

}, [
  client,
  pendingEmail // important pag ibang user
]);

  // 4
 useEffect(() => {
  if (!isLocked || backendRemainingSeconds <= 0) return;

  let timeLeft = backendRemainingSeconds;
  setCooldown(timeLeft);

  const interval = setInterval(() => {
    timeLeft -= 1;
    setCooldown(timeLeft);

 if (timeLeft <= 0) {
  clearInterval(interval);

  setIsLocked(false);
  setLockMessage("");
  setBackendRemainingSeconds(0);

  // re-sync from backend instead of forcing 0
  const identifier = localStorage.getItem("pendingIdentifier");

  if (identifier) {
    client.query({
      query: CHECK_OTP_STATUS,
      variables: { identifier },
      fetchPolicy: "network-only",
    }).then(({ data }) => {
      const attempts = data?.checkOtpStatus?.failedAttempts ?? 0;
      setOtpAttempts(Math.min(attempts, 5));
    });
  }
}
  }, 1000);

  return () => clearInterval(interval);
}, [isLocked, backendRemainingSeconds]);

  // verify handler
  const handleVerify = async () => {
    // 1st loading
if (loading || isLocked || verifyingRef.current) return;
if (code.some((c) => c === "")) return;

verifyingRef.current = true;
    
  const identifier = localStorage.getItem("pendingIdentifier");

  if (!identifier) {
  verifyingRef.current = false;
  setError("Missing login session. Please login again.");
  return;
}

  try {
    setLoading(true);

    const res = await verifyTwoFactor({
      variables: {
        identifier,
        code: code.join(""),
      },
    });

    const result = res.data?.verifyTwoFactor;

    if (!result?.token) {
      setError("Invalid or expired code");
      setLoading(false);
      return;
    }

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    localStorage.removeItem("pendingIdentifier");

    setOtpAttempts(0);
    setLoading(false);
    verifyingRef.current = false;
    window.location.hash = "#/homescreen";
  } catch (err: any) {
  console.log("GRAPHQL ERROR FULL:", err);

  const gqlError =
  err?.graphQLErrors?.[0] ||
  err?.networkError?.result?.errors?.[0];

const ext = gqlError?.extensions;

  setError(gqlError?.message || err?.message || "Error");

  setLoading(false);
  verifyingRef.current = false; // 🔥 IMPORTANT RESET

  if (ext?.code === "OTP_LOCKED") {
    const seconds = ext.remainingSeconds || 0;

    setIsLocked(true);
    setOtpAttempts(5);
    setBackendRemainingSeconds(seconds);
    setCooldown(seconds);
    setLockMessage("Too many attempts. Try again later.");
    setShowSupportModal(true);
    return;
  }

  if (ext?.code === "INVALID CODE") {
  console.log("INVALID OTP DETECTED");

  // SHAKE
  setShake(true);

  setTimeout(() => {
    setShake(false);
  }, 400);

  // CLEAR OTP BOXES
  clearOtpInputs();

  const identifier =
    localStorage.getItem("pendingIdentifier");

  if (!identifier) return;

const { data } = await client.query({
  query: CHECK_OTP_STATUS,
  variables: { identifier },
  fetchPolicy: "network-only",
});

  const dbAttempts =
  data?.checkOtpStatus?.failedAttempts ?? 0;

  setOtpAttempts(Math.min(dbAttempts, 5));

  return;
}
}
}

// 5
useEffect(() => {
  if (loading || isLocked) return;
  if (code.some((c) => c === "")) return;

  handleVerify();
}, [code]);

if (checkingLock) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        color: "white",
        fontSize: "1rem",

        backgroundImage: `linear-gradient(
          rgba(0,0,0,0.65),
          rgba(0,0,0,0.65)
        ), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      Checking session...
    </div>
  );
}

   return (
  <div
  style={{
    minHeight: "100vh",
    width: "100%",
    backgroundImage: `linear-gradient(
      rgba(0,0,0,0.65),
      rgba(0,0,0,0.65)
    ), url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: '"Poppins", "Segoe UI", sans-serif',
  }}
>
    <div
      style={{
        width: "100%",
        maxWidth: "520px",
        margin: "0 auto",
        color: "white",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "34px",
        }}
      >
       <h2
  style={{
    color: "#ffffff",
    fontSize: "2rem",
    fontWeight: 600,
    letterSpacing: "10px",
    margin: "0 0 18px 0",
    textTransform: "uppercase",
  }}
>
  ICT LIBRARY OFFICE
</h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "2px",
              background: "#8b5cf6",
              borderRadius: "20px",
            }}
          />

          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "1.8rem",
              fontWeight: 600,
              letterSpacing: "3px",
            }}
          >
            TWO-STEP FACTOR VERIFICATION
          </h1>

          <div
            style={{
              width: "60px",
              height: "2px",
              background: "#8b5cf6",
              borderRadius: "20px",
            }}
          />
        </div>
      </div>

      {/* GLASS CARD */}
      <div
      className={shake ? "shake" : ""}
        style={{
          backdropFilter: "blur(18px)",
          background: "rgba(255,255,255,0.11)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "18px",
          padding: "38px 36px 30px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.32), 0 0 12px rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {isLocked && (
          <>
            <p
              style={{
                color: "orange",
                textAlign: "center",
                margin: 0,
              }}
            >
              {lockMessage}
            </p>

            <button
              disabled={cooldown > 0}
              style={{
                height: "50px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {cooldown > 0
                ? `Try again in ${formatCooldown(cooldown)}`
                : "Try Again"}
            </button>
          </>
        )}

        <button
  onClick={() => navigate("/signin")}
  style={{
    width: "fit-content",
    border: "none",
    background: "transparent",
    color: "#c4b5fd",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
    alignSelf: "flex-start",
  }}
>
  ← Back to Sign In
</button>

        {/* OTP BOXES */}
<div
  style={{
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  }}
>
  {code.map((digit, index) => (
    <input
      key={index}
      ref={(el) => {
        inputRefs.current[index] = el;
      }}
      value={digit}
      onChange={(e) => handleChange(e.target.value, index)}
      onKeyDown={(e) => handleKeyDown(e, index)}
      onPaste={handlePaste}
      maxLength={1}
      disabled={
  isLocked ||
  loading ||
  checkingLock
}
      inputMode="numeric"
      style={{
        width: "48px",
        height: "52px",
        textAlign: "center",
        fontSize: "1.4rem",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.08)",
        color: "#fff",
        outline: "none",
      }}
    />
  ))}
</div>

{/* Attempts BELOW OTP BOXES */}
<p
  style={{
    textAlign: "center",
    margin: "6px 0 0",
    fontSize: "0.85rem",
    color: getAttemptColor(otpAttempts),
    fontWeight: 600,
  }}
>
  Attempts: {otpAttempts} / 5
</p>

{/* Warning before lock */}
{otpAttempts >= 3 && (
  <p
    style={{
      textAlign: "center",
      margin: "2px 0 6px 0",
      fontSize: "0.78rem",
      color: "#facc15",
      fontWeight: 600,
      lineHeight: 1.4,
    }}
  >
    Warning: Reaching 5 failed attempts will lock OTP verification
    for 8 hours.
  </p>
)}

<button
  onClick={handleVerify}
  disabled={
    loading ||
    isLocked ||
    checkingLock
  }
  style={{
    width: "100%",
    height: "52px",
    border: "none",
    borderRadius: "7px",
    background:
      "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  {isLocked
    ? "Locked"
    : loading
    ? "Verifying..."
    : "Verify"}
</button>

<p
  style={{
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
    margin: "2px 0 0 0",
    fontSize: "0.88rem",
    lineHeight: 1.6,
  }}
>
  Check your CARSU email account for your OTP code.
  Enter the 6-digit code sent to your
  <br />
  <strong>{pendingEmail || "@carsu.edu.ph email"}</strong>

  
</p>

        {error && (
          <p
            style={{
              color: "#fecaca",
              textAlign: "center",
              margin: 0,
              fontSize: "0.9rem",
            }}
          >
            {error}
          </p>
        )}
        
      </div>
    </div>
    {showSupportModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: "90%",
        maxWidth: "380px",
        background: "#1e1b4b",
        borderRadius: "14px",
        padding: "28px",
        textAlign: "center",
        color: "#fff",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "12px",
        }}
      >
        Need Help?
      </h3>

      <p
  style={{
    opacity: 0.8,
    marginBottom: "20px",
    lineHeight: 1.6,
  }}
>
  Contact support for help.
  <br />
  <strong>
    kysscentaur.fuentes@carsu.edu.ph
  </strong>
</p>

      <button
        onClick={() =>
          setShowSupportModal(false)
        }
        style={{
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        ← Back
      </button>
    </div>
  </div>
)}
  </div>
);
}