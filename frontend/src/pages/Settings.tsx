// frontend/src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

// Types
interface LinkedAccount {
  id: string;
  provider: string;
  email: string;
  linkedAt: string;
}

const Settings: React.FC = () => {
  // State variables
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [selectedFontSize, setSelectedFontSize] = useState<string>('medium');
  const [notificationSoundVolume, setNotificationSoundVolume] = useState<number>(50);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Change Password Modal
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  
  // Change Information states
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('1');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  
  // Editable user info
  const [userInfo, setUserInfo] = useState<{ 
    firstName: string; 
    lastName: string; 
    email: string;
    phoneNumber: string;
  }>({
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juandelacruz@carsu.edu.ph',
    phoneNumber: ''
  });
  
  // Phone number validation helper
  const validatePhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);
    return limitedDigits;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value;
    // Remove the +63 prefix if user tries to type it manually
    let cleanedValue = rawValue.replace(/^\+63/, '');
    const validatedDigits = validatePhoneNumber(cleanedValue);
    setUserInfo(prev => ({ ...prev, phoneNumber: validatedDigits }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserInfo(prev => ({ ...prev, email: e.target.value }));
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserInfo(prev => ({ ...prev, firstName: e.target.value }));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserInfo(prev => ({ ...prev, lastName: e.target.value }));
  };

  // Save user info changes
  const saveUserInfo = async (): Promise<void> => {
    await updateSetting('user information', userInfo);
  };
  
  // Linked Accounts
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([
    { id: '1', provider: 'Google', email: 'user@gmail.com', linkedAt: '2024-01-15' },
    { id: '2', provider: 'Facebook', email: 'juan.fb@facebook.com', linkedAt: '2024-02-20' },
    { id: '3', provider: 'Caraga State University', email: 'juandelacruz@carsu.edu.ph', linkedAt: '2024-03-10' },
  ]);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [newAccountProvider, setNewAccountProvider] = useState<string>('Google');
  const [newAccountEmail, setNewAccountEmail] = useState<string>('');

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }
    
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setSelectedFontSize(savedFontSize);
      applyFontSizeToAll(savedFontSize);
    }
    
    const savedVolume = localStorage.getItem('notificationVolume');
    if (savedVolume) {
      setNotificationSoundVolume(parseInt(savedVolume));
    }
    
    const savedTwoFactor = localStorage.getItem('twoFactorEnabled');
    if (savedTwoFactor === 'true') {
      setTwoFactorEnabled(true);
    }

    // Load saved user info
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        setUserInfo(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved user info');
      }
    }
  }, []);

  // Save user info to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, [userInfo]);

  // Apply font size to entire document including sidebar
  const applyFontSizeToAll = (size: string): void => {
    let fontSizeValue = '14px';
    switch (size) {
      case 'small': fontSizeValue = '12px'; break;
      case 'large': fontSizeValue = '18px'; break;
      default: fontSizeValue = '14px'; break;
    }
    document.documentElement.style.fontSize = fontSizeValue;
    document.body.style.fontSize = fontSizeValue;
  };

  const getFontSizeValue = (size: string): string => {
    switch (size) {
      case 'small': return '12px';
      case 'large': return '18px';
      default: return '14px';
    }
  };

  // Mock API call simulation
  const mockApiCall = async (data: any): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('API Update:', data);
        resolve();
      }, 500);
    });
  };

  const updateSetting = async (key: string, value: any): Promise<void> => {
    await mockApiCall({ [key]: value });
    setSuccessMessage(`Updated ${key} successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const updateThemeSetting = (key: string, value: boolean): void => {
    updateSetting(key, value);
    localStorage.setItem('darkMode', value.toString());
    if (value) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  };

  const handleFontSizeChange = (size: string): void => {
    setSelectedFontSize(size);
    applyFontSizeToAll(size);
    localStorage.setItem('fontSize', size);
    updateSetting('fontSize', size);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const volume = parseInt(e.target.value);
    setNotificationSoundVolume(volume);
    localStorage.setItem('notificationVolume', volume.toString());
    updateSetting('volume', volume);
  };

  const updatePassword = async (): Promise<void> => {
    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    await mockApiCall({});
    setSuccessMessage('Password updated successfully!');
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
        localStorage.setItem('profilePicture', reader.result as string);
      };
      reader.readAsDataURL(file);
      updateSetting('profilePicture', file.name);
      setSuccessMessage('Profile picture updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleUnlinkAccount = async (accountId: string): Promise<void> => {
    setLinkedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    await mockApiCall({ unlinkedAccount: accountId });
    setSuccessMessage('Account unlinked successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLinkAccount = async (): Promise<void> => {
    if (!newAccountEmail) {
      alert('Please enter an email address');
      return;
    }
    
    // For CARSU account, validate email ends with @carsu.edu.ph
    if (newAccountProvider === 'Caraga State University' && !newAccountEmail.endsWith('@carsu.edu.ph')) {
      alert('CARSU account email must end with @carsu.edu.ph');
      return;
    }
    
    const newAccount: LinkedAccount = {
      id: Date.now().toString(),
      provider: newAccountProvider,
      email: newAccountEmail,
      linkedAt: new Date().toISOString().split('T')[0],
    };
    setLinkedAccounts(prev => [...prev, newAccount]);
    await mockApiCall({ linkedAccount: newAccount });
    setSuccessMessage(`${newAccountProvider} account linked successfully!`);
    setShowLinkModal(false);
    setNewAccountEmail('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className={`settings-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <Sidebar />
      <div className="settings-container">
        <main className="main-content">
          <h1 className="settings-title">Settings</h1>
          
          {successMessage && (
            <div className="success-message">
              <span>✓ {successMessage}</span>
            </div>
          )}

          {/* Editable User Information */}
          <div className="section-card">
            <h3>User Information</h3>
            <div className="form-stack">
              <div className="form-field">
                <label>First Name</label>
                <input 
                  type="text" 
                  value={userInfo.firstName} 
                  onChange={handleFirstNameChange}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-field">
                <label>Last Name</label>
                <input 
                  type="text" 
                  value={userInfo.lastName} 
                  onChange={handleLastNameChange}
                  placeholder="Enter last name"
                />
              </div>
              <div className="form-field">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={userInfo.email} 
                  onChange={handleEmailChange}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">
                    <span className="flag-icon">🇵🇭</span> +63
                  </span>
                  <input
                    type="tel"
                    value={userInfo.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="9123456789"
                    maxLength={10}
                    pattern="\d*"
                    inputMode="numeric"
                    className="phone-number-input"
                  />
                </div>
                <small className="field-hint">Enter 10 digits after +63 (e.g., 9123456789)</small>
              </div>
              <button className="btn-primary" onClick={saveUserInfo} style={{ marginTop: '0.5rem' }}>
                Save User Information
              </button>
            </div>
          </div>

          {/* Theme Section */}
          <div className="section-card">
            <h3>Theme</h3>
            <div className="form-group">
              <label htmlFor="darkMode">Dark Mode</label>
              <input
                type="checkbox"
                id="darkMode"
                checked={isDarkMode}
                onChange={(e) => {
                  setIsDarkMode(e.target.checked);
                  updateThemeSetting('darkMode', e.target.checked);
                }}
              />
            </div>
          </div>

          {/* Security Section */}
          <div className="section-card">
            <h3>Security</h3>
            <div className="form-group">
              <label htmlFor="twoFactorAuth">Enable 2-Step Verification (for added security)</label>
              <input
                type="checkbox"
                id="twoFactorAuth"
                checked={twoFactorEnabled}
                onChange={(e) => {
                  setTwoFactorEnabled(e.target.checked);
                  updateSetting('twoFactorEnabled', e.target.checked);
                }}
              />
            </div>
            <div className="form-group">
              <label>Account Security</label>
              <button className="btn-primary" onClick={() => setShowChangePasswordModal(true)}>
                Change Password
              </button>
            </div>
          </div>

          {/* Accessibility Section */}
          <div className="section-card">
            <h3>Accessibility</h3>
            <div className="form-group">
              <label htmlFor="fontSize">Font Size</label>
              <select
                id="fontSize"
                value={selectedFontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="section-card">
            <h3>Notifications</h3>
            <div className="form-group">
              <label>Sound Volume (0% = silent)</label>
              <div className="range-container">
                <input
                  type="range"
                  value={notificationSoundVolume}
                  min="0"
                  max="100"
                  onChange={handleVolumeChange}
                />
                <span>{notificationSoundVolume}%</span>
                <span className="max-label">100% max</span>
              </div>
            </div>
            <div className="form-group">
              <label>Enable Vibration (for scanned QR codes)</label>
              <input
                type="checkbox"
                id="enableVibration"
                onChange={(e) => updateSetting('vibration', e.target.checked)}
              />
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div className="section-card">
            <h3>Profile Picture</h3>
            <div className="form-group">
              <label htmlFor="profilePicture">Upload Profile Picture:</label>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleProfilePictureUpload}
              />
            </div>
            {profilePicturePreview && (
              <div className="profile-preview">
                <img src={profilePicturePreview} alt="Profile Preview" className="profile-img" />
              </div>
            )}
          </div>

          {/* Change Information Section */}
          <div className="section-card">
            <h3>Change Information</h3>
            <div className="form-stack">
              <label>Edit Course:</label>
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="course-select"
              >
                <optgroup label="---UNDERGRADUATE OFFERED PROGRAMS---">
                  <option value="">Select a course...</option>
                  <option value="BACHELOR OF SCIENCE IN SOCIAL WORK">BACHELOR OF SCIENCE IN SOCIAL WORK</option>
                  <option value="BACHELOR OF SCIENCE IN PSYCHOLOGY">BACHELOR OF SCIENCE IN PSYCHOLOGY</option>
                  <option value="BACHELOR OF ARTS IN SOCIOLOGY">BACHELOR OF ARTS IN SOCIOLOGY</option>
                  <option value="BACHELOR OF SCIENCE IN BIOLOGY">BACHELOR OF SCIENCE IN BIOLOGY</option>
                  <option value="BACHELOR OF SCIENCE IN CHEMISTRY">BACHELOR OF SCIENCE IN CHEMISTRY</option>
                  <option value="BACHELOR OF SCIENCE IN PHYSICS">BACHELOR OF SCIENCE IN PHYSICS</option>
                  <option value="BACHELOR OF SCIENCE IN MATHEMATICS">BACHELOR OF SCIENCE IN MATHEMATICS</option>
                  <option value="BACHELOR OF SCIENCE IN APPLIED MATHEMATICS">BACHELOR OF SCIENCE IN APPLIED MATHEMATICS</option>
                  <option value="BACHELOR OF SCIENCE IN COMPUTER SCIENCE">BACHELOR OF SCIENCE IN COMPUTER SCIENCE</option>
                  <option value="BACHELOR OF SCIENCE IN INFORMATION SYSTEM">BACHELOR OF SCIENCE IN INFORMATION SYSTEM</option>
                  <option value="BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY">BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY</option>
                  <option value="BACHELOR OF SCIENCE IN ENVIRONMENTAL SCIENCE">BACHELOR OF SCIENCE IN ENVIRONMENTAL SCIENCE</option>
                  <option value="BACHELOR OF SCIENCE IN AGROFORESTRY">BACHELOR OF SCIENCE IN AGROFORESTRY</option>
                  <option value="BACHELOR OF SCIENCE IN FORESTRY">BACHELOR OF SCIENCE IN FORESTRY</option>
                  <option value="BACHELOR OF ELEMENTARY EDUCATION">BACHELOR OF ELEMENTARY EDUCATION</option>
                  <option value="BACHELOR OF SECONDARY EDUCATION MAJOR IN ENGLISH">BACHELOR OF SECONDARY EDUCATION MAJOR IN ENGLISH</option>
                  <option value="BACHELOR OF SECONDARY EDUCATION MAJOR IN FILIPINO">BACHELOR OF SECONDARY EDUCATION MAJOR IN FILIPINO</option>
                  <option value="BACHELOR OF SECONDARY EDUCATION MAJOR IN SCIENCE">BACHELOR OF SECONDARY EDUCATION MAJOR IN SCIENCE</option>
                  <option value="BACHELOR OF SECONDARY EDUCATION MAJOR IN MATHEMATICS">BACHELOR OF SECONDARY EDUCATION MAJOR IN MATHEMATICS</option>
                  <option value="BACHELOR OF AGRICULTURAL TECHNOLOGY">BACHELOR OF AGRICULTURAL TECHNOLOGY</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURE">BACHELOR OF SCIENCE IN AGRICULTURE</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN AGRICULTURAL ECONOMICS">BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN AGRICULTURAL ECONOMICS</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN AGRONOMY">BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN AGRONOMY</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN CROP PROTECTION">BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN CROP PROTECTION</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN SOIL SCIENCE">BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN SOIL SCIENCE</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN AGRIBUSINESS MANAGEMENT">BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN AGRIBUSINESS MANAGEMENT</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN ANIMAL SCIENCE">BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN ANIMAL SCIENCE</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN HORTICULTURE">BACHELOR OF SCIENCE IN AGRICULTURE, MAJOR IN HORTICULTURE</option>
                  <option value="BACHELOR OF SCIENCE IN AGRICULTURAL AND BIOSYSTEMS ENGINEERING">BACHELOR OF SCIENCE IN AGRICULTURAL AND BIOSYSTEMS ENGINEERING</option>
                  <option value="BACHELOR OF SCIENCE IN CIVIL ENGINEERING">BACHELOR OF SCIENCE IN CIVIL ENGINEERING</option>
                  <option value="BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING">BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING</option>
                  <option value="BACHELOR OF SCIENCE IN GEODETIC ENGINEERING">BACHELOR OF SCIENCE IN GEODETIC ENGINEERING</option>
                  <option value="BACHELOR OF SCIENCE IN MINING ENGINEERING">BACHELOR OF SCIENCE IN MINING ENGINEERING</option>
                  <option value="BACHELOR OF SCIENCE IN GEOLOGY">BACHELOR OF SCIENCE IN GEOLOGY</option>
                </optgroup>
                <optgroup label="---MASTER'S DEGREE PROGRAMS---">
                  <option value="MASTER OF ARTS IN EDUCATION (MAED)">MASTER OF ARTS IN EDUCATION (MAED)</option>
                  <option value="MAED - ENGLISH LANGUAGE TEACHING (ELT)">MAED - ENGLISH LANGUAGE TEACHING (ELT)</option>
                  <option value="MAED - EDUCATIONAL MANAGEMENT (EM)">MAED - EDUCATIONAL MANAGEMENT (EM)</option>
                  <option value="MAED - GUIDANCE & COUNSELING (GC)">MAED - GUIDANCE & COUNSELING (GC)</option>
                  <option value="MAED - TEACHING, READING AND LITERATURE (TRL)">MAED - TEACHING, READING AND LITERATURE (TRL)</option>
                  <option value="MAED - HEALTH EDUCATION (HE)">MAED - HEALTH EDUCATION (HE)</option>
                  <option value="MASTER OF ARTS IN GUIDANCE AND COUNSELING (MA GC)">MASTER OF ARTS IN GUIDANCE AND COUNSELING (MA GC)</option>
                  <option value="MASTER OF SCIENCE IN ENVIRONMENTAL MANAGEMENT (MEM)">MASTER OF SCIENCE IN ENVIRONMENTAL MANAGEMENT (MEM)</option>
                  <option value="MASTER OF SCIENCE IN BIOLOGY (MSBio)">MASTER OF SCIENCE IN BIOLOGY (MSBio)</option>
                  <option value="MSBio - MORPHOLOGY">MSBio - MORPHOLOGY</option>
                  <option value="MSBio - ECOLOGY">MSBio - ECOLOGY</option>
                  <option value="MSBio - TAXONOMY">MSBio - TAXONOMY</option>
                  <option value="MSBio - GENETICS">MSBio - GENETICS</option>
                  <option value="MSBio - PHYSIOLOGY">MSBio - PHYSIOLOGY</option>
                  <option value="MASTER OF SCIENCE EDUCATION (MSciED)">MASTER OF SCIENCE EDUCATION (MSciED)</option>
                  <option value="MSciED - BIOLOGICAL SCIENCES">MSciED - BIOLOGICAL SCIENCES</option>
                  <option value="MSciED - PHYSICAL SCIENCES">MSciED - PHYSICAL SCIENCES</option>
                  <option value="MSciED - ELEMENTARY SCIENCES">MSciED - ELEMENTARY SCIENCES</option>
                  <option value="MASTER OF SCIENCE IN CROP SCIENCE (MSCS)">MASTER OF SCIENCE IN CROP SCIENCE (MSCS)</option>
                  <option value="MSCS - HORTICULTURE">MSCS - HORTICULTURE</option>
                  <option value="MSCS - AGRONOMY">MSCS - AGRONOMY</option>
                  <option value="MASTER OF SCIENCE IN INFORMATION TECHNOLOGY (MSIT)">MASTER OF SCIENCE IN INFORMATION TECHNOLOGY (MSIT)</option>
                  <option value="MASTER OF SCIENCE IN MATHEMATICS (MSMATH)">MASTER OF SCIENCE IN MATHEMATICS (MSMATH)</option>
                  <option value="MASTER OF SCIENCE IN MATHEMATICS EDUCATION (MSMathEd)">MASTER OF SCIENCE IN MATHEMATICS EDUCATION (MSMathEd)</option>
                  <option value="MASTER IN PUBLIC ADMINISTRATION (MPA)">MASTER IN PUBLIC ADMINISTRATION (MPA)</option>
                </optgroup>
                <optgroup label="---DOCTORAL DEGREE PROGRAMS---">
                  <option value="DOCTOR OF EDUCATION IN EDUCATIONAL MANAGEMENT (Ed.D)">DOCTOR OF EDUCATION IN EDUCATIONAL MANAGEMENT (Ed.D)</option>
                  <option value="DOCTOR OF PHILOSOPHY IN MATHEMATICS (Ph.D.-Math)">DOCTOR OF PHILOSOPHY IN MATHEMATICS (Ph.D.-Math)</option>
                  <option value="DOCTOR OF PHILOSOPHY IN MATHEMATICS EDUCATION (Ph.D.-MathEd)">DOCTOR OF PHILOSOPHY IN MATHEMATICS EDUCATION (Ph.D.-MathEd)</option>
                  <option value="DOCTOR OF PHILOSOPHY IN SCIENCE EDUCATION (Ph.D.-SciEd)">DOCTOR OF PHILOSOPHY IN SCIENCE EDUCATION (Ph.D.-SciEd)</option>
                  <option value="Ph.D.-SciEd (Biology)">Ph.D.-SciEd (Biology)</option>
                  <option value="Ph.D.-SciEd (Physics)">Ph.D.-SciEd (Physics)</option>
                </optgroup>
              </select>
              
              <label>Edit Year Level:</label>
              <select 
                value={selectedYearLevel} 
                onChange={(e) => setSelectedYearLevel(e.target.value)}
                className="year-select"
              >
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5+">Fifth Year and Above</option>
              </select>
              
              <button className="btn-primary" onClick={() => updateSetting('course and year', { course: selectedCourse, yearLevel: selectedYearLevel })}>
                Save Changes
              </button>
            </div>
          </div>

          {/* Manage Linked Accounts */}
          <div className="section-card">
            <h3>Manage Linked Accounts</h3>
            {linkedAccounts.map((account) => (
              <div key={account.id} className="linked-account-item">
                <div className="account-info">
                  <span className="account-provider">{account.provider}</span>
                  <span className="account-email">{account.email}</span>
                  <span className="account-date">Linked: {account.linkedAt}</span>
                </div>
                <button 
                  className="btn-unlink" 
                  onClick={() => handleUnlinkAccount(account.id)}
                >
                  Unlink
                </button>
              </div>
            ))}
            <button className="btn-link-new" onClick={() => setShowLinkModal(true)}>
              + Link New Account
            </button>
          </div>

          {/* About Section */}
          <div className="about-section">
            <p>User ID: 211-01850</p>
            <p>Version: 1.0.0</p>
            <p>&copy; 2026 ICT Library Office Sign In.</p>
          </div>

          {/* Change Password Modal */}
          {showChangePasswordModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Change Password</h3>
                <div className="form-stack">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn-save" onClick={updatePassword}>Update</button>
                  <button className="btn-cancel" onClick={() => setShowChangePasswordModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Link New Account Modal */}
          {showLinkModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Link New Account</h3>
                <div className="form-stack">
                  <label>Provider</label>
                  <select 
                    value={newAccountProvider} 
                    onChange={(e) => setNewAccountProvider(e.target.value)}
                  >
                    <option value="Google">Google</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Caraga State University">CARSU Account (@carsu.edu.ph)</option>
                  </select>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder={newAccountProvider === 'Caraga State University' ? 'name@carsu.edu.ph' : 'Enter email address'}
                    value={newAccountEmail}
                    onChange={(e) => setNewAccountEmail(e.target.value)}
                  />
                  {newAccountProvider === 'Caraga State University' && (
                    <small className="email-hint">Must end with @carsu.edu.ph</small>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="btn-save" onClick={handleLinkAccount}>Link</button>
                  <button className="btn-cancel" onClick={() => setShowLinkModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        /* RESET & BASE */
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
          --bg: #ffffff;
          --card-bg: #ffffff;
          --text-primary: #1e293b;
          --text-secondary: #334155;
          --border: #e2e8f0;
        }

        body {
          background: var(--bg);
          transition: background-color 0.3s ease;
        }

        body.dark-mode {
          --bg: #0f172a;
          --card-bg: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --border: #334155;
          background: var(--bg);
        }

        /* WRAPPER - full viewport coverage */
        .settings-wrapper {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: var(--bg);
        }

        /* SCROLLABLE CONTAINER - scrollbar on extreme right */
        .settings-container {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
          overflow-x: hidden;
          height: 100vh;
          scrollbar-width: thin;
          scrollbar-gutter: stable;
        }

        /* Webkit scrollbar - positioned at the very right edge */
        .settings-container::-webkit-scrollbar {
          width: 10px;
          background: transparent;
        }

        .settings-container::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 0px;
          margin-block: 0;
        }

        .settings-container::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 0px;
        }

        .settings-container::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        .dark-mode .settings-container::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark-mode .settings-container::-webkit-scrollbar-thumb {
          background: #475569;
        }

        /* MAIN CONTENT - takes full width, no overflow */
        .main-content {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          overflow: visible;
        }

        .settings-title {
          font-size: 2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        /* Section Cards */
        .section-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 1.5rem 1.75rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border);
          transition: all 0.3s ease;
        }

        .section-card h3 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border);
          padding-bottom: 0.5rem;
        }

        .dark-mode .section-card h3 {
          color: #38bdf8;
        }

        /* Form Groups */
        .form-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-stack input,
        .form-stack select {
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 1rem;
          background: var(--card-bg);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .form-stack select option {
          background: var(--card-bg);
          color: var(--text-primary);
        }

        /* Form Field */
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .form-field label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
        }

        .form-field input {
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 1rem;
          background: var(--card-bg);
          color: var(--text-primary);
        }

        .field-hint {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .dark-mode .field-hint {
          color: #94a3b8;
        }

        /* Phone Input Wrapper */
        .phone-input-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          background: var(--card-bg);
        }

        .phone-prefix {
          background: var(--border);
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: var(--text-primary);
          border-right: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .flag-icon {
          font-size: 1.1rem;
        }

        .phone-number-input {
          flex: 1;
          border: none !important;
          border-radius: 0 !important;
          padding: 0.75rem !important;
          background: var(--card-bg);
          color: var(--text-primary);
        }

        .phone-number-input:focus {
          outline: none;
        }

        /* Range Slider */
        .range-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .range-container input {
          flex: 1;
          height: 6px;
          border-radius: 5px;
          background: var(--border);
        }

        .range-container span {
          min-width: 45px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .max-label {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Buttons */
        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-unlink {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .btn-unlink:hover {
          background: #dc2626;
        }

        .btn-link-new {
          background: #22c55e;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
          width: 100%;
        }

        .btn-link-new:hover {
          background: #16a34a;
        }

        /* Success Message */
        .success-message {
          background: #dcfce7;
          color: #166534;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.25rem;
          border-left: 4px solid #22c55e;
        }

        .dark-mode .success-message {
          background: #14532d;
          color: #bbf7d0;
        }

        /* Linked Accounts */
        .linked-account-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
        }

        .account-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .account-provider {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .account-email {
          font-size: 0.85rem;
          color: #64748b;
        }

        .dark-mode .account-email {
          color: #94a3b8;
        }

        .account-date {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        /* Profile Preview */
        .profile-preview {
          margin-top: 1rem;
          text-align: center;
        }

        .profile-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #3b82f6;
        }

        /* About Section */
        .about-section {
          text-align: center;
          padding: 1.5rem;
          color: #64748b;
          font-size: 0.85rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 1.75rem;
          width: 450px;
          max-width: 90%;
        }

        .dark-mode .modal-content {
          background: #1e293b;
          color: #f1f5f9;
        }

        .modal-content h3 {
          margin-bottom: 1.25rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn-save {
          background: #22c55e;
          color: white;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-cancel {
          background: #64748b;
          color: white;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
        }

        input[type="checkbox"] {
          width: 1.2rem;
          height: 1.2rem;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .email-hint {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .settings-container {
            padding: 1rem;
          }
          .section-card {
            padding: 1rem;
          }
          .form-group {
            flex-direction: column;
            align-items: flex-start;
          }
          .linked-account-item {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
          .phone-input-wrapper {
            flex-wrap: wrap;
          }
          .phone-prefix {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;