// frontend/src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { COURSE_ACRONYMS } from '../utils/courseAcronyms';
import '../components/AuthForm.css';

const GET_ME = gql`
query GetMe {
  me {
    first_name
    middle_name
    last_name
    email
    StudentId
    role

    suffix
    suffix_locked
    phone_number

    birthdate
    birthdate_locked
    age
    gender
    gender_locked
    nationality
    nationality_locked

    user_classification
    student_type
    college_department

    course
    program
    year_level
    vibration_enabled
    dark_mode
    two_factor_enabled
  }
}
`;

const CHANGE_PASSWORD = gql`
mutation ChangePassword(
  $currentPassword: String!
  $newPassword: String!
) {
  changePassword(
    currentPassword: $currentPassword
    newPassword: $newPassword
  )
}
`;

const CHECK_CHANGE_PASSWORD_STATUS = gql`
query CheckChangePasswordStatus {
  checkChangePasswordStatus {
    failedAttempts
    lockedUntil
  }
}
`;

const UPDATE_USER_INFORMATION = gql`
mutation UpdateUserInformation(
  $phone_number: String!
  $suffix: String
  $birthdate: String
  $age: Int
  $gender: String
  $nationality: String
  $user_classification: String
  $student_type: String
  $college_department: String
  $course: String
  $program: String
  $year_level: String
  $vibration_enabled: Boolean
  $dark_mode: Boolean
  $two_factor_enabled: Boolean
) {
  updateUserInformation(
    phone_number: $phone_number
    suffix: $suffix

    birthdate: $birthdate
    age: $age
    gender: $gender
    nationality: $nationality
    user_classification: $user_classification
    student_type: $student_type
    college_department: $college_department
    course: $course
    program: $program
    year_level: $year_level
    vibration_enabled: $vibration_enabled
    dark_mode: $dark_mode
    two_factor_enabled: $two_factor_enabled
  ) {
    id
    phone_number
    suffix
    gender
    vibration_enabled
    dark_mode
  }
}
`;

interface LinkedAccount {
  id: string;
  provider: string;
  email: string;
  linkedAt: string;
}

interface UserInfo {
  firstName: string;
  middleName: string;
  lastName: string;

  email: string;
  phoneNumber: string;

  suffix: string;
  suffixLocked: boolean;

  nationality: string;
  nationalityLocked: boolean;

  birthdate: string;
  birthdateLocked: boolean;

  age: number;

  gender: string;
  genderLocked: boolean;

  studentType: string;
  collegeDepartment: string;

  course: string;
  program: string;
  yearLevel: string;

  userClassification: string;
  vibration_enabled: boolean;
}

const suffixOptions = [
  '',
  'Jr.',
  'Sr.',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'PhD',
  'MD',
  'DDS',
  'DVM',
  'CPA',
  'RN',
  'Esq.',
];

const Settings: React.FC = () => {
  interface GetMeData {
    me: {
      first_name: string;
      middle_name: string;
      last_name: string;
      email: string;
      StudentId: string;
      role: string;

      suffix?: string;
      suffix_locked?: boolean;
      phone_number?: string;

      birthdate?: string;
      birthdate_locked?: boolean;

      gender?: string;
      gender_locked?: boolean;

      age?: number;

      nationality?: string;
      nationality_locked?: boolean;

      student_type?: string;
      college_department?: string;

      course?: string;
      program?: string;
      year_level?: string;

      user_classification?: string;
      vibration_enabled?: boolean;
      dark_mode?: boolean;
      two_factor_enabled?: boolean;
    };
  }

  const { data } = useQuery<GetMeData>(GET_ME, {
    fetchPolicy: 'no-cache',
  });

  const {
  data: changePasswordStatusData,
  refetch:
    refetchChangePasswordStatus
} = useQuery(
  CHECK_CHANGE_PASSWORD_STATUS,
  {
    fetchPolicy: 'no-cache',
  }
);
  const me = data?.me;

  // =========================
  // Main Settings State
  // =========================
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [notificationSoundVolume, setNotificationSoundVolume] = useState<number>(50);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [vibrationEnabled, setVibrationEnabled] =
    useState<boolean>(true);

  // =========================
  // Password Modal State
  // =========================
  const [showChangePasswordModal, setShowChangePasswordModal] =
    useState<boolean>(false);

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] =
    useState<string>('');

    const [
  passwordError,
  setPasswordError
] = useState('');

const [
  failedAttempts,
  setFailedAttempts
] = useState(0);

const [
  cooldownSeconds,
  setCooldownSeconds
] = useState(0);

const [
  isUpdatingPassword,
  setIsUpdatingPassword
] = useState(false);

    const [
  passwordStrength,
  setPasswordStrength
] = useState<
  '' |
  'weak' |
  'medium' |
  'strong' |
  'excellent'
>('');

const [
  passwordChecks,
  setPasswordChecks
] = useState({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false,
});

const [
  showCurrentPassword,
  setShowCurrentPassword
] = useState(false);

const [
  showNewPassword,
  setShowNewPassword
] = useState(false);

