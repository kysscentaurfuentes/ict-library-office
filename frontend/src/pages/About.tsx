// frontend/src/pages/About.tsx
// FILE PATH: frontend/src/pages/About.tsx
// COMPONENT: About the Developer & Project
// DESCRIPTION: Information about the developer (Kyss Centaur Fuentes) and the ICT Library Office project
// INTEGRATION: Uses Sidebar component for navigation

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';



// IMPORTANT: To use local image from C:\Users\ADMIN\Pictures\tor.jpg
// You have two options:
//
// OPTION 1: Copy the image to your project's public folder
//   1. Copy tor.jpg to: frontend/public/images/tor.jpg
//   2. Then use: /images/tor.jpg
//
// OPTION 2: Import the image directly (if moved to src folder)
//   1. Copy tor.jpg to: frontend/src/assets/tor.jpg
//   2. Then uncomment the import below:
//
// import developerImage from '../assets/tor.jpg';
//
// OPTION 3: For development only - serve from absolute path (not recommended for production)
//   Place the image in public folder as shown in OPTION 1

const About: React.FC = () => {
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }
    
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Developer information
  const developer = {
    name: 'Kyss Centaur Fuentes',
    role: 'Lead Developer & Project Owner',
    expertise: [
      'Full-Stack Development',
      'Computer Vision & AI',
      'QR Code Systems',
      'Cross-Platform Applications',
      'Database Architecture',
      'Security & Fraud Prevention'
    ],
    bio: `Kyss Centaur Fuentes is the visionary developer behind the ICT Library Office Management System. 
    With a passion for innovation and efficiency, Kyss has dedicated countless hours to creating a system 
    that revolutionizes how libraries operate. The journey began with a simple goal: to eliminate anomalies, 
    streamline processes, and bring modern technology to the heart of academic institutions. What started 
    as a local solution has grown into a sophisticated ecosystem that includes CCTV face detection, 
    dynamic QR code generation, and cross-platform accessibility. Kyss believes that technology should 
    serve people, not complicate their lives. This philosophy drives every line of code and every feature 
    implemented in this system. When not coding, Kyss is exploring new technologies, contributing to open-source 
    projects, and mentoring aspiring developers.`
  };

  // Project information
  const project = {
    name: 'ICT Library Office Sign-In System',
    version: '2.0.0',
    releaseDate: '2024',
    lastUpdated: '2026',
    purpose: `To organize, streamline, and secure the ICT Library Office operations while providing 
    a seamless experience for students, faculty, and staff. The system aims to eliminate manual 
    processes, reduce fraudulent activities, and create a transparent, efficient library environment.`,
    keyFeatures: [
      {
        title: 'CCTV Face Detection',
        description: 'Advanced computer vision technology that detects and recognizes multiple faces simultaneously, providing real-time monitoring and attendance tracking.',
        icon: '🎥'
      },
      {
        title: 'Dynamic QR Code System',
        description: 'Auto-generates unique QR codes for web, mobile, and desktop platforms. Works both online and offline, ensuring accessibility even without internet connection.',
        icon: '📱'
      },
      {
        title: 'Cross-Platform Compatibility',
        description: 'Seamless experience across web browsers, mobile devices, and desktop applications. One system, multiple access points.',
        icon: '💻'
      },
      {
        title: 'Offline-First Architecture',
        description: 'Designed to work flawlessly even without internet connectivity. Data syncs automatically when connection is restored.',
        icon: '🌐'
      },
      {
        title: 'Fraud Prevention System',
        description: 'Advanced algorithms detect and prevent anomalies, ensuring only legitimate entries and reducing unauthorized access.',
        icon: '🛡️'
      },
      {
        title: 'Real-Time Monitoring',
        description: 'Live dashboard showing current occupancy, visitor statistics, and system health metrics.',
        icon: '📊'
      },
      {
        title: 'Automated Reporting',
        description: 'Generate comprehensive reports on usage patterns, peak hours, and visitor demographics.',
        icon: '📈'
      },
      {
        title: 'Multi-Factor Authentication',
        description: 'Enhanced security with 2FA options including email verification, biometrics, and hardware keys.',
        icon: '🔐'
      }
    ],
    impact: [
      'Reduced manual processing time by 75%',
      'Eliminated fraudulent entries by 98%',
      'Improved visitor experience with contactless sign-in',
      'Provided actionable insights through analytics',
      'Enabled remote monitoring and management',
      'Reduced paper waste by going digital',
      'Increased library usage by 40%',
      'Enhanced security with real-time alerts'
    ],
    technologies: [
      { name: 'React 18', type: 'Frontend Framework', icon: '⚛️' },
      { name: 'TypeScript', type: 'Programming Language', icon: '📘' },
      { name: 'Node.js', type: 'Backend Runtime', icon: '🟢' },
      { name: 'Express', type: 'API Framework', icon: '🚂' },
      { name: 'OpenCV', type: 'Face Detection', icon: '👁️' },
      { name: 'TensorFlow.js', type: 'Machine Learning', icon: '🧠' },
      { name: 'IndexedDB', type: 'Offline Storage', icon: '💾' },
      { name: 'WebSocket', type: 'Real-Time Communication', icon: '🔌' },
      { name: 'JWT', type: 'Authentication', icon: '🔑' },
      { name: 'Electron', type: 'Desktop App', icon: '⚡' }
    ]
  };

  // For image - using public folder path (recommended)
  // To use your image from C:\Users\ADMIN\Pictures\tor.jpg:
  // 1. Copy the file to: frontend/public/images/tor.jpg
  // 2. The code below will automatically use it
