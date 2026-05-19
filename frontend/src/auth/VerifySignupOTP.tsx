import { gql } from "@apollo/client/core";
import { useMutation } from "@apollo/client/react";
import {
useEffect,
useRef,
useState
} from "react";
import { useDynamicBackground } from "../hooks/useDynamicBackground";

const VERIFY_SIGNUP_OTP = gql`
mutation VerifySignupOTP(
  $email: String!
  $code: String!
) {
  verifySignupOTP(
    email: $email
    code: $code
  )
}
`;

const RESEND_SIGNUP_OTP = gql`
mutation ResendSignupOTP(
  $email: String!
) {
  resendSignupOTP(
    email: $email
  )
}
`;

type VerifyResponse = {
  verifySignupOTP: boolean;
};

type VerifyVariables = {
  email: string;
  code: string;
};

export default function VerifySignupOTP() {

  const currentBackground =
    useDynamicBackground();

  const [
    verifySignupOTP,
    { loading }
  ] = useMutation<
    VerifyResponse,
    VerifyVariables
  >(
    VERIFY_SIGNUP_OTP
  );

const [
  resendSignupOTP,
  {
    loading:
      resendLoading
  }
] = useMutation(
  RESEND_SIGNUP_OTP
);

const [otp, setOtp] =
  useState(["","","","","",""]);

const inputRefs =
  useRef<(HTMLInputElement | null)[]>(
    []
  );

const [shake, setShake] =
  useState(false);

  const [error, setError] =
    useState("");

    const [
  lockSecondsLeft,
  setLockSecondsLeft
] = useState(0);

  const [secondsLeft, setSecondsLeft] =
  useState(5 * 60);
  
  const [
  resendSecondsLeft,
  setResendSecondsLeft
] = useState(2 * 60);

  const email =
    localStorage.getItem(
      "pendingSignupEmail"
    ) || "";

useEffect(() => {
  const interval =
    setInterval(() => {

      setSecondsLeft(prev => {

        if (prev <= 1) {

          clearInterval(interval);

          return 0;
        }

        return prev - 1;
      });

    }, 1000);

  return () =>
    clearInterval(interval);

}, []);

    useEffect(() => {

  const interval = setInterval(() => {

    setResendSecondsLeft(prev => {

      if (prev <= 0) {
        return 0;
      }

      return prev - 1;
    });

  }, 1000);

  return () => clearInterval(interval);

}, []);
useEffect(() => {

  if (lockSecondsLeft <= 0) {
    return;
  }

  const interval =
    setInterval(() => {

      setLockSecondsLeft(
        prev => {

          if (prev <= 1) {

            clearInterval(
              interval
            );

            return 0;
          }

          return prev - 1;
        }
      );

    }, 1000);

  return () =>
    clearInterval(interval);

}, [lockSecondsLeft]);

const handleResendOTP =
  async () => {

  if (
    resendSecondsLeft > 0 ||
    resendLoading
  ) {
    return;
  }

  try {

    setError("");
    setShake(false);
    await resendSignupOTP({
      variables: { email }
    });

    setSecondsLeft(
      5 * 60
    );

    setResendSecondsLeft(
      2 * 60
    );
    setLockSecondsLeft(0);

    setOtp([
      "","","","","",""
    ]);

    inputRefs.current[0]?.focus();

  } catch (err) {

    console.error(err);

    setError(
      "Unable to resend OTP right now. Please try again."
    );
  }
};

const handleChange = (
  value: string,
  index: number
) => {

  const cleaned =
    value.replace(/\D/g, "");

  if (!cleaned) return;

  const newOtp = [...otp];

  newOtp[index] =
    cleaned[0];
    // 1
  setOtp(newOtp);

  const joinedOtp =
  newOtp.join("");

if (
  joinedOtp.length === 6 &&
  !newOtp.includes("")
) {

  setTimeout(() => {
    handleVerify();
  }, 120);
}

  if (
    cleaned &&
    index < 5
  ) {
    inputRefs.current[
      index + 1
    ]?.focus();
  }
};

const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  index: number
) => {

  if (
    e.key === "Backspace"
  ) {

    const newOtp =
      [...otp];

    if (newOtp[index]) {

      newOtp[index] = "";
        // 2
      setOtp(newOtp);

    } else if (index > 0) {

      inputRefs.current[
        index - 1
      ]?.focus();
    }
  }
};

const handlePaste = (
  e: React.ClipboardEvent<HTMLInputElement>
) => {

  e.preventDefault();

  const pasted =
    e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

  if (!pasted) return;

  const newOtp =
    pasted
      .split("")
      .concat(
        Array(6).fill("")
      )
      .slice(0, 6);
  // 3
  setOtp(newOtp);

  const lastIndex =
    Math.min(
      pasted.length - 1,
      5
    );

  inputRefs.current[
    lastIndex
  ]?.focus();
};

  const handleVerify = async () => {

    try {

      setError("");

      await verifySignupOTP({
        variables: {
          email,
          code: otp.join("")
        }
      });

      localStorage.removeItem(
        "pendingSignupEmail"
      );

      alert(
        "Account created successfully. Please wait for Admin approval."
      );

      window.location.hash =
        "#/signin";

    } catch (err: any) {

      console.error(err);

let message =
  "Invalid or expired OTP code.";

if (
  err?.graphQLErrors?.[0]
    ?.extensions?.code ===
  "SIGNUP_OTP_LOCKED"
) {

  const remainingSeconds =
    err?.graphQLErrors?.[0]
      ?.extensions
      ?.remainingSeconds || 0;

  setLockSecondsLeft(
    remainingSeconds
  );

  message =
    "Too many incorrect OTP attempts.";
}

      setError(message);

      setOtp([
  "","","","","",""
]);

setShake(true);

setTimeout(() => {
  setShake(false);
}, 500);

inputRefs.current[0]?.focus();
    }
  };
