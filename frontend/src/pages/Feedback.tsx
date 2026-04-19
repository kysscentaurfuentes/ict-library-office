// frontend/src/pages/Feedback.tsx
// FILE PATH: frontend/src/pages/Feedback.tsx
// COMPONENT: Feedback & Reports Center
// DESCRIPTION: Users can send feedback, reports, and concerns to the admin/developer
// INTEGRATION: Uses Sidebar component for navigation
// BACKEND NOTES: Admin panel will receive these feedbacks (commented - ready for backend)

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';

// Types
interface FeedbackSubject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface FeedbackMessage {
  id: string;
  subjectId: string;
  subjectName: string;
  message: string;
  attachments?: string[];
  status: 'pending' | 'read' | 'replied' | 'resolved';
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

const Feedback: React.FC = () => {
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Feedback subjects with icons
  const [subjects] = useState<FeedbackSubject[]>([
    { id: 'bug', name: '🐛 Bug Report', icon: '🐛', color: '#ef4444' },
    { id: 'feature', name: '💡 Feature Request', icon: '💡', color: '#f59e0b' },
    { id: 'concern', name: '⚠️ Concern / Issue', icon: '⚠️', color: '#eab308' },
    { id: 'question', name: '❓ Question / Inquiry', icon: '❓', color: '#3b82f6' },
    { id: 'suggestion', name: '📝 Suggestion', icon: '📝', color: '#8b5cf6' },
    { id: 'praise', name: '🌟 Praise / Appreciation', icon: '🌟', color: '#10b981' },
    { id: 'report', name: '📊 Report (Technical)', icon: '📊', color: '#06b6d4' },
    { id: 'security', name: '🔒 Security Concern', icon: '🔒', color: '#dc2626' },
    { id: 'accessibility', name: '♿ Accessibility Issue', icon: '♿', color: '#6366f1' },
    { id: 'other', name: '📬 Other', icon: '📬', color: '#64748b' }
  ]);
  
  // State for form
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [charCount, setCharCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // State for feedback history
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackMessage[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // State for messages
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Max characters
  const MAX_CHARS = 3000;

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }
    
    // Load feedback history from localStorage
    const savedHistory = localStorage.getItem('feedbackHistory');
    if (savedHistory) {
      try {
        setFeedbackHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load feedback history');
      }
    }
  }, []);

  // Save feedback history to localStorage
  useEffect(() => {
    localStorage.setItem('feedbackHistory', JSON.stringify(feedbackHistory));
  }, [feedbackHistory]);

