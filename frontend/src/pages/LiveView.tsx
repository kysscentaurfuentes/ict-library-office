import Sidebar from '../components/Sidebar';

export default function LiveView() {
  const streamUrl = 'http://127.0.0.1:5000/video';

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      background: '#0f172a', 
      fontFamily: 'sans-serif' 
    }}>
      <Sidebar />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          background: '#1e293b', 
          padding: '20px', 
          borderRadius: '16px', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          maxWidth: '850px', 
          width: '100%'
        }}>
          {/* CENTERED TITLE */}
          <h2 style={{ 
            color: 'white', 
            marginBottom: '20px', 
            fontSize: '1.4rem',
            textAlign: 'center', // Ito ang nag-center sa text
            fontWeight: '600',
            letterSpacing: '1px'
          }}>
             CCTV LIVE VIEW
          </h2>
          
          <div style={{ 
            position: 'relative', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            backgroundColor: 'black',
            border: '2px solid #334155'
          }}>
            <img
              src={streamUrl}
              alt="CCTV Stream"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

          <div style={{ 
            marginTop: '15px', 
            textAlign: 'center', 
            color: '#64748b', 
            fontSize: '0.85rem' 
          }}>
            Status: <span style={{ color: '#10b981' }}>● Live</span> | 
            Resolution: 800x450
          </div>
        </div>
      </div>
    </div>
  );
}