import { gql } from "@apollo/client/core";
import {
  useMutation,
  useApolloClient
} from "@apollo/client/react";
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

const CHECK_SIGNUP_OTP_STATUS = gql`
query CheckSignupOtpStatus(
  $email: String!
) {
  checkSignupOtpStatus(
    email: $email
  ) {
    failedAttempts
    lockedUntil
  }
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

    const client =
  useApolloClient();

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

  const [
  signupAttempts,
  setSignupAttempts
] = useState(0);

const [
  isLocked,
  setIsLocked
] = useState(false);

const [
  checkingLock,
  setCheckingLock
] = useState(true);

  const [error, setError] =
    useState("");

    const [
  lockSecondsLeft,
  setLockSecondsLeft
] = useState(0);

 const [
  secondsLeft,
  setSecondsLeft
] = useState(0);

const [
  resendSecondsLeft,
  setResendSecondsLeft
] = useState(0);

const getAttemptColor = (
  attempts: number
) => {

  if (attempts === 0)
    return "#22c55e";

  if (attempts === 1)
    return "#3b82f6";

  if (attempts === 2)
    return "#facc15";

  if (attempts === 3)
    return "#f97316";

  if (attempts === 4)
    return "#ef4444";

  return "#a855f7";
};

  const email =
    localStorage.getItem(
      "pendingSignupEmail"
    ) || "";

    
useEffect(() => {
console.log(
  "[INIT EFFECT]",
  {
    checkingLock,
    isLocked,
    storedOtpExpiry:
      localStorage.getItem(
        "signupOtpExpiry"
      ),
    storedResendExpiry:
      localStorage.getItem(
        "signupResendExpiry"
      ),
  }
);
  // OTP EXPIRY
  const storedOtpExpiry =
    localStorage.getItem(
      "signupOtpExpiry"
    );

  if (storedOtpExpiry) {

    const remaining =
      Math.floor(
        (
          Number(storedOtpExpiry) -
          Date.now()
        ) / 1000
      );

    setSecondsLeft(
      remaining > 0
        ? remaining
        : 0
    );

  } else if (
  !checkingLock &&
  !isLocked
) {

  const newExpiry =
    Date.now() +
    5 * 60 * 1000;

  localStorage.setItem(
    "signupOtpExpiry",
    String(newExpiry)
  );

  setSecondsLeft(
    5 * 60
  );
}
  // RESEND EXPIRY
  const storedResendExpiry =
    localStorage.getItem(
      "signupResendExpiry"
    );

  if (storedResendExpiry) {

    const remaining =
      Math.floor(
        (
          Number(
            storedResendExpiry
          ) - Date.now()
        ) / 1000
      );

    setResendSecondsLeft(
      remaining > 0
        ? remaining
        : 0
    );

  } else if (
  !checkingLock &&
  !isLocked
) {

  const newExpiry =
    Date.now() +
    2 * 60 * 1000;

    localStorage.setItem(
      "signupResendExpiry",
      String(newExpiry)
    );

    setResendSecondsLeft(
      2 * 60
    );
  }

  

}, [checkingLock, isLocked]);
useEffect(() => {

  const interval =
    setInterval(() => {

      const expiry =
        Number(
          localStorage.getItem(
            "signupOtpExpiry"
          )
        );

      if (!expiry) {
        return;
      }

      const remaining =
        Math.floor(
          (
            expiry -
            Date.now()
          ) / 1000
        );

      setSecondsLeft(
        remaining > 0
          ? remaining
          : 0
      );

    }, 1000);

  return () =>
    clearInterval(interval);

}, []);

  useEffect(() => {

  const interval =
    setInterval(() => {

      const expiry =
        Number(
          localStorage.getItem(
            "signupResendExpiry"
          )
        );

      if (!expiry) {
        return;
      }

      const remaining =
        Math.floor(
          (
            expiry -
            Date.now()
          ) / 1000
        );

      setResendSecondsLeft(
        remaining > 0
          ? remaining
          : 0
      );

    }, 1000);

  return () =>
    clearInterval(interval);

}, []);
useEffect(() => {

  if (lockSecondsLeft <= 0) {

    setIsLocked(false);

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

            setIsLocked(false);

            return 0;
          }

          return prev - 1;
        }
      );

    }, 1000);

  return () =>
    clearInterval(interval);

}, [lockSecondsLeft]);

useEffect(() => {

  const syncSignupOtp =
    async () => {

    try {

      const { data } =
        await client.query({
          query:
            CHECK_SIGNUP_OTP_STATUS,

          variables: {
            email
          },

          fetchPolicy:
            "network-only",
        });

      const otp =
        data?.checkSignupOtpStatus;

      const attempts =
        otp?.failedAttempts || 0;

      setSignupAttempts(
        Math.min(attempts, 5)
      );

      const lockUntil =
  Number(
    otp?.lockedUntil || 0
  );

      const remaining =
        Math.max(
          0,
          Math.floor(
            (
              lockUntil -
              Date.now()
            ) / 1000
          )
        );
console.log(
  "[SYNC OTP STATUS]",
  {
    attempts,
    lockUntil:
      otp?.lockedUntil,
    remaining,
  }
);
      if (
        attempts >= 5 &&
        remaining > 0
      ) {console.log(
  "[LOCK DETECTED]",
  {
    remaining,
  }
);

        setIsLocked(true);

        setLockSecondsLeft(
          remaining
        );

      } else {

        setIsLocked(false);
      }

    } catch (err) {

      console.error(err);

    } finally {

      setCheckingLock(false);
    }
  };

  syncSignupOtp();

}, [client, email]);

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

    const otpExpiry =
  Date.now() +
  5 * 60 * 1000;

localStorage.setItem(
  "signupOtpExpiry",
  String(otpExpiry)
);

setSecondsLeft(
  5 * 60
);

const resendExpiry =
  Date.now() +
  2 * 60 * 1000;

localStorage.setItem(
  "signupResendExpiry",
  String(resendExpiry)
);
console.log(
  "[SIGNUP TIMERS CREATED]",
  {
    otpExpiry,
    resendExpiry,
  }
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
        //2
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

// CLEAR OTP TIMERS
localStorage.removeItem(
  "signupOtpExpiry"
);

localStorage.removeItem(
  "signupResendExpiry"
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
console.log(
  "[LOCK ERROR CAUGHT]",
  {
    remainingSeconds,
  }
);
  setIsLocked(true);

  setSignupAttempts(5);
    setSecondsLeft(0);

setResendSecondsLeft(0);

localStorage.removeItem(
  "signupOtpExpiry"
);

localStorage.removeItem(
  "signupResendExpiry"
);
  setLockSecondsLeft(
    remainingSeconds
  );

  message =
    "Too many incorrect OTP attempts.";
}

if (
  err?.graphQLErrors?.[0]
    ?.extensions?.code ===
  "INVALID_SIGNUP_OTP"
) {

  const attemptsLeft =
    err?.graphQLErrors?.[0]
      ?.extensions
      ?.attemptsLeft ?? 0;

  const usedAttempts =
    5 - attemptsLeft;

  setSignupAttempts(
    Math.min(
      usedAttempts,
      5
    )
  );
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

   {
  !checkingLock &&
  !isLocked &&
  lockSecondsLeft <= 0 && (
    
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
  )
}
{
    !checkingLock &&
  !isLocked &&
  lockSecondsLeft <= 0 && (
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
)
}
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
  checkingLock ||
  isLocked ||
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

      <p
  style={{
    textAlign: "center",
    margin: "6px 0 0",
    fontSize: "0.85rem",
    color:
      getAttemptColor(
        signupAttempts
      ),
    fontWeight: 600,
  }}
>
  Attempts:
  {" "}
  {signupAttempts}
  {" / 5"}
</p>

{
    !checkingLock &&
  signupAttempts >= 3 && (

    <p
      style={{
        textAlign: "center",
        margin:
          "2px 0 6px 0",

        fontSize: "0.78rem",

        color: "#facc15",

        fontWeight: 600,

        lineHeight: 1.4,
      }}
    >
      Warning:
      Reaching 5+ failed attempts
      will lock OTP verification
      for 15 minutes.
    </p>
  )
}

{
  !checkingLock &&
  (
    isLocked ||
    lockSecondsLeft > 0
  ) && (

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
  lockSecondsLeft / 3600
)}{" "}
Hours,{" "}

{Math.floor(
  (lockSecondsLeft % 3600) / 60
)}{" "}
Minutes and{" "}

{lockSecondsLeft % 60}{" "}
Seconds
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

  onMouseEnter={(e) => {

    if (
      !loading &&
      !resendLoading &&
      lockSecondsLeft <= 0 &&
      !otp.some(
        digit => !digit
      )
    ) {

      e.currentTarget.style.filter =
        "brightness(1.12)";

      e.currentTarget.style.transform =
        "scale(1.01)";
    }
  }}

  onMouseLeave={(e) => {

    e.currentTarget.style.filter =
      "brightness(1)";

    e.currentTarget.style.transform =
      "scale(1)";
  }}
       disabled={
  checkingLock ||
  loading ||
  resendLoading ||
  isLocked ||
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
          checkingLock ||
  loading ||
  resendLoading ||
  //4
  isLocked ||
lockSecondsLeft > 0 ||
  otp.some(
    digit => !digit
  )
    ? 0.6
    : 1,

    transition:
  "all 0.18s ease",
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