  // Update character count when message changes
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= MAX_CHARS) {
      setMessage(newMessage);
      setCharCount(newMessage.length);
    }
  };

  // Insert emoji or icon at cursor position
  const insertIcon = (icon: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + icon + message.substring(end);
    
    if (newMessage.length <= MAX_CHARS) {
      setMessage(newMessage);
      setCharCount(newMessage.length);
      
      // Set cursor position after inserted icon
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + icon.length, start + icon.length);
      }, 0);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          setErrorMessage('Image too large. Maximum size is 5MB.');
          continue;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          setAttachments(prev => [...prev, imageData]);
          
          // Also insert image markdown/text into message
          const imageMarkdown = `\n[Image: ${file.name}]\n`;
          const newMessage = message + imageMarkdown;
          if (newMessage.length <= MAX_CHARS) {
            setMessage(newMessage);
            setCharCount(newMessage.length);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMessage('Only image files are supported for attachments.');
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Get selected subject details
  const getSelectedSubjectDetails = () => {
    return subjects.find(s => s.id === selectedSubject);
  };

  // Handle submit feedback
  const handleSubmitFeedback = async () => {
    // Validation
    if (!selectedSubject) {
      setErrorMessage('Please select a subject for your feedback.');
      return;
    }
    
    if (!message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }
    
    if (message.trim().length < 10) {
      setErrorMessage('Please provide more details (minimum 10 characters).');
      return;
    }
    
    setIsSubmitting(true);
    
    const selectedSubjectObj = getSelectedSubjectDetails();
    const newFeedback: FeedbackMessage = {
      id: Date.now().toString(),
      subjectId: selectedSubject,
      subjectName: selectedSubjectObj?.name || selectedSubject,
      message: message.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
      status: 'pending',
      createdAt: new Date().toLocaleString(),
      userEmail: 'current.user@carsu.edu.ph', // Would come from auth in real app
      userName: 'Current User'
    };
    
    // ============================================================
    // BACKEND INTEGRATION CODE (COMMENTED - READY FOR ADMIN PANEL)
    // ============================================================
    // When ready to implement backend, uncomment the code below.
    // This will send feedback to the admin panel/database.
    //
    // For admin panel implementation:
    // 1. Create an API endpoint to receive feedback
    // 2. Store in database (MongoDB, PostgreSQL, etc.)
    // 3. Admin dashboard to view, filter, and reply to feedback
    // 4. Real-time notifications for new feedback
    // 5. Email notifications to admin for urgent feedback
    //
    // ============================================================
    
    /*
    // === API INTEGRATION EXAMPLE ===
    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subjectId: selectedSubject,
          subjectName: selectedSubjectObj?.name,
          message: message.trim(),
          attachments: attachments,
          userEmail: 'current.user@carsu.edu.ph',
          userName: 'Current User',
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit feedback');
      
      const result = await response.json();
      console.log('Feedback submitted:', result);
      
      // Also send email notification to admin for urgent subjects
      if (['bug', 'security', 'concern'].includes(selectedSubject)) {
        await fetch('/api/notify/admin', {
          method: 'POST',
          body: JSON.stringify({ feedbackId: result.id, subject: selectedSubjectObj?.name })
        });
      }
      
    } catch (error) {
      console.error('API Error:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
      setIsSubmitting(false);
      return;
    }
    */
    
    // ============================================================
    // ADMIN PANEL RECEIVING ENDPOINT (To be implemented in admin app)
    // ============================================================
    /*
    // Admin app would have endpoints like:
    // GET  /api/admin/feedback - Get all feedback
    // GET  /api/admin/feedback/:id - Get single feedback
    // PUT  /api/admin/feedback/:id/status - Update status
    // POST /api/admin/feedback/:id/reply - Add admin reply
    // DELETE /api/admin/feedback/:id - Delete feedback
    */
    
    // ============================================================
    // REAL-TIME NOTIFICATIONS (Socket.io example)
    // ============================================================
    /*
    // When feedback is submitted, emit to admin panel
    const socket = io('http://localhost:3001');
    socket.emit('new-feedback', {
      id: newFeedback.id,
      subject: selectedSubjectObj?.name,
      message: message.substring(0, 100),
      timestamp: new Date().toISOString()
    });
    */
    
    // ============================================================
    // EMAIL NOTIFICATION FOR ADMIN (Nodemailer example)
    // ============================================================
    /*
    // Backend would send email to admin@carsu.edu.ph
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({...});
    
    await transporter.sendMail({
      from: 'feedback@carsu.edu.ph',
      to: 'admin@carsu.edu.ph',
      subject: `New Feedback: ${selectedSubjectObj?.name}`,
      html: `<h3>New Feedback Received</h3>
             <p><strong>Subject:</strong> ${selectedSubjectObj?.name}</p>
             <p><strong>Message:</strong> ${message}</p>
             <p><strong>From:</strong> Current User</p>
             <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>`
    });
    */
    
    // ============================================================
    // CURRENT: STORE LOCALLY (Frontend-only demo)
    // ============================================================
    setFeedbackHistory(prev => [newFeedback, ...prev]);
    
    setSuccessMessage(`✓ Thank you for your feedback! Your ${selectedSubjectObj?.name} has been sent to the admin.`);
    
    // Reset form
    setSelectedSubject('');
    setMessage('');
    setAttachments([]);
    setCharCount(0);
    
    setIsSubmitting(false);
    
    setTimeout(() => setSuccessMessage(''), 4000);
    setTimeout(() => setErrorMessage(''), 4000);
  };

  // Get status badge
  const getStatusBadge = (status: FeedbackMessage['status']) => {
    switch (status) {
      case 'pending': return <span className="badge pending">🕐 Pending</span>;
      case 'read': return <span className="badge read">👁️ Read</span>;
      case 'replied': return <span className="badge replied">💬 Replied</span>;
      case 'resolved': return <span className="badge resolved">✅ Resolved</span>;
      default: return <span className="badge pending">Pending</span>;
    }
  };

  // Common emojis/icons for quick insertion
  const quickIcons = ['😊', '👍', '❤️', '🔥', '🎉', '🚀', '💡', '⚠️', '✅', '❌', '🔧', '📌', '⭐', '💬', '📢', '🔔'];

  return (
    <div className={`feedback-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <Sidebar />
      <div className="feedback-container">
        <main className="feedback-main">
          <div className="feedback-header">
            <h1 className="feedback-title">📢 Feedback & Reports Center</h1>
            <p className="feedback-subtitle">Share your thoughts, report issues, or send concerns directly to the developer/admin</p>
          </div>
          
          {successMessage && (
            <div className="success-message">
              <span>✓ {successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="error-message">
              <span>⚠ {errorMessage}</span>
              <button onClick={() => setErrorMessage('')}>×</button>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${!showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(false)}
            >
              ✍️ Send Feedback
            </button>
            <button 
              className={`tab ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(true)}
            >
              📋 My Feedback ({feedbackHistory.length})
            </button>
          </div>

          {!showHistory ? (
            <>
              {/* Subject Selection */}
              <div className="subjects-section">
                <h3>Select Subject <span className="required">*</span></h3>
                <div className="subjects-grid">
                  {subjects.map(subject => (
                    <button
                      key={subject.id}
                      className={`subject-btn ${selectedSubject === subject.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSubject(subject.id)}
                      style={{ '--subject-color': subject.color } as React.CSSProperties}
                    >
                      <span className="subject-icon">{subject.icon}</span>
                      <span className="subject-name">{subject.name}</span>
                      {selectedSubject === subject.id && <span className="check-mark">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Area */}
              <div className="message-section">
                <div className="message-header">
                  <h3>Your Message <span className="required">*</span></h3>
                  <div className="char-counter">
                    <span className={charCount >= MAX_CHARS ? 'char-limit' : ''}>
                      {charCount} / {MAX_CHARS}
                    </span>
                  </div>
                </div>
                
                <div className="message-toolbar">
                  <button 
                    className="toolbar-btn" 
                    onClick={() => insertIcon('📌')}
                    title="Insert pin"
                  >
                    📌
                  </button>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => insertIcon('⚠️')}
                    title="Insert warning"
                  >
                    ⚠️
                  </button>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => insertIcon('✅')}
                    title="Insert checkmark"
                  >
                    ✅
                  </button>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => insertIcon('❌')}
                    title="Insert cross"
                  >
                    ❌
                  </button>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => insertIcon('🔧')}
                    title="Insert tools"
                  >
                    🔧
                  </button>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => insertIcon('💡')}
                    title="Insert lightbulb"
                  >
                    💡
                  </button>
                  <div className="toolbar-divider"></div>
                  {quickIcons.map(icon => (
                    <button 
                      key={icon}
                      className="toolbar-btn quick-icon"
                      onClick={() => insertIcon(icon)}
                      title={`Insert ${icon}`}
                    >
                      {icon}
                    </button>
                  ))}
                  <div className="toolbar-divider"></div>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Insert image"
                  >
                    🖼️ Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                
                <textarea
                  ref={textareaRef}
                  className="message-textarea"
                  placeholder="Describe your feedback, report, or concern in detail..."
                  value={message}
                  onChange={handleMessageChange}
                  rows={8}
                />
                
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="attachments-preview">
                    <h4>📎 Attachments ({attachments.length})</h4>
                    <div className="attachments-list">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <img src={attachment} alt={`Attachment ${index + 1}`} />
                          <button onClick={() => removeAttachment(index)}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="message-hint">
                  <span>ℹ️</span>
                  <p>Please provide as much detail as possible. Include steps to reproduce for bug reports.</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="submit-section">
                <button 
                  className="submit-btn"
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting || !selectedSubject || !message.trim() || message.trim().length < 10}
                >
                  {isSubmitting ? (
                    <>⏳ Sending... <span className="spinner"></span></>
                  ) : (
                    <>📨 Send Feedback</>
                  )}
                </button>
                <p className="submit-note">
                  By sending feedback, you agree that we may contact you regarding this report.
                </p>
              </div>
            </>
          ) : (
            /* Feedback History */
            <div className="history-section">
              {feedbackHistory.length > 0 ? (
                <div className="history-list">
                  {feedbackHistory.map(feedback => {
                    const subject = subjects.find(s => s.id === feedback.subjectId);
                    return (
                      <div key={feedback.id} className="history-card">
                        <div className="history-card-header">
                          <div className="subject-badge" style={{ backgroundColor: subject?.color }}>
                            {subject?.icon} {subject?.name}
                          </div>
                          {getStatusBadge(feedback.status)}
                        </div>
                        <div className="history-card-message">
                          {feedback.message}
                        </div>
                        {feedback.attachments && feedback.attachments.length > 0 && (
                          <div className="history-attachments">
                            <span>📎 {feedback.attachments.length} attachment(s)</span>
                          </div>
                        )}
                        <div className="history-card-footer">
                          <span className="history-date">📅 {feedback.createdAt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-history">
                  <p>📭 No feedback sent yet</p>
                  <button onClick={() => setShowHistory(false)}>
                    Send Your First Feedback
                  </button>
                </div>
              )}
            </div>
          )}
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

        .feedback-wrapper {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: var(--bg);
        }

        .feedback-container {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
          height: 100vh;
          scrollbar-width: thin;
        }

        .feedback-container::-webkit-scrollbar {
          width: 10px;
        }

        .feedback-container::-webkit-scrollbar-track {
          background: #e2e8f0;
        }

        .feedback-container::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
        }

        .dark-mode .feedback-container::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark-mode .feedback-container::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .feedback-main {
          max-width: 1000px;
          margin: 0 auto;
        }

        .feedback-header {
          margin-bottom: 1.5rem;
        }

        .feedback-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .feedback-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid var(--border);
        }

        .tab {
          background: none;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          color: var(--accent);
        }

        .tab.active {
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
          margin-bottom: -2px;
        }

        /* Subjects Section */
        .subjects-section {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .subjects-section h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .required {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .subject-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .subject-btn:hover {
          border-color: var(--subject-color, var(--accent));
          transform: translateY(-2px);
        }

        .subject-btn.selected {
          border-color: var(--subject-color, var(--accent));
          background: var(--bg);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .subject-icon {
          font-size: 1.25rem;
        }

        .subject-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .check-mark {
          margin-left: auto;
          color: #10b981;
          font-weight: bold;
        }

        /* Message Section */
        .message-section {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .message-header h3 {
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .char-counter {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .char-limit {
          color: #ef4444;
          font-weight: bold;
        }

        /* Toolbar */
        .message-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px 12px 0 0;
          margin-bottom: -1px;
        }

        .toolbar-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          font-size: 1.1rem;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          color: var(--text-secondary);
        }

        .toolbar-btn:hover {
          background: var(--border);
          transform: scale(1.05);
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--border);
          margin: 0 0.25rem;
        }

        /* Textarea */
        .message-textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 0 0 12px 12px;
          font-size: 1rem;
          font-family: inherit;
          background: var(--card-bg);
          color: var(--text-primary);
          resize: vertical;
          line-height: 1.5;
        }

        .message-textarea:focus {
          outline: none;
          border-color: var(--accent);
        }

        /* Attachments */
        .attachments-preview {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--bg);
          border-radius: 12px;
        }

        .attachments-preview h4 {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .attachments-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .attachment-item {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .attachment-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .attachment-item button {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: var(--bg);
          border-radius: 8px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        /* Submit Section */
        .submit-section {
          text-align: center;
          padding: 1rem;
        }

        .submit-btn {
          padding: 1rem 2.5rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 40px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: scale(1.02);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-note {
          margin-top: 1rem;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        /* History Section */
        .history-section {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem;
        }

        .history-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .subject-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .badge.pending { background: #fef3c7; color: #d97706; }
        .badge.read { background: #dbeafe; color: #2563eb; }
        .badge.replied { background: #d1fae5; color: #059669; }
        .badge.resolved { background: #e0e7ff; color: #4f46e5; }

        .dark-mode .badge.pending { background: #451a03; color: #fbbf24; }
        .dark-mode .badge.read { background: #1e3a5f; color: #60a5fa; }
        .dark-mode .badge.replied { background: #064e3b; color: #34d399; }
        .dark-mode .badge.resolved { background: #312e81; color: #a5b4fc; }

        .history-card-message {
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 0.75rem;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .history-attachments {
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .history-card-footer {
          display: flex;
          justify-content: flex-end;
        }

        .history-date {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .empty-history {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .empty-history button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Messages */
        .success-message {
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          border-left: 4px solid #10b981;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          border-left: 4px solid #ef4444;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-message button {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #991b1b;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .feedback-container {
            padding: 1rem;
          }
          
          .subjects-grid {
            grid-template-columns: 1fr;
          }
          
          .message-toolbar {
            overflow-x: auto;
            flex-wrap: nowrap;
          }
          
          .toolbar-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Feedback;