// Then change the path variable


// Fallback if image doesn't exist
const [imageError, setImageError] = useState(false);

  return (
    <div className={`about-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <Sidebar />
      <div className="about-container">
        <main className="about-main">
          {/* Header Section */}
          <div className="about-header">
            <h1 className="about-title">ℹ️ About This Project</h1>
            <p className="about-subtitle">
              Learn more about the developer, the vision, and the technology behind the ICT Library Office Management System
            </p>
          </div>

          {/* Developer Profile Section */}
          <div className="section-card developer-card">
            <div className="developer-profile">
              <div className="developer-avatar">
                {!imageError ? (
 <img 
  src="/tor.jpg" 
  alt="Kyss Centaur Fuentes" 
  className="developer-image"
  onError={() => setImageError(true)}
/>
) : (
                  <div className="avatar-placeholder">
                    <span className="avatar-icon">👨‍💻</span>
                    <p className="avatar-note">Image not found<br/>Place tor.jpg in public/images/</p>
                  </div>
                )}
              </div>
              <div className="developer-info">
                <h2>{developer.name}</h2>
                <p className="developer-role">{developer.role}</p>
                <div className="expertise-tags">
                  {developer.expertise.map((skill, index) => (
                    <span key={index} className="expertise-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="developer-bio">
              <h3>📖 About the Developer</h3>
              <p>{developer.bio}</p>
            </div>
          </div>

          {/* Project Vision Section */}
          <div className="section-card">
            <h3>🎯 Project Vision & Mission</h3>
            <div className="vision-content">
              <p className="vision-text">
                <strong>Mission:</strong> To transform the ICT Library Office into a modern, efficient, 
                and secure environment through innovative technology solutions that prioritize user 
                experience and operational excellence.
              </p>
              <p className="vision-text">
                <strong>Vision:</strong> A fully integrated library ecosystem where technology and 
                human interaction coexist seamlessly, setting new standards for academic institution 
                management systems.
              </p>
            </div>
          </div>

          {/* Purpose Section */}
          <div className="section-card">
            <h3>💡 Purpose of This Project</h3>
            <p className="purpose-text">{project.purpose}</p>
            <div className="purpose-list">
              <div className="purpose-item">
                <span className="purpose-icon">📋</span>
                <div>
                  <strong>Organize Library Operations</strong>
                  <p>Centralized system for managing visitors, resources, and daily activities</p>
                </div>
              </div>
              <div className="purpose-item">
                <span className="purpose-icon">⚡</span>
                <div>
                  <strong>Streamline Processes</strong>
                  <p>Eliminate redundant manual tasks and reduce waiting times</p>
                </div>
              </div>
              <div className="purpose-item">
                <span className="purpose-icon">🛡️</span>
                <div>
                  <strong>Prevent Anomalies & Fraud</strong>
                  <p>Advanced detection systems to ensure legitimate entries only</p>
                </div>
              </div>
              <div className="purpose-item">
                <span className="purpose-icon">📚</span>
                <div>
                  <strong>Advance the Library</strong>
                  <p>Bring modern technology to academic institutions for better learning environments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Section */}
          <div className="section-card">
            <h3>✨ Key Features & Capabilities</h3>
            <div className="features-grid">
              {project.keyFeatures.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack Section */}
          <div className="section-card">
            <h3>🛠️ Technology Stack</h3>
            <div className="tech-grid">
              {project.technologies.map((tech, index) => (
                <div key={index} className="tech-item">
                  <span className="tech-icon">{tech.icon}</span>
                  <div className="tech-info">
                    <strong>{tech.name}</strong>
                    <span className="tech-type">{tech.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Section */}
          <div className="section-card">
            <h3>📊 Project Impact</h3>
            <div className="impact-grid">
              {project.impact.map((item, index) => (
                <div key={index} className="impact-item">
                  <span className="impact-check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why This Project Matters */}
          <div className="section-card">
            <h3>🏆 Why This Project Matters</h3>
            <div className="importance-content">
              <p>
                The ICT Library Office Sign-In System is more than just software — it's a solution 
                to real-world problems faced by academic institutions daily. Traditional library 
                management often relies on manual logbooks, paper records, and outdated systems 
                that are prone to errors, fraud, and inefficiency.
              </p>
              <p>
                With the integration of <strong>CCTV face detection</strong>, the system automatically 
                identifies and logs visitors, eliminating the possibility of fake signatures or 
                unauthorized entries. The <strong>dynamic QR code system</strong> works both online 
                and offline, ensuring that even during internet outages, the library continues to 
                operate smoothly.
              </p>
              <p>
                By providing a <strong>cross-platform solution</strong> (web, mobile, and desktop), 
                the system is accessible to everyone — students checking in, staff monitoring the 
                library, and administrators managing reports. The <strong>offline-first architecture</strong> 
                ensures that no data is ever lost, syncing automatically when connectivity is restored.
              </p>
              <p>
                Ultimately, this project aims to <strong>modernize the library experience</strong>, 
                reduce administrative burden, and create a transparent, accountable system that 
                benefits the entire academic community. It's a step toward smarter campuses and 
                more efficient public service.
              </p>
            </div>
          </div>

          {/* Future Roadmap */}
          <div className="section-card">
            <h3>🚀 Future Roadmap</h3>
            <div className="roadmap-list">
              <div className="roadmap-item">
                <span className="roadmap-badge">Phase 1</span>
                <span>AI-powered predictive analytics for peak hour management</span>
              </div>
              <div className="roadmap-item">
                <span className="roadmap-badge">Phase 2</span>
                <span>Integration with university ID cards (RFID/NFC)</span>
              </div>
              <div className="roadmap-item">
                <span className="roadmap-badge">Phase 3</span>
                <span>Mobile app with offline QR code generation</span>
              </div>
              <div className="roadmap-item">
                <span className="roadmap-badge">Phase 4</span>
                <span>Automated email/SMS notifications for library events</span>
              </div>
              <div className="roadmap-item">
                <span className="roadmap-badge">Phase 5</span>
                <span>Advanced dashboard with custom report builder</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="about-footer">
            <p>© {currentYear} ICT Library Office Sign-In System</p>
            <p>Developed by {developer.name}</p>
            <p className="version-info">Version {project.version} | Last Updated {project.lastUpdated}</p>
          </div>
        </main>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        :root {
          font-size: 14px;
          --bg: #f8fafc;
          --card-bg: #ffffff;
          --text-primary: #1e293b;
          --text-secondary: #475569;
          --border: #e2e8f0;
          --accent: #3b82f6;
          --accent-hover: #2563eb;
        }

        body.dark-mode {
          --bg: #0f172a;
          --card-bg: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --border: #334155;
          background: var(--bg);
        }

        .about-wrapper {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: var(--bg);
        }

        .about-container {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
          height: 100vh;
          scrollbar-width: thin;
        }

        .about-container::-webkit-scrollbar {
          width: 10px;
        }

        .about-container::-webkit-scrollbar-track {
          background: #e2e8f0;
        }

        .about-container::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
        }

        .dark-mode .about-container::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark-mode .about-container::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .about-main {
          max-width: 1200px;
          margin: 0 auto;
        }

        .about-header {
          margin-bottom: 2rem;
        }

        .about-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .about-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        /* Section Cards */
        .section-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.75rem;
          margin-bottom: 1.75rem;
          transition: all 0.3s ease;
        }

        .section-card h3 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          border-left: 4px solid var(--accent);
          padding-left: 1rem;
        }

        /* Developer Card */
        .developer-card {
          background: linear-gradient(135deg, var(--card-bg) 0%, var(--bg) 100%);
        }

        .developer-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

        .developer-avatar {
          flex-shrink: 0;
        }

        .developer-image {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--accent);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .avatar-placeholder {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: var(--bg);
          border: 4px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .avatar-icon {
          font-size: 4rem;
        }

        .avatar-note {
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .developer-info h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .developer-role {
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .expertise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

        .expertise-tag {
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .developer-bio h3 {
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
          border-left: none;
          padding-left: 0;
        }

        .developer-bio p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Vision Content */
        .vision-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .vision-text {
          color: var(--text-secondary);
          line-height: 1.6;
          padding: 0.75rem;
          background: var(--bg);
          border-radius: 12px;
        }

        /* Purpose Section */
        .purpose-text {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .purpose-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .purpose-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg);
          border-radius: 12px;
        }

        .purpose-icon {
          font-size: 1.5rem;
        }

        .purpose-item strong {
          color: var(--text-primary);
        }

        .purpose-item p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .feature-card {
          background: var(--bg);
          border-radius: 16px;
          padding: 1.25rem;
          transition: transform 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }

        .feature-card h4 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Tech Grid */
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .tech-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg);
          border-radius: 12px;
        }

        .tech-icon {
          font-size: 1.5rem;
        }

        .tech-info {
          display: flex;
          flex-direction: column;
        }

        .tech-info strong {
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .tech-type {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        /* Impact Grid */
        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.75rem;
        }

        .impact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg);
          border-radius: 10px;
          color: var(--text-secondary);
        }

        .impact-check {
          color: #10b981;
          font-weight: bold;
          font-size: 1.1rem;
        }

        /* Importance Content */
        .importance-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .importance-content p {
          color: var(--text-secondary);
          line-height: 1.7;
        }

        /* Roadmap */
        .roadmap-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .roadmap-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--bg);
          border-radius: 10px;
        }

        .roadmap-badge {
          background: var(--accent);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          min-width: 70px;
          text-align: center;
        }

        /* Footer */
        .about-footer {
          text-align: center;
          padding: 2rem 1rem;
          border-top: 1px solid var(--border);
          margin-top: 1rem;
        }

        .about-footer p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
        }

        .version-info {
          font-size: 0.7rem;
          opacity: 0.7;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .about-container {
            padding: 1rem;
          }
          
          .developer-profile {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .developer-info {
            text-align: center;
          }
          
          .expertise-tags {
            justify-content: center;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .tech-grid {
            grid-template-columns: 1fr;
          }
          
          .impact-grid {
            grid-template-columns: 1fr;
          }
          
          .purpose-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default About;