import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

interface AttendanceRecord {
  date: string; // Format: YYYY-MM-DD
  checkIn: string;
  status: 'present' | 'absent';
}

interface StudentAttendance {
  studentId: string;
  name: string;
  records: AttendanceRecord[];
}

export default function AttendanceLog() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentResult, setStudentResult] = useState<StudentAttendance | null>(null);
  const [isSearching, setIsSearching] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Listen for changes in localStorage from Settings page
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode === 'true') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  

  // Get Philippines timezone
  const getPHTime = () => {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    return phTime;
  };

  // Generate dummy attendance records (past dates only)
  useEffect(() => {
    const generateDummyRecords = () => {
      const records: AttendanceRecord[] = [];
      const today = getPHTime();
      today.setHours(0, 0, 0, 0);

      // Generate records for past 3 months (weekdays only)
      for (let i = 1; i <= 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Only generate attendance for weekdays
        if (!isWeekend) {
          // Randomly decide if user attended (70% chance)
          const attended = Math.random() > 0.3;
          
          if (attended) {
            // Generate random check-in time between 7:00 AM and 5:00 PM
            const checkInHour = 7 + Math.floor(Math.random() * 11);
            const checkInMinute = Math.floor(Math.random() * 60);
            
            const ampm = checkInHour >= 12 ? 'PM' : 'AM';
            const hour12 = checkInHour === 0 ? 12 : (checkInHour > 12 ? checkInHour - 12 : checkInHour);
            const checkInTime = `${hour12}:${checkInMinute.toString().padStart(2, '0')} ${ampm}`;
            
            records.push({
              date: date.toISOString().split('T')[0],
              checkIn: checkInTime,
              status: 'present'
            });
          } else {
            records.push({
              date: date.toISOString().split('T')[0],
              checkIn: '',
              status: 'absent'
            });
          }
        }
      }
      
      setAttendanceRecords(records);
    };
    
    generateDummyRecords();
  }, []);

  // Dummy student database (for demonstration)
  const studentDatabase: { [key: string]: StudentAttendance } = {
    '2024-001': {
      studentId: '2024-001',
      name: 'Maria Santos',
      records: []
    },
    '2024-002': {
      studentId: '2024-002',
      name: 'Juan Dela Cruz',
      records: []
    },
    '2024-003': {
      studentId: '2024-003',
      name: 'Jose Rizal',
      records: []
    },
    '2024-004': {
      studentId: '2024-004',
      name: 'Andres Bonifacio',
      records: []
    },
    '2024-005': {
      studentId: '2024-005',
      name: 'Gabriela Silang',
      records: []
    }
  };

  // Generate attendance for a specific student in the current month only
  const generateStudentAttendance = (studentId: string, month: number, year: number): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = getPHTime();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Only generate for current month (not past months)
    if (year === today.getFullYear() && month === today.getMonth()) {
      // Generate attendance from 1st of month up to today
      for (let d = 1; d <= today.getDate(); d++) {
        const date = new Date(year, month, d);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (!isWeekend && date <= today) {
          // Random attendance pattern for demo (60% chance)
          const attended = Math.random() > 0.4;
          
          if (attended) {
            const checkInHour = 7 + Math.floor(Math.random() * 11);
            const checkInMinute = Math.floor(Math.random() * 60);
            const ampm = checkInHour >= 12 ? 'PM' : 'AM';
            const hour12 = checkInHour === 0 ? 12 : (checkInHour > 12 ? checkInHour - 12 : checkInHour);
            const checkInTime = `${hour12}:${checkInMinute.toString().padStart(2, '0')} ${ampm}`;
            
            records.push({
              date: date.toISOString().split('T')[0],
              checkIn: checkInTime,
              status: 'present'
            });
          } else {
            records.push({
              date: date.toISOString().split('T')[0],
              checkIn: '',
              status: 'absent'
            });
          }
        }
      }
    } else if (year === today.getFullYear() && month < today.getMonth()) {
      // Generate full month attendance for past months within current year
      for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
        const date = new Date(year, month, d);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (!isWeekend) {
          const attended = Math.random() > 0.4;
          
          if (attended) {
            const checkInHour = 7 + Math.floor(Math.random() * 11);
            const checkInMinute = Math.floor(Math.random() * 60);
            const ampm = checkInHour >= 12 ? 'PM' : 'AM';
            const hour12 = checkInHour === 0 ? 12 : (checkInHour > 12 ? checkInHour - 12 : checkInHour);
            const checkInTime = `${hour12}:${checkInMinute.toString().padStart(2, '0')} ${ampm}`;
            
            records.push({
              date: date.toISOString().split('T')[0],
              checkIn: checkInTime,
              status: 'present'
            });
          } else {
            records.push({
              date: date.toISOString().split('T')[0],
              checkIn: '',
              status: 'absent'
            });
          }
        }
      }
    }
    
    return records;
  };

  const handleSearchStudent = () => {
    if (!studentId.trim()) {
      alert('Please enter a Student ID');
      return;
    }

    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const student = studentDatabase[studentId];
      const today = getPHTime();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      if (student) {
        // Generate attendance for current month only
        const attendanceRecords = generateStudentAttendance(studentId, currentMonth, currentYear);
        setStudentResult({
          ...student,
          records: attendanceRecords
        });
      } else {
        // For demo purposes, generate for any student ID entered
        const dummyStudent: StudentAttendance = {
          studentId: studentId,
          name: `Student ${studentId}`,
          records: generateStudentAttendance(studentId, currentMonth, currentYear)
        };
        setStudentResult(dummyStudent);
      }
      setIsSearching(false);
    }, 500);
  };

  const closeModal = () => {
    setShowStudentModal(false);
    setStudentId('');
    setStudentResult(null);
  };

  // Check if user attended on a specific date
  const getAttendanceForDate = (date: Date): AttendanceRecord | null => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceRecords.find(record => record.date === dateStr) || null;
  };

  // Get attendance for student result on a specific date
  const getStudentAttendanceForDate = (date: Date): AttendanceRecord | null => {
    if (!studentResult) return null;
    const dateStr = date.toISOString().split('T')[0];
    return studentResult.records.find(record => record.date === dateStr) || null;
  };

  // Check if date is weekend
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = getPHTime();
    return date.toDateString() === today.toDateString();
  };

  // Get month name
  const getMonthName = (month: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };

  // Navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToMonth = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setShowMonthPicker(false);
  };

  const goToYear = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  // Generate calendar days
  const generateCalendarDays = (): (Date | null)[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const currentYear = currentDate.getFullYear();
  const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }}>
      <Sidebar />
      
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: isDarkMode ? 'white' : '#1e293b', marginBottom: '10px' }}>
            📅 Attendance Log
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Track your office attendance history • ICT Library Hours: Monday-Friday, 7:00 AM - 5:00 PM
          </p>
        </div>

        {/* Calendar Navigation with Student Tracker Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <button
            onClick={previousMonth}
            style={{
              padding: '8px 16px',
              backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0',
              color: isDarkMode ? 'white' : '#1e293b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ◀ Previous
          </button>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Month Picker */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowYearPicker(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {getMonthName(currentDate.getMonth())} ▼
              </button>
              
              {showMonthPicker && (
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  left: '0',
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
color: isDarkMode ? 'white' : '#1e293b',
                  borderRadius: '8px',
                  padding: '10px',
                  zIndex: 10,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '5px',
                  minWidth: '200px'
                }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => goToMonth(i)}
                      style={{
                        padding: '8px',
                        backgroundColor: currentDate.getMonth() === i ? '#3b82f6' : '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {getMonthName(i).substring(0, 3)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year Picker */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMonthPicker(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {currentDate.getFullYear()} ▼
              </button>
              
              {showYearPicker && (
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  left: '0',
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
color: isDarkMode ? 'white' : '#1e293b',
                  borderRadius: '8px',
                  padding: '10px',
                  zIndex: 10,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '5px',
                  minWidth: '150px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => goToYear(year)}
                      style={{
                        padding: '8px',
                        backgroundColor: currentDate.getFullYear() === year ? '#3b82f6' : '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={nextMonth}
              style={{
                padding: '8px 16px',
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
color: isDarkMode ? 'white' : '#1e293b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Next ▶
            </button>
            
            {/* Student Tracker Button - Upper Right */}
            <button
              onClick={() => setShowStudentModal(true)}
              style={{
                padding: '8px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔍 Track Student
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px',
          marginBottom: '10px'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
  key={day}
  style={{
    textAlign: 'center',
    padding: '10px',
    fontWeight: 'bold',
    backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
    color: day === 'Sun' || day === 'Sat' ? '#ef4444' : (isDarkMode ? 'white' : '#1e293b'),
    borderRadius: '8px'
  }}
>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px',
          marginBottom: '30px'
        }}>
          {calendarDays.map((date, index) => {
            if (!date) {
  return <div key={`empty-${index}`} style={{ padding: '10px', backgroundColor: 'transparent' }} />;
}

            const attendance = getAttendanceForDate(date);
            const weekend = isWeekend(date);
            const today = isToday(date);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isHovered = hoveredDate && date.toDateString() === hoveredDate.toDateString();

            return (
              <div
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                style={{
  padding: '15px 10px',
  backgroundColor: isSelected ? '#3b82f6' : (isHovered ? (isDarkMode ? '#334155' : '#cbd5e1') : (isDarkMode ? '#1e293b' : '#ffffff')),
  borderRadius: '12px',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
  border: today ? '2px solid #10b981' : 'none',
  position: 'relative'
}}
              >
                <div style={{
  fontSize: '18px',
  fontWeight: 'bold',
  color: weekend ? '#ef4444' : (today ? '#10b981' : (isDarkMode ? 'white' : '#1e293b')),
  marginBottom: '8px'
}}>
                  {date.getDate()}
                </div>

                {attendance && attendance.status === 'present' && (
                  <div style={{ fontSize: '20px' }}>
                    ✅
                  </div>
                )}

                {weekend && (
                  <div style={{
                    fontSize: '10px',
                    color: '#ef4444',
                    marginTop: '5px',
                    fontWeight: 'bold'
                  }}>
                    CLOSED
                  </div>
                )}

                {today && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}>
                    TODAY
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
color: isDarkMode ? 'white' : '#1e293b',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: isDarkMode ? 'white' : '#1e293b', marginBottom: '15px' }}>
  📋 Attendance Details
</h3>
            
            <div style={{ borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, paddingTop: '15px' }}>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ color: '#94a3b8' }}>Date: </span>
                <span style={{ color: isDarkMode ? 'white' : '#1e293b', fontWeight: 'bold' }}>
  {selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}
</span>
              </div>

              {isWeekend(selectedDate) ? (
                <div style={{
                  backgroundColor: '#7f1d1d',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '10px'
                }}>
                  <div style={{ color: '#fca5a5', fontSize: '18px', marginBottom: '10px' }}>
                    🏢 ICT Library Office is Closed
                  </div>
                  <div style={{ color: '#fecaca' }}>
                    Operating Hours: Monday to Friday, 7:00 AM - 5:00 PM only.
                    <br />
                    Please visit us during weekdays.
                  </div>
                </div>
              ) : (
                <>
                  {(() => {
                    const attendance = getAttendanceForDate(selectedDate);
                    if (attendance && attendance.status === 'present') {
                      return (
                        <div>
                          <div style={{ 
                            backgroundColor: '#064e3b',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '10px'
                          }}>
                            <div style={{ color: '#10b981', fontSize: '18px', marginBottom: '10px' }}>
                              ✅ You came to the office
                            </div>
                            <div style={{ color: '#a7f3d0' }}>
                              Time: {attendance.checkIn}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          <div style={{ 
                            backgroundColor: '#1e3a8a',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '10px'
                          }}>
                            <div style={{ color: '#60a5fa', fontSize: '18px', marginBottom: '10px' }}>
                              📅 You didn't go to the office today
                            </div>
                            <div style={{ color: '#bfdbfe' }}>
                              No attendance record found for this date.
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </>
              )}
            </div>
          </div>
        )}

        {/* Student Tracker Modal */}
        {showStudentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
color: isDarkMode ? 'white' : '#1e293b',
              borderRadius: '16px',
              padding: '30px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>

              <h2 style={{ color: isDarkMode ? 'white' : '#1e293b', marginBottom: '20px', fontSize: '24px' }}>
  🔍 Track Student Attendance
</h2>
              
              <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
                Enter Student ID to view their attendance record for this month only.
              </p>

              {!studentResult ? (
                <>
                  <input
  type="text"
  value={studentId}
  onChange={(e) => setStudentId(e.target.value)}
  placeholder="Enter Student ID (e.g., 000-00000  )"
  style={{
    width: '100%',
    padding: '12px',
    backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
    border: `1px solid ${isDarkMode ? '#334155' : '#cbd5e1'}`,
    borderRadius: '8px',
    color: isDarkMode ? 'white' : '#1e293b',
    fontSize: '16px',
    marginBottom: '15px'
  }}
/>
                  
                  <button
                    onClick={handleSearchStudent}
                    disabled={isSearching}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isSearching ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      opacity: isSearching ? 0.7 : 1
                    }}
                  >
                    {isSearching ? 'Searching...' : 'Track Student'}
                  </button>
                </>
              ) : (
                <div>
                  <div style={{
                    backgroundColor: '#0f172a',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ color: '#8b5cf6', fontSize: '14px', marginBottom: '5px' }}>
                      Student ID
                    </div>
                    <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                      {studentResult.studentId}
                    </div>
                    <div style={{ color: '#8b5cf6', fontSize: '14px', marginBottom: '5px' }}>
                      Name
                    </div>
                    <div style={{ color: 'white', fontSize: '16px' }}>
                      {studentResult.name}
                    </div>
                  </div>

                  <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '18px' }}>
                    📊 Attendance for {getMonthName(getPHTime().getMonth())} {getPHTime().getFullYear()}
                  </h3>

                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {studentResult.records.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {studentResult.records.map((record, idx) => {
                          const date = new Date(record.date);
                          return (
                            <div
                              key={idx}
                              style={{
                                backgroundColor: record.status === 'present' ? '#064e3b' : '#1e3a8a',
                                padding: '12px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ color: 'white', fontWeight: 'bold' }}>
                                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                </div>
                              </div>
                              {record.status === 'present' ? (
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ color: '#10b981', fontSize: '14px' }}>✅ Came to office</div>
                                  <div style={{ color: '#a7f3d0', fontSize: '12px' }}>Time: {record.checkIn}</div>
                                </div>
                              ) : (
                                <div style={{ color: '#60a5fa', fontSize: '14px' }}>📅 Didn't go to office</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: '#0f172a',
                        padding: '20px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#94a3b8'
                      }}>
                        No attendance records for this month.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setStudentResult(null)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#334155',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginTop: '20px'
                    }}
                  >
                    Search Another Student
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '30px',
          padding: '15px',
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
color: isDarkMode ? 'white' : '#1e293b',
          borderRadius: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
            <span style={{ color: '#94a3b8' }}>Selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid #10b981', borderRadius: '4px' }}></div>
            <span style={{ color: '#94a3b8' }}>Today</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <span style={{ color: '#94a3b8' }}>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>CLOSED</span>
            <span style={{ color: '#94a3b8' }}>Weekend</span>
          </div>
        </div>
      </div>
    </div>
  );
}