const [
  showConfirmPassword,
  setShowConfirmPassword
] = useState(false);
const evaluatePasswordStrength = (
  value: string
) => {

  const checks = {
    length: value.length >= 8,

    uppercase:
      /[A-Z]/.test(value),

    lowercase:
      /[a-z]/.test(value),

    number:
      /[0-9]/.test(value),

    special:
      /[!@#$%^&*(),.?":{}|<>]/.test(value),
  };

  setPasswordChecks(checks);

  if (!value.trim()) {
    setPasswordStrength('');
    return;
  }

  let passed = 0;

  if (checks.length) passed++;
  if (
    checks.uppercase &&
    checks.lowercase
  ) passed++;

  if (checks.number) passed++;
  if (checks.special) passed++;

  if (passed === 1) {
    setPasswordStrength('weak');
  }

  else if (passed === 2) {
    setPasswordStrength('medium');
  }

  else if (passed === 3) {
    setPasswordStrength('strong');
  }

  else if (passed === 4) {
    setPasswordStrength('excellent');
  }
};
  // =========================
  // Student Information State
  // =========================
  const [selectedYearLevel, setSelectedYearLevel] =
    useState<string>('1');

  // =========================
  // Profile Picture State
  // =========================

  const [profilePicturePreview, setProfilePicturePreview] =
    useState<string>('');

  // =========================
  // User Information State
  // =========================
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    middleName: '',
    lastName: '',

    email: '',
    phoneNumber: '',

    suffix: '',
    suffixLocked: false,

    nationality: '',
    nationalityLocked: false,

    birthdate: '',
    birthdateLocked: false,

    age: 0,

    gender: '',
    genderLocked: false,

    studentType: '',
    collegeDepartment: '',

    course: '',
    program: '',
    yearLevel: '',

    userClassification: '',
    vibration_enabled: true,
  });

  // =========================
  // Linked Accounts State
  // =========================
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([
    {
      id: '1',
      provider: 'Google',
      email: 'user@gmail.com',
      linkedAt: '2024-01-15',
    },
    {
      id: '2',
      provider: 'Facebook',
      email: 'juan.fb@facebook.com',
      linkedAt: '2024-02-20',
    },
    {
      id: '3',
      provider: 'Caraga State University',
      email: 'juandelacruz@carsu.edu.ph',
      linkedAt: '2024-03-10',
    },
  ]);

  const [showLinkModal, setShowLinkModal] =
    useState<boolean>(false);

  const [newAccountProvider, setNewAccountProvider] =
    useState<string>('Google');

  const [newAccountEmail, setNewAccountEmail] =
    useState<string>('');

  // =========================
  // Load Saved Settings
  // =========================
  useEffect(() => {
    const savedVolume = localStorage.getItem('notificationVolume');
    const savedTwoFactor = localStorage.getItem('twoFactorEnabled');
    const savedProfilePicture = localStorage.getItem('profilePicture');
    const savedDarkMode = localStorage.getItem('darkMode');

    // Dark Mode
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }

    // Volume
    if (savedVolume) {
      setNotificationSoundVolume(parseInt(savedVolume));
    }

    // Two Factor
    if (savedTwoFactor === 'true') {
      setTwoFactorEnabled(true);
    }

    // Profile Picture
    if (savedProfilePicture) {
      setProfilePicturePreview(savedProfilePicture);
    }

    // Logged In User
    const loggedInUser = localStorage.getItem('user');

    if (loggedInUser) {
      try {
        const parsedUser = JSON.parse(loggedInUser);

        setUserInfo((prev) => ({
          ...prev,
          firstName: parsedUser.first_name || '',
          middleName: parsedUser.middle_name || '',
          lastName: parsedUser.last_name || '',
          email: parsedUser.email || '',
        }));
      } catch (error) {
        console.error('Failed to load logged in user');
      }
    }
  }, []);

  const calculateAge = (birthdate: string): number => {
    if (!birthdate) return 0;

    const parts = birthdate.split('-').map(Number);

    if (parts.length !== 3) return 0;

    const [year, month, day] = parts;

    const today = new Date();

    let age = today.getFullYear() - year;

    const hasNotHadBirthday =
      today.getMonth() + 1 < month ||
      (today.getMonth() + 1 === month && today.getDate() < day);

    if (hasNotHadBirthday) age--;

    return age;
  };

  const normalizeBirthdate = (value?: string | null): string => {
    if (!value) return '';

    // already ISO format
    if (value.includes('-') && value.length >= 10) {
      return value.slice(0, 10);
    }

    // handle MM/DD/YYYY or DD/MM/YYYY
    if (value.includes('/')) {
      const [a, b, c] = value.split('/');

      // assume YYYY missing → convert carefully
      if (c.length === 4) {
        // MM/DD/YYYY → YYYY-MM-DD
        return `${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
      }

      return '';
    }

    // epoch support
    const num = Number(value);
    if (!isNaN(num)) {
      const date = new Date(num < 1e12 ? num * 1000 : num);
      return date.toISOString().slice(0, 10);
    }

    return '';
  };

  // =========================
  // Sync GraphQL User Data
  // =========================
  useEffect(() => {
    if (!data?.me) return;

    const me = data.me;

      // =========================
  // Two Factor Sync
  // =========================
  setTwoFactorEnabled(
    me?.two_factor_enabled ?? false
  );

    // =========================
    // Dark Mode Sync
    // =========================
    const darkModeEnabled =
      me.dark_mode ?? false;

    setIsDarkMode(
      darkModeEnabled
    );

    if (darkModeEnabled) {
      document.documentElement.classList.add(
        'dark-mode'
      );

      document.body.classList.add(
        'dark-mode'
      );

    } else {

      document.documentElement.classList.remove(
        'dark-mode'
      );

      document.body.classList.remove(
        'dark-mode'
      );
    }

    // =========================
    // Auto Calculate Age
    // =========================
    const computedAge = me?.birthdate
      ? calculateAge(normalizeBirthdate(me.birthdate))
      : 0;

    // =========================
    // User Info Sync
    // =========================
    setUserInfo((prev) => ({
      ...prev,

      firstName:
        me?.first_name || '',

      middleName:
        me?.middle_name || '',

      lastName:
        me?.last_name || '',

      email:
        me?.email || '',

      phoneNumber:
        me?.phone_number === 'N/A'
          ? ''
          : me?.phone_number || '',

      suffix:
        me?.suffix || '',

      suffixLocked:
        me?.suffix_locked || false,

      nationality:
        me?.nationality || '',

      nationalityLocked:
        me?.nationality_locked || false,



      birthdate: normalizeBirthdate(me?.birthdate),

      birthdateLocked:
        me?.birthdate_locked || false,

      age:
        computedAge,

      gender:
        me?.gender || '',

      genderLocked:
        me?.gender_locked || false,

      studentType:
        me?.student_type || '',

      collegeDepartment:
        me?.college_department || '',

      course:
        me?.course || '',

      program:
        me?.program || '',

      yearLevel:
        me?.year_level || '',

      userClassification:
        me?.user_classification || '',
    }));

    // =========================
    // Vibration Sync
    // =========================
    setVibrationEnabled(
      me?.vibration_enabled ?? true
    );

  }, [data]);

  useEffect(() => {

  const status =
    changePasswordStatusData
      ?.checkChangePasswordStatus;

  if (!status) return;

  setFailedAttempts(
    status.failedAttempts || 0
  );

  // RESET FIRST
  setCooldownSeconds(0);

  if (status.lockedUntil) {

    console.log(
      "LOCKED UNTIL:",
      status.lockedUntil
    );

    const lockedTime =
      new Date(
        status.lockedUntil
      ).getTime();

    console.log(
      "LOCKED TIME:",
      lockedTime
    );

    const updateCountdown = () => {

      const now =
        Date.now();

      const diff =
        Math.floor(
          (lockedTime - now) / 1000
        );

      console.log(
        "COUNTDOWN:",
        diff
      );

      setCooldownSeconds(
        diff > 0 ? diff : 0
      );
    };

    updateCountdown();

    const interval =
      setInterval(
        updateCountdown,
        1000
      );

    return () =>
      clearInterval(interval);
  }

}, [changePasswordStatusData]);

  // =========================
  // Helpers
  // =========================
  const validatePhoneNumber = (
    value: string
  ): string => {

    // Numbers only
    let digitsOnly =
      value.replace(/\D/g, '');

    // Must start with 9
    if (
      digitsOnly.length > 0 &&
      digitsOnly[0] !== '9'
    ) {
      return '';
    }

    // Max 10 digits only
    return digitsOnly.slice(0, 10);
  };

  const getCollegeDepartment = (
    course: string
  ): string => {

    const normalizedCourse =
      course.toUpperCase();

    if (
      normalizedCourse.includes("AGRICULTURE") ||
      normalizedCourse.includes("FOOD TECHNOLOGY")
    ) {
      return "College of Agriculture and Agri-Industries";
    }

    if (
      normalizedCourse.includes("EDUCATION") ||
      normalizedCourse.includes("GUIDANCE") ||
      normalizedCourse.includes("COUNSELING") ||
      normalizedCourse.includes("TEACHING")
    ) {
      return "College of Education";
    }

    if (
      normalizedCourse.includes("BIOLOGY") ||
      normalizedCourse.includes("CHEMISTRY") ||
      normalizedCourse.includes("PHYSICS") ||
      normalizedCourse.includes("MATHEMATICS") ||
      normalizedCourse.includes("MARINE BIOLOGY")
    ) {
      return "College of Mathematics and Natural Sciences";
    }

    if (
      normalizedCourse.includes("SOCIOLOGY") ||
      normalizedCourse.includes("PSYCHOLOGY") ||
      normalizedCourse.includes("SOCIAL WORK")
    ) {
      return "College of Humanities and Social Sciences";
    }

    if (
      normalizedCourse.includes("COMPUTER SCIENCE") ||
      normalizedCourse.includes("INFORMATION SYSTEM") ||
      normalizedCourse.includes("INFORMATION TECHNOLOGY")
    ) {
      return "College of Computing and Information Sciences";
    }

    if (
      normalizedCourse.includes("ENGINEERING") ||
      normalizedCourse.includes("ARCHITECTURE") ||
      normalizedCourse.includes("GEOLOGY")
    ) {
      return "College of Engineering and Geo-Sciences";
    }

    if (
      normalizedCourse.includes("FORESTRY") ||
      normalizedCourse.includes("ENVIRONMENTAL")
    ) {
      return "College of Forestry and Environmental Science";
    }

    if (
      normalizedCourse.includes("MEDICINE")
    ) {
      return "College of Medicine";
    }

    return "";
  };

  const getCollegeAcronym = (
    department: string
  ): string => {

    switch (department) {

      case "College of Agriculture and Agri-Industries":
        return "CAA";

      case "College of Education":
        return "CED";

      case "College of Mathematics and Natural Sciences":
        return "CMNS";

      case "College of Humanities and Social Sciences":
        return "CHASS";

      case "College of Computing and Information Sciences":
        return "CCIS";

      case "College of Engineering and Geo-Sciences":
        return "CEGS";

      case "College of Forestry and Environmental Science":
        return "COFES";

      case "College of Medicine":
        return "CM";

      default:
        return "";
    }
  };

  // =========================
  // Mock API
  // =========================
  const mockApiCall = async (data: any): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('API Update:', data);
        resolve();
      }, 500);
    });
  };

  const updateSetting = async (
    key: string,
    value: any
  ): Promise<void> => {
    await mockApiCall({ [key]: value });

    setSuccessMessage(`Updated ${key} successfully!`);

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // =========================
  // Theme Settings
  // =========================
  const updateThemeSetting = (
    key: string,
    value: boolean
  ): void => {
    setIsDarkMode(value);

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



  // =========================
  // Volume Handler
  // =========================
  const handleVolumeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const volume = parseInt(e.target.value);

    setNotificationSoundVolume(volume);

    localStorage.setItem(
      'notificationVolume',
      volume.toString()
    );

    updateSetting('volume', volume);
  };

  // =========================
  // Phone Number Handler
  // =========================
  const handlePhoneNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {

    const rawValue =
      e.target.value;

    const cleanedValue =
      rawValue.replace(
        /^\+63/,
        ''
      );

    const validatedDigits =
      validatePhoneNumber(
        cleanedValue
      );

    // Prevent invalid first digit
    if (
      cleanedValue.length > 0 &&
      validatedDigits === ''
    ) {
      return;
    }

    setUserInfo((prev) => ({
      ...prev,
      phoneNumber:
        validatedDigits,
    }));
  };

  const handleSuffixChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    if (userInfo.suffixLocked) return;

    setUserInfo((prev) => ({
      ...prev,
      suffix: e.target.value,
    }));
  };

  // =========================
  // Save User Information
  // =========================
  const [updateUserInformationMutation] =
    useMutation(UPDATE_USER_INFORMATION);

    const [changePasswordMutation] =
  useMutation(CHANGE_PASSWORD);

  const saveUserInfo = async (): Promise<void> => {
    try {

      await updateUserInformationMutation({
        variables: {
          phone_number: userInfo.phoneNumber,
          suffix: userInfo.suffix || null,
          birthdate: userInfo.birthdate || null,
          age: userInfo.age || null,
          gender: userInfo.gender || null,
          nationality: userInfo.nationality || null,
          user_classification: userInfo.userClassification || null,
          student_type: userInfo.studentType || null,
          college_department: userInfo.collegeDepartment || null,
          course: userInfo.course || null,
          program: userInfo.program || null,
          year_level: userInfo.yearLevel || null,
          vibration_enabled: vibrationEnabled || false,
          dark_mode: isDarkMode,
          two_factor_enabled: twoFactorEnabled,
        },
      });

      setSuccessMessage(
        'User information updated successfully!'
      );

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {

      console.error(error);

      alert('Failed to update user information');
    }
  };

  // =========================
  // Save Academic Information
  // =========================
 const saveAcademicInfo = async (): Promise<void> => {
  try {

    const computedCollegeDepartment =
      getCollegeDepartment(userInfo.course);

    const computedProgram =
      COURSE_ACRONYMS[userInfo.course] || "";

    await updateUserInformationMutation({
      variables: {
        phone_number: userInfo.phoneNumber || "",

        user_classification: userInfo.userClassification || null,
        student_type:
          userInfo.userClassification === "Student"
            ? userInfo.studentType || null
            : null,
        year_level: userInfo.yearLevel || null,

        suffix: userInfo.suffix || null,
        birthdate: userInfo.birthdate || null,
        age: userInfo.age || null,
        gender: userInfo.gender || null,
        nationality: userInfo.nationality || null,

        // ✅ THESE ARE THE IMPORTANT FIXES
        college_department: computedCollegeDepartment || null,
        program: computedProgram || null,

        course: userInfo.course || null,

        vibration_enabled: vibrationEnabled || false,
        dark_mode: isDarkMode,
        two_factor_enabled: twoFactorEnabled,
      },
    });

    setSuccessMessage("Academic information updated successfully!");

    setTimeout(() => setSuccessMessage(""), 3000);

  } catch (error) {
    console.error(error);
    alert("Failed to update academic information");
  }
};


  // =========================
  // Update Password
  // =========================
 const updatePassword = async (): Promise<void> => {

if (isUpdatingPassword) {
  return;
}
  if (
    !currentPassword ||
    !newPassword ||
    !confirmNewPassword
  ) {
    alert(
      'Please fill in all fields'
    );
    return;
  }

  if (
  currentPassword ===
  newPassword
) {
  alert(
    'New password cannot be the same as current password.'
  );
  return;
}

if (
  !passwordChecks.length ||
  !passwordChecks.uppercase ||
  !passwordChecks.lowercase ||
  !passwordChecks.number ||
  !passwordChecks.special
) {
  alert(
    'Please create a stronger password.'
  );
  return;
}

  if (
    newPassword !==
    confirmNewPassword
  ) {
    alert(
      'Passwords do not match!'
    );
    return;
  }

  if (
    newPassword.length < 8
  ) {
    alert(
      'Password must be at least 8 characters'
    );
    return;
  }
  setIsUpdatingPassword(true);

setPasswordError('');

  try {

    await changePasswordMutation({
      variables: {
        currentPassword,
        newPassword,
      },
    });

    setSuccessMessage(
      'Password updated successfully!'
    );

    setShowChangePasswordModal(
      false
    );

    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

  } catch (error: any) {

  console.error(error);

  const errorMessage =
    error?.graphQLErrors?.[0]?.message ||
    error?.message ||
    'Failed to update password';

  setPasswordError(
    errorMessage
  );
  const updated =
  await refetchChangePasswordStatus();

console.log(updated.data);
} finally {

  setIsUpdatingPassword(false);
}
};

  // =========================
  // Profile Picture Upload
  // =========================
  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {

    try {

      // =========================
      // 📸 GET FILE
      // =========================
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      // =========================
      // 👤 CURRENT USER
      // =========================
      const currentUser =
        JSON.parse(
          localStorage.getItem("user") || "{}"
        );

      // =========================
      // 🎓 GET STUDENT ID
      // =========================
      const studentId =
        currentUser.StudentId;

      if (!studentId) {

        alert(
          "Student ID not found"
        );

        return;
      }

      // =========================
      // 📦 CREATE FORM DATA
      // =========================
      const formData =
        new FormData();

      formData.append(
        "studentId",
        studentId
      );

      formData.append(
        "uploadType",
        "profile-picture"
      );

      formData.append(
        "image",
        file
      );

      // =========================
      // 🌐 API URL
      // =========================
      const API_BASE_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:4000";

      // =========================
      // 🚀 UPLOAD REQUEST
      // =========================
      const response =
        await fetch(
          `${API_BASE_URL}/api/upload-profile-picture`,
          {
            method: "POST",
            body: formData,
          }
        );

      // =========================
      // ❌ FAILED
      // =========================
      if (!response.ok) {

        const errorData =
          await response.json();

        throw new Error(
          errorData.message ||
          "Upload failed"
        );
      }

      // =========================
      // ✅ SUCCESS RESPONSE
      // =========================
      const data =
        await response.json();
      console.log("UPLOAD RESPONSE:", data);
      const imageUrl =
        data.imageUrl;

      // =========================
      // 🖼 UPDATE UI PREVIEW
      // =========================
      setProfilePicturePreview(
        imageUrl
      );

      // =========================
      // 💾 UPDATE USER OBJECT
      // =========================
      const updatedUser = {

        ...currentUser,

        profile_picture:
          imageUrl,
      };

      // =========================
      // 💾 SAVE UPDATED USER
      // =========================
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      window.dispatchEvent(
        new Event("profilePictureUpdated")
      );

      // =========================
      // 💾 OPTIONAL LEGACY SAVE
      // =========================
      localStorage.setItem(
        "profilePicture",
        imageUrl
      );

      // =========================
      // ✅ SUCCESS MESSAGE
      // =========================
      setSuccessMessage(
        "Profile picture updated!"
      );

      setTimeout(() => {

        setSuccessMessage("");

      }, 3000);

    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Failed to upload profile picture"
      );
    }
  };

  // =========================
  // Unlink Account
  // =========================
  const handleUnlinkAccount = async (
    accountId: string
  ): Promise<void> => {
    setLinkedAccounts((prev) =>
      prev.filter((account) => account.id !== accountId)
    );

    await mockApiCall({
      unlinkedAccount: accountId,
    });

    setSuccessMessage('Account unlinked successfully!');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // =========================
  // Link Account
  // =========================
  const handleLinkAccount = async (): Promise<void> => {
    if (!newAccountEmail) {
      alert('Please enter an email address');
      return;
    }

    if (
      newAccountProvider ===
      'Caraga State University' &&
      !newAccountEmail.endsWith('@carsu.edu.ph')
    ) {
      alert(
        'CARSU account email must end with @carsu.edu.ph'
      );
      return;
    }

    const newAccount: LinkedAccount = {
      id: Date.now().toString(),
      provider: newAccountProvider,
      email: newAccountEmail,
      linkedAt: new Date()
        .toISOString()
        .split('T')[0],
    };

    setLinkedAccounts((prev) => [
      ...prev,
      newAccount,
    ]);

    await mockApiCall({
      linkedAccount: newAccount,
    });

    setSuccessMessage(
      `${newAccountProvider} account linked successfully!`
    );

    setShowLinkModal(false);

    setNewAccountEmail('');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className={`settings-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      

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

              {/* NAME ROW */}
              <div
                className="name-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                }}
              >
                <div className="form-field name-field">
                  <label>First Name</label>

                  <input
                    type="text"
                    value={userInfo.firstName}
                    readOnly
                    disabled
                    className="readonly-input"
                  />
                </div>

                <div className="form-field name-field">
                  <label>Middle Name</label>

                  <input
                    type="text"
                    value={userInfo.middleName}
                    readOnly
                    disabled
                    className="readonly-input"
                  />
                </div>

                <div className="form-field name-field">
                  <label>Last Name</label>

                  <input
                    type="text"
                    value={userInfo.lastName}
                    readOnly
                    disabled
                    className="readonly-input"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="form-field">
                <label>Email Address</label>

                <input
                  type="email"
                  value={userInfo.email}
                  readOnly
                  disabled
                  className="readonly-input"
                />
              </div>

              {/* PERSONAL INFO COMPACT ROW */}
              <div
                className="compact-info-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 0.7fr 0.7fr 1fr 1fr',
                  gap: '1rem',
                  alignItems: 'start',
                }}
              >


                {/* SUFFIX */}
                <div className="form-field suffix-field">
                  <label>Suffix</label>

                  <select
                    value={userInfo.suffix}
                    onChange={handleSuffixChange}
                    disabled={userInfo.suffixLocked}
                    className={
                      userInfo.suffixLocked
                        ? 'readonly-input'
                        : ''
                    }
                  >
                    {suffixOptions.map((suffix) => (
                      <option key={suffix} value={suffix}>
                        {suffix || 'Select suffix'}
                      </option>
                    ))}
                  </select>

                  <small className="field-hint">
                    {userInfo.suffixLocked
                      ? 'Locked'
                      : 'Editable once'}
                  </small>
                  <small className="field-hint">
  If any of the information above is incorrect<br />
  Please refer to the Feedback section<br />
  For correction request
</small>
                </div>

                {/* BIRTHDATE */}
                <div className="form-field">
                  <label>Birthdate</label>

                  <input
                    type="date"
                    value={userInfo.birthdate}
                    disabled={userInfo.birthdateLocked}
                    className={
                      userInfo.birthdateLocked
                        ? 'readonly-input'
                        : ''
                    }
                    onChange={(e) => {
                      const newBirthdate = e.target.value;

                      setUserInfo((prev) => ({
                        ...prev,
                        birthdate: newBirthdate,
                        age: calculateAge(newBirthdate),
                      }));
                    }}
                  />

                  <small className="field-hint">
                    {userInfo.birthdateLocked
                      ? 'Locked'
                      : 'Editable once'}
                  </small>
                </div>

                {/* AGE */}
                <div className="form-field">
                  <label>Age</label>

                  <input
                    type="text"
                    value={userInfo.age}
                    readOnly
                    disabled
                    className="readonly-input"
                  />
                </div>

                {/* GENDER */}
                <div className="form-field">
                  <label>Gender</label>

                  <select
                    value={userInfo.gender}
                    disabled={userInfo.genderLocked}
                    className={
                      userInfo.genderLocked
                        ? 'readonly-input'
                        : ''
                    }
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>

                  <small className="field-hint">
                    {userInfo.genderLocked
                      ? 'Locked'
                      : 'Editable once'}
                  </small>
                </div>

                {/* NATIONALITY */}
                <div className="form-field">
                  <label>Nationality</label>

                  <select
                    value={userInfo.nationality}
                    disabled={userInfo.nationalityLocked}
                    className={
                      userInfo.nationalityLocked
                        ? 'readonly-input'
                        : ''
                    }
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        nationality: e.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Select Nationality
                    </option>

                    <option value="Filipino">
                      Filipino
                    </option>

                    <option value="American">
                      American
                    </option>

                    <option value="Japanese">
                      Japanese
                    </option>

                    <option value="Korean">
                      Korean
                    </option>

                    <option value="Chinese">
                      Chinese
                    </option>

                    <option value="Lithuanian">
                      Lithuanian
                    </option>

                    <option value="Pakistani">
                      Pakistani
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                  <small className="field-hint">
                    {userInfo.nationalityLocked
                      ? 'Locked'
                      : 'Editable once'}
                  </small>

                  <small
                    className="field-hint"
                    style={{
                      marginTop: '0.35rem',
                      display: 'block',
                    }}
                  >
                    If your nationality is not listed, please submit a request through the
                    Feedback section for assistance.
                  </small>
                </div>


                {/* PHONE */}
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

                  <small className="field-hint">
                    Enter 10 digits after +63
                  </small>
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="btn-primary"
                onClick={saveUserInfo}
                style={{ marginTop: '0.5rem' }}
              >
                Save User Information
              </button>

            </div>
          </div>

          {/* Academic Information */}
          <div className="section-card">
            <h3>Academic Information</h3>

            <div className="form-stack">

              {/* USER CLASSIFICATION */}
              <div className="form-field">
                <label>User Classification</label>

                <select
                  value={userInfo.userClassification}
                  onChange={(e) => {

                    const classification =
                      e.target.value;

                    setUserInfo((prev) => ({
                      ...prev,

                      userClassification:
                        classification,

                      // auto clear kapag hindi student
                      studentType:
  classification === "Student"
    ? prev.studentType
    : "",
                    }));
                  }}
                >
                  <option value="">
                    Select Classification
                  </option>

                  <option value="Student">
                    Student
                  </option>

                  <option value="Staff">
                    Staff
                  </option>

                  <option value="Visitor">
                    Visitor
                  </option>
                </select>
              </div>

              {/* STUDENT TYPE */}
              <div className="form-field">
                <label>Student Type</label>

                <select
                  value={userInfo.studentType}
                  disabled={
                    userInfo.userClassification !==
                    "Student"
                  }
                  onChange={(e) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      studentType:
                        e.target.value,
                    }))
                  }
                  className={
                    userInfo.userClassification !==
                      "Student"
                      ? "readonly-input disabled-select"
                      : ""
                  }
                >
                  <option value="">
                    {userInfo.userClassification !==
                      "Student"
                      ? "Locked for non-students"
                      : "Select Student Type"}
                  </option>

                  <option value="Regular">
                    Regular
                  </option>

                  <option value="Irregular">
                    Irregular
                  </option>
                </select>
              </div>

              {/* COLLEGE + ACRONYM */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 180px",
                  gap: "1rem",
                }}
              >

                {/* FULL COLLEGE NAME */}
                <div className="form-field">
                  <label>
                    College Department
                  </label>

                  <input
                    type="text"
                    readOnly
                    disabled
                    className="readonly-input"
                    value={getCollegeDepartment(userInfo.course)}
                  />

                </div>

                {/* AUTO GENERATED ACRONYM */}
                <div className="form-field">
                  <label>Acronym</label>

                  <input
                    type="text"
                    readOnly
                    disabled
                    className="readonly-input"
                    value={getCollegeAcronym(
                      getCollegeDepartment(userInfo.course)
                    )}
                  />

                </div>
              </div>

              {/* COURSE + ACRONYM */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 180px",
                  gap: "1rem",
                }}
              >

                {/* CURRENT COURSE */}
                <div className="form-field">
                  <label>Current Course</label>

                  <input
                    type="text"
                    value={userInfo.course}
                    readOnly
                    disabled
                    className="readonly-input"
                  />

                  <small
                    className="field-hint"
                    style={{
                      marginTop: "0.5rem",
                      display: "block",
                    }}
                  >
                    To request a course change, please submit your concern through
                    the Feedback section located in the sidebar. Course updates are
                    managed by the administrator to avoid data inconsistencies.
                  </small>
                </div>

                {/* AUTO GENERATED COURSE ACRONYM */}
                <div className="form-field">
                  <label>Acronym</label>

                  <input
                    type="text"
                    readOnly
                    disabled
                    className="readonly-input"
                    value={
                      COURSE_ACRONYMS[userInfo.course] || ""
                    }
                  />
                </div>
              </div>

              {/* YEAR LEVEL */}
              <div className="form-field">
                <label>Edit Year Level</label>

                <select
                  value={userInfo.yearLevel}
                  onChange={(e) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      yearLevel: e.target.value,
                    }))
                  }
                  className="year-select"
                >
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                  <option value="5+">Fifth Year and Above</option>
                </select>
              </div>

              <button
  className="btn-primary"
  onClick={saveAcademicInfo}
  style={{ marginTop: "0.75rem" }}
