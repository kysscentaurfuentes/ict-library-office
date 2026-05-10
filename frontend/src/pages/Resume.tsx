import React from 'react';

/**
 * KYSS FUENTES RESUME - Centered and Scrollable
 * File: frontend/src/pages/Resume.tsx
 * Image Path: /tor.jpg
 */

const Resume = () => {
  const s: { [key: string]: React.CSSProperties } = {
    // Pinaka-outer wrapper para sa centering at scrolling
    pageWrapper: {
      backgroundColor: '#202124', // Dark background para lumitaw ang puting papel
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // I-center ang resume horizontally
      padding: '40px 0', // Space sa taas at baba habang nag-scroll
      overflowY: 'auto', // Payagan ang scrolling
    },
    // Ang "Papel" mismo
    resumePaper: {
      backgroundColor: '#fff',
      width: '850px', // Standard width para magmukhang A4/Letter
      minHeight: '1100px', // Standard height
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      color: '#333',
    },
    headerArea: {
      backgroundColor: '#f4f4f4',
      padding: '40px 60px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      fontSize: '42px',
      fontWeight: '400',
      letterSpacing: '5px',
      margin: 0,
    },
    jobTitle: {
      fontSize: '12px',
      letterSpacing: '6px',
      marginTop: '10px',
      color: '#666',
      textTransform: 'uppercase',
    },
    profileImg: {
      width: '160px',
      height: '160px',
      borderRadius: '50%',
      border: '5px solid #fff',
      objectFit: 'cover',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    body: {
      display: 'flex',
      flex: 1,
    },
    leftCol: {
      width: '35%',
      borderRight: '1px solid #eee',
      padding: '40px 30px',
    },
    rightCol: {
      width: '65%',
      padding: '40px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      letterSpacing: '4px',
      borderBottom: '1px solid #ddd',
      paddingBottom: '5px',
      margin: '30px 0 15px 0',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    profileBox: {
      border: '1.5px solid #444',
      padding: '25px',
      position: 'relative',
      textAlign: 'center',
      fontSize: '11px',
      fontStyle: 'italic',
      lineHeight: '1.6',
      marginTop: '10px',
    },
    profileTitleLabel: {
      position: 'absolute',
      top: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#fff',
      padding: '0 15px',
      fontWeight: 'bold',
      letterSpacing: '3px',
    }
  };

  return (
    <div style={s.pageWrapper}>
      <div style={s.resumePaper}>
        
        {/* HEADER */}
        <div style={s.headerArea}>
          <div>
            <h1 style={s.name}>KYSS FUENTES</h1>
            <p style={s.jobTitle}>Information Systems</p>
          </div>
          <img src="/tor.jpg" alt="Profile" style={s.profileImg} />
        </div>

        <div style={s.body}>
          {/* LEFT SIDEBAR */}
          <div style={s.leftCol}>
            <div style={{ fontSize: '11px', lineHeight: '2' }}>
              <div>📞 +63-991-457-1460</div>
              <div>✉️ Kyss.fuentes2@gmail.com</div>
              <div>📍 P-2, Manapa, Buenavista, ADN</div>
              <div>🌐 facebook.com/Khyss333/</div>
            </div>

            <h2 style={s.sectionTitle}>Skills</h2>
            <ul style={{ fontSize: '12px', lineHeight: '2.2', paddingLeft: '20px' }}>
              <li>Web Design</li>
              <li>Design Thinking</li>
              <li>Problem-Solving</li>
              <li>Computer Literacy</li>
              <li>Virtual Assistant</li>
              <li>Data Analyst</li>
              <li>Logistics</li>
              <li>Networker</li>
            </ul>

            <h2 style={s.sectionTitle}>Education</h2>
            <div style={{ fontSize: '11px', marginBottom: '20px' }}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>SENIOR HIGH SCHOOL</p>
              <p style={{ margin: '4px 0' }}>Saint Joseph Institute of Technology</p>
              <p style={{ color: '#888' }}>2018 - 2019</p>
            </div>
            <div style={{ fontSize: '11px' }}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>BS INFORMATION SYSTEM</p>
              <p style={{ margin: '4px 0' }}>Caraga State University</p>
              <p style={{ color: '#888' }}>2021 - Present</p>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={s.rightCol}>
            <div style={s.profileBox}>
              <span style={s.profileTitleLabel}>PROFILE</span>
              "I have versatile skills in multiple roles either as a programmer, an editor or a data analyst, etc. A detail-oriented person who acts as a team player and is continuously willing to learn more."
            </div>

            <h2 style={{ textAlign: 'center', fontSize: '14px', letterSpacing: '2px', fontWeight: 'bold', margin: '30px 0 20px 0' }}>
              EXPERIENCES AND ACHIEVEMENTS
            </h2>

            <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
              <p><strong>Grade 12 Senior High School</strong> - Supreme Student Council works at the Media and Documentary team with Honors</p>
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Some "Javascript" projects I've done:</p>
                <div style={{ margin: '10px 0' }}>
                  <p><strong>QR Code Scanner:</strong> ICT Library Office</p>
                  <p style={{ color: 'blue', fontSize: '10px' }}>Source: https://drive.google.com/...</p>
                </div>
                <div style={{ margin: '10px 0' }}>
                  <p><strong>Movie Catalogue</strong></p>
                  <p style={{ color: 'blue', fontSize: '10px' }}>Source: https://drive.google.com/...</p>
                </div>
              </div>

              <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '15px' }}>
                <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>PLATFORM USED</p>
                <p style={{ fontSize: '10px', textAlign: 'center', color: '#555' }}>Zoom | Skype | Discord | Messenger | WhatsApp | Google Meet</p>
                
                <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '15px 0 10px 0' }}>PROFESSIONAL SKILLS</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '10px' }}>
                  <span>• Microsoft Office Suite</span>
                  <span>• Graphic & Video Editing</span>
                  <span>• HTML, CSS, Javascript</span>
                  <span>• C & Python Programming</span>
                  <span>• SQL Database</span>
                  <span>• E-commerce</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;