return (
<>
  <style>
    {`
      @keyframes shake {

        0% {
          transform: translateX(0);
        }

        20% {
          transform: translateX(-10px);
        }

        40% {
          transform: translateX(10px);
        }

        60% {
          transform: translateX(-8px);
        }

        80% {
          transform: translateX(8px);
        }

        100% {
          transform: translateX(0);
        }
      }
    `}
  </style>

  <div
    style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    }}
  >

    {/* BACKGROUND */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          currentBackground
            ? `url(${currentBackground})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />

    {/* OVERLAY */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "rgba(0,0,0,0.65)",
      }}
    />

    {/* CARD */}
    <div
      style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "460px",
        padding: "40px",
        borderRadius: "18px",
        backdropFilter: "blur(18px)",
        background:
          "rgba(255,255,255,0.08)",
        border:
          "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >

      <h1
        style={{
          color: "white",
          textAlign: "center",
          margin: 0,
          letterSpacing: "2px",
        }}
      >
        VERIFY SIGNUP OTP
      </h1>

      <p
        style={{
          color:
            "rgba(255,255,255,0.75)",
          textAlign: "center",
          marginTop: "-6px",
          fontSize: "0.95rem",
        }}
      >
        Enter the 6-digit code sent to your CARSU email.
      </p>

      <p
        style={{
          color: "white",
          textAlign: "center",
          margin: 0,
          fontSize: "0.95rem",
        }}
      >
        OTP sent to:
      </p>

      <p
        style={{
          color: "#c4b5fd",
          textAlign: "center",
          marginTop: "-10px",
          fontSize: "0.95rem",
          wordBreak: "break-word",
        }}
      >
        {email}
      </p>

      <p
        style={{
          color:
            secondsLeft <= 60
              ? "#fca5a5"
              : "#86efac",

          textAlign: "center",
          marginTop: "-5px",
          fontSize: "0.92rem",
        }}
      >
        OTP expires in{" "}

        {Math.floor(secondsLeft / 60)}
        :
        {String(secondsLeft % 60)
          .padStart(2, "0")}
      </p>

      <button
  onClick={handleResendOTP}

  disabled={
    resendLoading ||
    resendSecondsLeft > 0
  }

  style={{
    background: "none",
    border: "none",

    color:
      resendSecondsLeft > 0
        ? "rgba(255,255,255,0.45)"
        : "#c4b5fd",

    cursor:
      resendSecondsLeft > 0
        ? "not-allowed"
        : "pointer",

    fontSize: "0.92rem",
    marginTop: "-10px",

    transition:
      "all 0.18s ease",

    textDecoration:
      resendSecondsLeft <= 0
        ? "underline"
        : "none",
  }}
  

  onMouseEnter={(e) => {

    if (
      resendSecondsLeft <= 0
    ) {

      e.currentTarget.style.color =
        "#ddd6fe";
    }
  }}

  onMouseLeave={(e) => {

    if (
      resendSecondsLeft <= 0
    ) {

      e.currentTarget.style.color =
        "#c4b5fd";
    }
  }}
>
  {
    resendLoading
      ? "Sending..."

      : resendSecondsLeft > 0

      ? `Resend OTP in ${Math.floor(
          resendSecondsLeft / 60
        )}:${String(
          resendSecondsLeft % 60
        ).padStart(2, "0")}`

      : "Didn't receive the code? Resend OTP"
  }
</button>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",

          animation:
            shake
              ? "shake 0.35s ease"
              : "none",
        }}
      >
        {
          otp.map(
            (
              digit,
              index
            ) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                disabled={
  lockSecondsLeft > 0 ||
  resendLoading
}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(
                    e.target.value,
                    index
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(
                    e,
                    index
                  )
                }
                onPaste={handlePaste}
                style={{
                  width: "52px",
                  height: "58px",
                  borderRadius: "10px",
                  border:
                    "1px solid rgba(255,255,255,0.15)",
                  background:
                    "rgba(255,255,255,0.08)",
                  color: "white",
                  fontSize: "1.4rem",
                  textAlign: "center",
                  outline: "none",
                }}
              />
            )
          )
        }
      </div>

        {
  lockSecondsLeft > 0 && (

    <div
      style={{
        textAlign: "center",
        marginTop: "-5px",
      }}
    >

      <p
        style={{
          color: "#fca5a5",
          margin: 0,
          fontSize: "0.92rem",
          fontWeight: 600,
        }}
      >
        OTP temporarily locked
      </p>

      <p
        style={{
          color:
            "rgba(255,255,255,0.75)",
          marginTop: "5px",
          fontSize: "0.88rem",
        }}
      >
        Try again in{" "}

        {Math.floor(
          lockSecondsLeft / 60
        )}
        :
        {String(
          lockSecondsLeft % 60
        ).padStart(2, "0")}
      </p>

    </div>
  )
}
      {error && (
        <p
          style={{
            color: "#fecaca",
            textAlign: "center",
            margin: 0,
            fontSize: "0.92rem",
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleVerify}
        disabled={
  loading ||
  resendLoading ||
  lockSecondsLeft > 0 ||
  otp.some(
    digit => !digit
  )
}
        style={{
          height: "52px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          background:
            "linear-gradient(90deg,#6366f1,#8b5cf6)",
          color: "white",
          fontWeight: 700,
          fontSize: "1rem",
          opacity:
  loading ||
  resendLoading ||
  lockSecondsLeft > 0 ||
  otp.some(
    digit => !digit
  )
    ? 0.6
    : 1,
        }}
      >
        {
          loading
          ? "Verifying..."
          : "Verify OTP"
        }
      </button>

    </div>
  </div>
</>
);
}