// frontend/src/components/AuthBackground.tsx
import { useDynamicBackground } from '../hooks/useDynamicBackground';
type Props = {
  children: React.ReactNode;
};

export default function AuthBackground({
  children,
}: Props) {

  const currentBackground =
    useDynamicBackground();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
      }}
    >

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
          backgroundRepeat: 'no-repeat',

          animation:
            'authBackgroundFloat 18s ease-in-out infinite',

          willChange:
            'transform',
        }}
      />

      {/* DARK OVERLAY */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'rgba(0,0,0,0.64)',
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>

    </div>
  );
}