// frontend/src/pages/QrCodeScanner.tsx
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../components/Sidebar';

export default function QrCodeScanner() {
  const studentId = localStorage.getItem('studentId') || "N/A";

  return (
    <div style={{ 
      display: 'flex', 
      background: '#0f172a', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden' 
    }}>
      <Sidebar />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white'
      }}>
        {/* Tinanggal ang Main Menu Title dito */}
        
        <p style={{ marginBottom: '25px', color: '#94a3b8', fontSize: '1.2rem', fontWeight: '500' }}>
          Your Registered QR Code
        </p>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', // Pinaliit mula 50px para hindi masyadong malaki ang puti
          borderRadius: '20px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <QRCodeSVG 
            value={studentId} 
            size={280} // Binawasan ang size mula 380 para mas fit sa screen
            level={"H"}
            includeMargin={false} // Ginawang false para dikit sa border ang QR
          />
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.8rem', letterSpacing: '3px', marginBottom: '8px' }}>
            STUDENT ID
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            padding: '10px 30px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h2 style={{ 
              fontSize: '2rem', // Pinaliit mula 3.5rem para hindi mukhang "undefined" error
              letterSpacing: '4px', 
              color: '#60a5fa', 
              margin: 0,
              fontFamily: 'monospace'
            }}>
              {studentId}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}