// frontend/src/pages/LiveView.tsx
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Sidebar from '../components/Sidebar';

export default function LiveView() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = 'http://192.168.8.236:4000/hls/stream.m3u8';

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0f172a',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '20px' }}>Live CCTV View</h1>

          <video
            ref={videoRef}
            controls
            autoPlay
            muted
            playsInline
            style={{
              width: '800px',
              maxWidth: '90%',
              borderRadius: '12px',
              background: 'black',
            }}
          />
        </div>
      </div>
    </div>
  );
}