>
  Save Academic Information
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
                onChange={async (e) => {
                  const value = e.target.checked;

                  updateThemeSetting('darkMode', value);

                  try {
                    await updateUserInformationMutation({
                      variables: {
                        phone_number: userInfo.phoneNumber || "",
                        dark_mode: value,
                      },
                    });

                    console.log(
                      "Dark mode saved to database:",
                      value
                    );

                  } catch (error) {
                    console.error(
                      "Failed to save dark mode:",
                      error
                    );
                  }
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
                onChange={async (e) => {
  const value = e.target.checked;

  setTwoFactorEnabled(value);

  try {
    await updateUserInformationMutation({
      variables: {
        phone_number: userInfo.phoneNumber || "",
        two_factor_enabled: value,
      },
    });

    console.log(
      "2-Step Verification saved to database:",
      value
    );

  } catch (error) {
    console.error(
      "Failed to save 2-Step Verification:",
      error
    );
  }
}}
              />
            </div>
            <div className="form-group">
              <label>Account Security</label>
              <button className="btn-primary" 
              onClick={() => setShowChangePasswordModal(true)}>
                Change Password
              </button>
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
                checked={vibrationEnabled}
                onChange={(e) =>
                  setVibrationEnabled(e.target.checked)
                }
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

<div className="password-wrapper">
  <input
    type={
      showCurrentPassword
        ? 'text'
        : 'password'
    }
    value={currentPassword}
   onChange={(e) => {

  setCurrentPassword(
    e.target.value
  );

  setPasswordError('');
}}
  />

  <button
    type="button"
    className="toggle-password"
    onClick={() =>
      setShowCurrentPassword(
        !showCurrentPassword
      )
    }
  >
    {showCurrentPassword
      ? 'Hide'
      : 'Show'}
  </button>
</div>
{passwordError && (

  <small
    style={{
      color: '#ef4444',
      fontWeight: 600,
      marginTop: '-0.4rem',
      display: 'block',
    }}
  >
    {passwordError}
  </small>

)}<div
  style={{
    marginTop: '0.65rem',
    fontWeight: 700,
    fontSize: '0.82rem',

    color:
      failedAttempts >= 5
        ? '#ef4444'
        : failedAttempts >= 3
        ? '#f59e0b'
        : '#22c55e',

    textShadow:
      failedAttempts >= 5
        ? '0 0 12px rgba(239,68,68,0.5)'
        : failedAttempts >= 3
        ? '0 0 10px rgba(245,158,11,0.4)'
        : '0 0 8px rgba(34,197,94,0.35)',
  }}
>
  Attempts:
  {' '}
  {failedAttempts}/5
</div>
{cooldownSeconds > 0 && (

  <div
    style={{
      marginTop: '0.5rem',
      color: '#ef4444',
      fontWeight: 700,
      fontSize: '0.82rem',
    }}
  >
    Too many attempts.
    Try again in {' '}

    {Math.floor(
      cooldownSeconds / 60
    )}
    :
    {String(
      cooldownSeconds % 60
    ).padStart(2, '0')}
  </div>

)}
                 <label>New Password</label>

<div className="password-wrapper">
  <input
    type={
      showNewPassword
        ? 'text'
        : 'password'
    }
    value={newPassword}
    onChange={(e) => {

      const value =
        e.target.value;

      setNewPassword(value);
      setPasswordError('');
      evaluatePasswordStrength(
        value
      );
    }}
  />

  <button
    type="button"
    className="toggle-password"
    onClick={() =>
      setShowNewPassword(
        !showNewPassword
      )
    }
  >
    {showNewPassword
      ? 'Hide'
      : 'Show'}
  </button>
</div>
<div className="password-checks">

  <span
    className={
      passwordChecks.length
        ? 'valid-check'
        : 'invalid-check'
    }
  >
    {passwordChecks.length
      ? '✓'
      : '✗'} 8+ characters
  </span>

  <span
    className={
      passwordChecks.uppercase &&
      passwordChecks.lowercase
        ? 'valid-check'
        : 'invalid-check'
    }
  >
    {passwordChecks.uppercase &&
    passwordChecks.lowercase
      ? '✓'
      : '✗'} Uppercase & lowercase
  </span>

  <span
    className={
      passwordChecks.number
        ? 'valid-check'
        : 'invalid-check'
    }
  >
    {passwordChecks.number
      ? '✓'
      : '✗'} Number
  </span>

  <span
    className={
      passwordChecks.special
        ? 'valid-check'
        : 'invalid-check'
    }
  >
    {passwordChecks.special
      ? '✓'
      : '✗'} Special character
  </span>

</div>
            <label>Confirm Password</label>

<div className="password-wrapper">
  <input
    type={
      showConfirmPassword
        ? 'text'
        : 'password'
    }
    value={confirmNewPassword}
    onChange={(e) => {

  setConfirmNewPassword(
    e.target.value
  );

  setPasswordError('');
}}
  />

  <button
    type="button"
    className="toggle-password"
    onClick={() =>
      setShowConfirmPassword(
        !showConfirmPassword
      )
    }
  >
    {showConfirmPassword
      ? 'Hide'
      : 'Show'}
  </button>
</div>
{confirmNewPassword && (

  <small
    style={{
      color:
        newPassword ===
        confirmNewPassword
          ? '#22c55e'
          : '#ef4444',
    }}
  >
    {
      newPassword ===
      confirmNewPassword
        ? '✓ Passwords match'
        : '✗ Passwords do not match'
    }
  </small>

)}
                </div>
                <div className="modal-actions">
                  <button
  className={
    failedAttempts < 5 &&
    currentPassword &&
    newPassword &&
    confirmNewPassword &&
    newPassword ===
      confirmNewPassword &&
    currentPassword !==
      newPassword &&
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special
      ? 'btn-save'
      : 'btn-save-disabled'
  }
  disabled={
    failedAttempts >= 5 ||
    cooldownSeconds > 0 ||
    isUpdatingPassword ||
    !currentPassword ||
    !newPassword ||
    !confirmNewPassword ||
    newPassword !==
      confirmNewPassword ||
    currentPassword ===
      newPassword ||
    !passwordChecks.length ||
    !passwordChecks.uppercase ||
    !passwordChecks.lowercase ||
    !passwordChecks.number ||
    !passwordChecks.special
  }
  onClick={updatePassword}
>
  {
    isUpdatingPassword
      ? 'Updating...'
      : 'Update'
  }
</button>
                  <button className="btn-cancel" onClick={() => {

  setShowChangePasswordModal(
    false
  );

  setCurrentPassword('');
  setNewPassword('');
  setConfirmNewPassword('');

  setPasswordError('');

  setPasswordStrength('');

  setPasswordChecks({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
}}>Cancel</button>
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
/* =========================================================
   RESET + ROOT
========================================================= */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  min-height: 100%;
}

:root {

  --bg: #f8fafc;
  --card-bg: #ffffff;

  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;

  --border: #e2e8f0;
  --border-strong: #cbd5e1;

  --primary: #3b82f6;
  --primary-hover: #2563eb;

  --success: #22c55e;
  --success-hover: #16a34a;

  --danger: #ef4444;
  --danger-hover: #dc2626;

  --shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 4px 12px rgba(15, 23, 42, 0.04);

  --transition: all 0.25s ease;
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  transition: var(--transition);
}

/* =========================================================
   DARK MODE
========================================================= */
body.dark-mode {
  --bg: #0f172a;
  --card-bg: #1e293b;

  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;

  --border: #334155;
  --border-strong: #475569;

  background: var(--bg);
}

/* =========================================================
   WRAPPER
========================================================= */
.settings-wrapper {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: var(--bg);
}

/* =========================================================
   SETTINGS CONTAINER
========================================================= */
.settings-container {
  flex: 1;
  height: 100vh;

  overflow-y: auto;
  overflow-x: hidden;

  padding: 2rem 2.5rem;

  scrollbar-width: thin;
  scrollbar-gutter: stable;

  background: var(--bg);
}

/* SCROLLBAR */
.settings-container::-webkit-scrollbar {
  width: 10px;
}

.settings-container::-webkit-scrollbar-track {
  background: #e2e8f0;
}

.settings-container::-webkit-scrollbar-thumb {
  background: #94a3b8;
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

/* =========================================================
   MAIN CONTENT
========================================================= */
.main-content {
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
}

.settings-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;

  margin-bottom: 1.5rem;

  color: var(--text-primary);
}

/* =========================================================
   SECTION CARD
========================================================= */
.section-card {
  background: var(--card-bg);

  border: 1px solid var(--border);
  border-radius: 18px;

  padding: 1.5rem 1.75rem;
  margin-bottom: 1.5rem;

  box-shadow: var(--shadow);

  transition: var(--transition);
}

.section-card:hover {
  transform: translateY(-1px);
}

.section-card h3 {
  font-size: 1.15rem;
  font-weight: 700;

  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;

  border-bottom: 1px solid var(--border);

  color: var(--text-primary);
}

.dark-mode .section-card h3 {
  color: #38bdf8;
}

/* =========================================================
   FORM STACK
========================================================= */
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* =========================================================
   FORM GROUP
========================================================= */
.form-group {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 1rem;
  flex-wrap: wrap;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* =========================================================
   FORM FIELD
========================================================= */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}

.form-field label {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--text-muted);
}

/* =========================================================
   INPUTS + SELECTS
========================================================= */
.form-stack input,
.form-stack select,
.form-field input,
.form-field select,
.modal-content input,
.modal-content select {
  width: 100%;

  padding: 0.78rem 0.9rem;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--card-bg);
  color: var(--text-primary);

  font-size: 0.95rem;
  font-weight: 500;

  outline: none;

  transition: var(--transition);
}

.form-stack select option,
.form-field select option {
  background: var(--card-bg);
  color: var(--text-primary);
}

.form-stack input:focus,
.form-stack select:focus,
.form-field input:focus,
.form-field select:focus,
.modal-content input:focus,
.modal-content select:focus {
  border-color: var(--primary);
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* =========================================================
   FIELD HINT
========================================================= */
.field-hint,
.email-hint {
  font-size: 0.74rem;
  line-height: 1.4;
  color: var(--text-muted);
}

/* =========================================================
   NAME ROW
========================================================= */
.name-row {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.name-field {
  flex: 1;
}

/* =========================================================
   PHONE INPUT
========================================================= */
.phone-input-wrapper {
  display: flex;
  align-items: center;

  overflow: hidden;

  min-width: 200px; /* slightly wider */

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--card-bg);
}

.phone-prefix {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  padding: 0.78rem 1rem;

  border-right: 1px solid var(--border);

  background: var(--border);

  font-weight: 700;
  color: var(--text-primary);

  white-space: nowrap;
}

.flag-icon {
  font-size: 1.05rem;
}

.phone-number-input {
  flex: 1 !important;
  min-width: 140px; /* para di matakpan last digit */

  border: none !important;
  border-radius: 0 !important;

  background: transparent !important;

  box-shadow: none !important;
}

.phone-number-input:focus {
  outline: none;
}

/* =========================================================
   READONLY
========================================================= */
.readonly-input {
  background: #e2e8f0 !important;
  border: 1px solid #cbd5e1 !important;

  color: #475569 !important;

  cursor: not-allowed;
  opacity: 1 !important;
}

.readonly-input:disabled {
  opacity: 1 !important;
}

.dark-mode .readonly-input,
.dark-mode .readonly-input:disabled {
  background: #334155 !important;
  border: 1px solid #475569 !important;

  color: #94a3b8 !important;
}

/* =========================================================
   SUFFIX
========================================================= */
.suffix-field select {
  width: 220px;
}

/* =========================================================
   RANGE
========================================================= */
.range-container {
  display: flex;
  align-items: center;
  gap: 1rem;

  flex: 1;
}

.range-container input[type="range"] {
  flex: 1;
  height: 6px;

  border: none;
  border-radius: 999px;

  background: var(--border);
}

.range-container span {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.max-label {
  font-size: 0.74rem !important;
  color: var(--text-muted) !important;
}

/* =========================================================
   BUTTONS
========================================================= */
.btn-primary,
.btn-save,
.btn-cancel,
.btn-unlink,
.btn-link-new {
  border: none;
  outline: none;

  cursor: pointer;

  transition: var(--transition);

  font-weight: 700;
}

/* PRIMARY */
.btn-primary {
  background: var(--primary);
  color: white;

  padding: 0.7rem 1.2rem;

  border-radius: 10px;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

/* SAVE */
.btn-save {
  background: var(--success);
  color: white;

  padding: 0.6rem 1.2rem;

  border-radius: 8px;
}

.btn-save:hover {
  background: var(--success-hover);
}

.btn-save-disabled {
  background: #475569;
  color: #94a3b8;

  padding: 0.6rem 1.2rem;

  border-radius: 8px;

  cursor: not-allowed;
  opacity: 0.7;
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;

  right: 10px;
  top: 50%;

  transform: translateY(-50%);

  border: none;
  background: transparent;

  cursor: pointer;

  font-size: 0.75rem;
  font-weight: 700;

  color: var(--primary);
}

.password-checks {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 0.45rem;

  margin-top: 0.75rem;

  font-size: 0.78rem;
  font-weight: 600;
}

.valid-check {
  color: #22c55e;
}

.invalid-check {
  color: #ef4444;
}

/* CANCEL */
.btn-cancel {
  background: #64748b;
  color: white;

  padding: 0.6rem 1.2rem;

  border-radius: 8px;
}

.btn-cancel:hover {
  background: #475569;
}

/* UNLINK */
.btn-unlink {
  background: var(--danger);
  color: white;

  padding: 0.45rem 1rem;

  border-radius: 8px;

  font-size: 0.82rem;
}

.btn-unlink:hover {
  background: var(--danger-hover);
}

/* LINK NEW */
.btn-link-new {
  width: 100%;

  margin-top: 1rem;

  background: var(--success);
  color: white;

  padding: 0.8rem 1rem;

  border-radius: 10px;
}

.btn-link-new:hover {
  background: var(--success-hover);
}

/* =========================================================
   SUCCESS MESSAGE
========================================================= */
.success-message {
  position: fixed;
  top: 20px;
  right: 25px;

  display: flex;
  align-items: center;

  padding: 0.9rem 1.1rem;

  border-left: 4px solid #22c55e;
  border-radius: 10px;

  background: #dcfce7;
  color: #166534;

  font-weight: 600;

  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);

  z-index: 9999;

  animation: slideInToast 0.25s ease;
}

@keyframes slideInToast {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dark-mode .success-message {
  background: #14532d;
  color: #bbf7d0;
}

/* =========================================================
   LINKED ACCOUNTS
========================================================= */
.linked-account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 1rem;

  padding: 1rem 0;

  border-bottom: 1px solid var(--border);
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-provider {
  font-size: 1rem;
  font-weight: 700;

  color: var(--text-primary);
}

.account-email {
  font-size: 0.84rem;
  color: var(--text-muted);
}

.account-date {
  font-size: 0.72rem;
  color: #94a3b8;
}

/* =========================================================
   PROFILE PREVIEW
========================================================= */
.profile-preview {
  margin-top: 1rem;
  text-align: center;
}

.profile-img {
  width: 90px;
  height: 90px;

  border-radius: 50%;

  object-fit: cover;

  border: 3px solid var(--primary);

  box-shadow:
    0 4px 12px rgba(59, 130, 246, 0.25);
}

/* =========================================================
   ABOUT SECTION
========================================================= */
.about-section {
  padding: 1.5rem;

  text-align: center;

  font-size: 0.82rem;
  line-height: 1.8;

  color: var(--text-muted);
}

/* =========================================================
   MODAL
========================================================= */
.modal-overlay {
  position: fixed;
  inset: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 1rem;

  background: rgba(15, 23, 42, 0.75);

  z-index: 1000;

  backdrop-filter: blur(4px);
}

.modal-content {
  width: 450px;
  max-width: 100%;

  padding: 1.75rem;

  border-radius: 18px;

  background: var(--card-bg);

  border: 1px solid var(--border);

  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.25);
}

.modal-content h3 {
  margin-bottom: 1.25rem;
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  margin-top: 1.5rem;
}

/* =========================================================
   CHECKBOX
========================================================= */
input[type="checkbox"] {
  width: 1.15rem;
  height: 1.15rem;

  cursor: pointer;

  accent-color: var(--primary);
}

/* =========================================================
   YEAR SELECT
========================================================= */
.year-select {
  max-width: 260px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }

  .section-card {
    padding: 1rem;
  }

  .settings-title {
    font-size: 1.6rem;
  }

  .form-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .linked-account-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .name-row {
    flex-direction: column;
  }

  .phone-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .phone-prefix {
    border-right: none;
    border-bottom: 1px solid var(--border);
    width: 100%;
  }

  .suffix-field select {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }
}
`}</style>
    </div>
  );
};

export default Settings;