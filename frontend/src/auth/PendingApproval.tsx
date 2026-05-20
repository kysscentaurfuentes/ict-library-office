// frontend/src/auth/PendingApproval.tsx
import { useDynamicBackground } from "../hooks/useDynamicBackground";

export default function PendingApproval() {

  const currentBackground =
    useDynamicBackground();

    const pendingIdentifier =
  localStorage.getItem(
    'pendingIdentifier'
  ) || '';

const pendingEmail =
  localStorage.getItem(
    'pendingEmail'
  ) || '';

const isStudentId =
  /^\d{3}-\d{5}$/.test(
    pendingIdentifier
  );

    const hourglassAnimation = `
@keyframes hourglassSpin {

  0% {
    transform: rotate(0deg);
  }

  35% {
    transform: rotate(-180deg);
  }

  50% {
    transform: rotate(-180deg);
  }

  85% {
    transform: rotate(-360deg);
  }

  100% {
    transform: rotate(-360deg);
  }
}
`;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily:
          '"Poppins", "Segoe UI", sans-serif',
      }}
    >
        <style>
  {hourglassAnimation}
</style>

      {/* BACKGROUND */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            currentBackground
              ? `url(${currentBackground})`
              : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* DARK OVERLAY */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'rgba(0,0,0,0.62)',
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '720px',
        }}
      >

        {/* HEADER */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '34px',
          }}
        >
          <h2
            style={{
              color: '#ffffff',
              fontSize: '2rem',
              fontWeight: 600,
              letterSpacing: '10px',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            ICT LIBRARY OFFICE
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '2px',
                background: '#8b5cf6',
                borderRadius: '20px',
              }}
            />

            <h1
              style={{
                margin: 0,
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 600,
                letterSpacing: '3px',
              }}
            >
              ACCOUNT PENDING
            </h1>

            <div
              style={{
                width: '60px',
                height: '2px',
                background: '#8b5cf6',
                borderRadius: '20px',
              }}
            />
          </div>
        </div>

        {/* GLASS CARD */}
        <div
          style={{
            backdropFilter: 'blur(18px)',
            background:
              'rgba(255,255,255,0.11)',
            border:
              '1px solid rgba(255,255,255,0.12)',
            borderRadius: '18px',
            padding: '58px 50px',
            boxShadow:
              '0 10px 35px rgba(0,0,0,0.32), 0 0 12px rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}
        >

          {/* ICON */}
<div
  style={{
    fontSize: '4.5rem',
    marginBottom: '32px',
    marginTop: '-8px',
    display: 'inline-block',
    animation:
      'hourglassSpin 3.2s ease-in-out infinite',
    transformOrigin: 'center',
    userSelect: 'none',
  }}
>
  ⏳
</div>

          {/* TITLE */}
          <h2
            style={{
              color: '#ffffff',
              fontSize: '1.8rem',
              marginBottom: '18px',
              marginTop: '12px',
              fontWeight: 700,
            }}
          >
            Your Account is Pending
          </h2>

          {/* DESCRIPTION */}
<div
  style={{
    marginBottom: '26px',
  }}
>

  <p
    style={{
      color:
        'rgba(255,255,255,0.82)',
      fontSize: '1rem',
      lineHeight: 1.8,
      marginBottom: '20px',
    }}
  >
    Your registration has been submitted successfully.
  </p>

  {/* ACCOUNT DETAILS */}
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '24px',
      alignItems: 'center',
    }}
  >

    {/* STUDENT ID */}
<div
  style={{
    padding: '10px 18px',
    borderRadius: '10px',
    background:
      'rgba(255,255,255,0.08)',
    border:
      '1px solid rgba(255,255,255,0.08)',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.95rem',
    minWidth: '320px',
  }}
>
  Student ID: {pendingIdentifier}
</div>

{/* EMAIL */}
<div
  style={{
    padding: '10px 18px',
    borderRadius: '10px',
    background:
      'rgba(255,255,255,0.08)',
    border:
      '1px solid rgba(255,255,255,0.08)',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.95rem',
    minWidth: '320px',
    wordBreak: 'break-word',
  }}
>
  CARSU Email: {
    pendingEmail ||
    'Pending account email'
  }
</div>

  </div>

  <p
    style={{
      color:
        'rgba(255,255,255,0.82)',
      fontSize: '1rem',
      lineHeight: 1.8,
      margin: 0,
    }}
  >
    Your account is currently waiting for Admin approval.
    You cannot sign in until your account has been approved.
  </p>

</div>

          {/* STATUS BADGE */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              borderRadius: '999px',
              background:
                'rgba(139,92,246,0.18)',
              border:
                '1px solid rgba(139,92,246,0.4)',
              color: '#d8b4fe',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            STATUS: PENDING APPROVAL
          </div>
          {/* BACK BUTTON */}
<button
  onClick={() => {
    window.location.hash =
      '#/signin';
  }}
  style={{
marginTop: '28px',
display: 'block',
marginLeft: 'auto',
marginRight: 'auto',
width: '100%',
maxWidth: '240px',
    height: '52px',
    border: 'none',
    borderRadius: '10px',
    background:
      'linear-gradient(90deg,#4b5563,#374151)',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: '0.2s ease',
    boxShadow:
      '0 4px 12px rgba(0,0,0,0.28)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      'translateY(0px)';
  }}
>
  ← Back to Sign In
</button>

        </div>
      </div>
    </div>
  );
}