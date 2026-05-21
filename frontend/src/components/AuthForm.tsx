// frontend/src/components/AuthForm.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './AuthForm.css';

type Props = {
  title: string;
  buttonText: string;
  isLocked?: boolean;
  lockCountdown?: number;

  emailError?: string;
  studentIdError?: string;

  setEmailError?: (value: string) => void;
  setStudentIdError?: (value: string) => void;
      checkingEmail?: boolean
      uploadedPreview?: string | null;

showPreviewModal?: boolean;

setShowPreviewModal?: (
  value: boolean
) => void;

uploadSuccessMessage?: string;
  onSubmit: (
    firstName: string,
    middleName: string,
    lastName: string,
    email: string,
    password: string,
    course: string,
    studentId: string,
    schoolIdImage: File,
    identifier?: string,
  ) => Promise<void> | void;

  loading?: boolean;
  error?: string;
  mode?: 'login' | 'signup';
};

const inputStyle = {
  width: '100%',
  height: '52px',
  padding: '0 16px',
  borderRadius: '7px',
  border: '1px solid rgba(255,255,255,0.08)',
  outline: 'none',
  fontSize: '0.96rem',
  background: 'rgba(255,255,255,0.08)',
  color: '#ffffff',
  fontWeight: 500,
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  color: 'rgba(255,255,255,0.92)',
  fontSize: '0.92rem',
  fontWeight: 600,
  marginBottom: '8px',
  textAlign: 'left' as const,
  letterSpacing: '0.2px',
};

const courses = [
  'BACHELOR OF ARTS IN SOCIOLOGY',
  'BACHELOR OF ELEMENTARY EDUCATION',
  'BACHELOR OF SCIENCE IN AGRICULTURAL AND BIOSYSTEMS ENGINEERING',
  'BACHELOR OF SCIENCE IN AGRICULTURE',
  'BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRICULTURAL ECONOMICS',
  'BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRONOMY',
  'BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN ANIMAL SCIENCE',
  'BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN CROP PROTECTION',
  'BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN HORTICULTURE',
  'BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN SOIL SCIENCE',
  'BACHELOR OF SCIENCE IN AGROFORESTRY',
  'BACHELOR OF SCIENCE IN APPLIED MATHEMATICS',
  'BACHELOR OF SCIENCE IN ARCHITECTURE',
  'BACHELOR OF SCIENCE IN BIOLOGY',
  'BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN BIODIVERSITY CONSERVATION',
  'BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN MEDICAL BIOLOGY',
  'BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN MICROBIOLOGY',
  'BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN PLANT BIOLOGY',
  'BACHELOR OF SCIENCE IN CHEMISTRY',
  'BACHELOR OF SCIENCE IN CIVIL ENGINEERING',
  'BACHELOR OF SCIENCE IN COMPUTER SCIENCE',
  'BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING',
  'BACHELOR OF SCIENCE IN ENVIRONMENTAL SCIENCE',
  'BACHELOR OF SCIENCE IN FOOD TECHNOLOGY',
  'BACHELOR OF SCIENCE IN FORESTRY',
  'BACHELOR OF SCIENCE IN GEODETIC ENGINEERING',
  'BACHELOR OF SCIENCE IN GEOLOGY',
  'BACHELOR OF SCIENCE IN INFORMATION SYSTEM',
  'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
  'BACHELOR OF SCIENCE IN MARINE BIOLOGY',
  'BACHELOR OF SCIENCE IN MATHEMATICS',
  'BACHELOR OF SCIENCE IN MECHANICAL ENGINEERING',
  'BACHELOR OF SCIENCE IN MINING ENGINEERING',
  'BACHELOR OF SCIENCE IN PHYSICS',
  'BACHELOR OF SCIENCE IN PSYCHOLOGY',
  'BACHELOR OF SCIENCE IN SOCIAL WORK',
  'BACHELOR OF SECONDARY EDUCATION MAJOR IN ENGLISH',
  'BACHELOR OF SECONDARY EDUCATION MAJOR IN FILIPINO',
  'BACHELOR OF SECONDARY EDUCATION MAJOR IN MATHEMATICS',
  'BACHELOR OF SECONDARY EDUCATION MAJOR IN SCIENCE',
  'DOCTOR OF EDUCATION',
  'DOCTOR OF INFORMATION TECHNOLOGY',
  'DOCTOR OF PHILOSOPHY IN MATHEMATICS',
  'DOCTOR OF PHILOSOPHY IN MATHEMATICS EDUCATION',
  'DOCTOR OF PHILOSOPHY IN SCIENCE EDUCATION',
  'DOCTOR OF PHILOSOPHY MAJOR IN SCIENCE EDUCATION WITH SPECIALIZATION IN BIOLOGY',
  'DOCTOR OF PHILOSOPHY MAJOR IN SCIENCE EDUCATION WITH SPECILIZATION IN PHYSICS',
  'MASTER IN ENVIRONMENTAL MANAGEMENT',
  'MASTER OF ARTS IN EDUCATION WITH SPECIALIZATION IN EDUCATIONAL MANAGEMENT',
  'MASTER OF ARTS IN EDUCATION WITH SPECIALIZATION IN ENGLISH LANGUAGE TEACHING',
  'MASTER OF ARTS IN EDUCATION WITH SPECIALIZATION IN GUIDANCE & COUNSELING',
  'MASTER OF ARTS IN GUIDANCE AND COUNSELING',
  'MASTER OF SCIENCE EDUCATION WITH SPECIALIZATION IN BIOLOGICAL SCIENCES',
  'MASTER OF SCIENCE EDUCATION WITH SPECIALIZATION IN PHYSICAL SCIENCES',
  'MASTER OF SCIENCE IN BIOLOGY',
  'MASTER OF SCIENCE IN CROP SCIENCE',
  'MASTER OF SCIENCE IN INFORMATION TECHNOLOGY',
  'MASTER OF SCIENCE IN MATHEMATICS',
  'MASTER OF SCIENCE IN MATHEMATICS EDUCATION',
  'MASTER OF ARTS IN EDUCATION WITH SPECIALIZATION IN TEACHING READING AND LITERATURE',
  'DOCTOR OF MEDICINE',
];

const handleNameChange = (
  value: string,
  setter: (value: string) => void
): void => {

  const cleanedValue = value
    // letters + spaces only
    .replace(/[^a-zA-Z\s]/g, '')

    // single spaces only
    .replace(/\s{2,}/g, ' ')

    // no leading spaces
    .replace(/^\s+/, '')

    // auto capitalize every word
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  setter(cleanedValue);
};

export default function AuthForm({
  title,
  buttonText,
  onSubmit,
  loading,
  error: backendError,
  mode = 'login',
  isLocked = false,
  lockCountdown = 0,
  emailError,
  studentIdError,
  setEmailError,
  setStudentIdError,
  checkingEmail,
setShowPreviewModal,
}: Props) {
  const navigate = useNavigate();

  const isSignup =
    mode === 'signup';

  const [firstName, setFirstName] =
    useState<string>('');

  const [middleName, setMiddleName] =
    useState<string>('');

  const [lastName, setLastName] =
    useState<string>('');

const [identifier, setIdentifier] = useState<string>(() => {
  return localStorage.getItem('savedIdentifier') || '';
});

const [identifierType, setIdentifierType] =
  useState<
    'studentId' |
    'email' |
    ''
  >('');

  const [email, setEmail] =
    useState<string>('');

  const [password, setPassword] =
    useState<string>('');

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

  const [course, setCourse] =
    useState<string>('');

  const [studentId, setStudentId] =
    useState<string>('');

  const [acceptedTerms, setAcceptedTerms] =
    useState<boolean>(false);

  const [showTerms, setShowTerms] =
    useState<boolean>(false);

  const [showPassword, setShowPassword] =
    useState<boolean>(false);

  const [localError, setLocalError] =
    useState<string>('');

  const [schoolIdImage, setSchoolIdImage] =
    useState<File | null>(null);

  const [
  internalUploadSuccess,
  setInternalUploadSuccess
] = useState('');

const [
  internalPreview,
  setInternalPreview
] = useState<string | null>(null);

const [
  internalPreviewModal,
  setInternalPreviewModal
] = useState(false);

    useEffect(() => {
  if (identifier) {
    localStorage.setItem('savedIdentifier', identifier);
  } else {
    localStorage.removeItem('savedIdentifier');
  }
}, [identifier]);

   const handleIdentifierChange = (
  e: React.ChangeEvent<HTMLInputElement>
): void => {

  let value = e.target.value;

   if (!value.trim()) {
    setIdentifier('');
    setIdentifierType('');
    return;
  }

  // Already complete Student ID? Lock it.
  if (
    /^\d{3}-\d{5}$/.test(identifier) &&
    value.length > identifier.length
  ) {
    return;
  }

  // If current input already contains dash,
  // force Student ID mode only.
  const hasDash =
    identifier.includes('-') ||
    value.includes('-');

  if (hasDash) {

    let digits =
      value.replace(/\D/g, '');

    if (digits.length > 8) {
      digits =
        digits.slice(0, 8);
    }

    if (digits.length > 3) {
      digits =
        digits.slice(0, 3) +
        '-' +
        digits.slice(3);
    }

    setIdentifier(digits);
    setIdentifierType('studentId');

    return;
  }

  // If starts with number = Student ID mode
  if (/^\d/.test(value)) {

    let digits =
      value.replace(/\D/g, '');

    if (digits.length > 8) {
      digits =
        digits.slice(0, 8);
    }

    if (digits.length > 3) {
      digits =
        digits.slice(0, 3) +
        '-' +
        digits.slice(3);
    }

    setIdentifier(digits);

    if (digits.length >= 1) {
      setIdentifierType('studentId');
    } else {
      setIdentifierType('');
    }

    return;
  }

  // Otherwise = Email mode
  const cleaned =
    value
      .replace(/@.*/g, '')
      .replace(/[^a-zA-Z0-9._]/g, '');

  setIdentifier(cleaned);

  if (cleaned.length >= 1) {
    setIdentifierType('email');
  } else {
    setIdentifierType('');
  }
};

  const handleSchoolIdUpload = (
  e: React.ChangeEvent<HTMLInputElement>
): void => {

  const file =
    e.target.files?.[0];

  if (!file) {
    return;
  }

  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  const isAllowed =
    allowedTypes.includes(file.type);

  if (!isAllowed) {

    setLocalError(
      'Only PNG, JPG, and JPEG files are allowed.'
    );

    return;
  }

  setLocalError('');

  setSchoolIdImage(file);

  // =========================
  // PREVIEW
  // =========================
  const previewUrl =
    URL.createObjectURL(file);

  // SAFE optional calls
  if (setShowPreviewModal) {
    // no-op just to use prop safely
  }

 setInternalPreview(previewUrl);

setInternalUploadSuccess(
  'ID uploaded successfully'
);

setTimeout(() => {

  setInternalUploadSuccess('');

}, 3000);
};

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

  // EMPTY
  if (!value.trim()) {
    setPasswordStrength('');
    return;
  }

  let passedConditions = 0;

  // 1
  if (checks.length) {
    passedConditions++;
  }

  // 2
  if (
    checks.uppercase &&
    checks.lowercase
  ) {
    passedConditions++;
  }

  // 3
  if (checks.number) {
    passedConditions++;
  }

  // 4
  if (checks.special) {
    passedConditions++;
  }

  // RESULT
  if (passedConditions === 1) {
    setPasswordStrength('weak');
  }

  else if (passedConditions === 2) {
    setPasswordStrength('medium');
  }

  else if (passedConditions === 3) {
    setPasswordStrength('strong');
  }

  else if (passedConditions === 4) {
    setPasswordStrength('excellent');
  }
 
};

  const handleStudentIdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    let value =
      e.target.value.replace(/\D/g, '');

    if (value.length > 8) {
      value =
        value.slice(0, 8);
    }

    if (value.length > 3) {
      value =
        value.slice(0, 3) +
        '-' +
        value.slice(3);
    }

    setStudentId(value);
  };




  const isFormValid =
    isSignup
      ? Boolean(
          firstName.trim() &&
            middleName.trim() &&
            lastName.trim() &&
            schoolIdImage &&
            email.trim() &&
            password.trim() &&
            course.trim() &&
            studentId.trim() &&
            acceptedTerms
        )
      : Boolean(
    identifier.trim() &&
      password.trim()
  );

  const handleTermsCheckboxClick =
    (): void => {
      if (!acceptedTerms) {
        setShowTerms(true);
      } else {
        setAcceptedTerms(false);
      }
    };

  const handleAgreeTerms =
    (): void => {
      setAcceptedTerms(true);
      setShowTerms(false);
    };

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
    e.preventDefault();

    if (loading) return;

    setLocalError('');

    if (isSignup) {
      const idRegex =
        /^\d{3}-\d{5}$/;

      const isStudentIdValid =
        idRegex.test(studentId);

      if (!isStudentIdValid) {
        setLocalError(
          'Invalid Student ID. Format: 000-00000'
        );

        return;
      }
const isValidEmailLocal = (value: string) => {
  return /^[a-zA-Z0-9._%+-]+$/.test(value);
};
     const finalEmail =
  `${email}@carsu.edu.ph`;
if (!isValidEmailLocal(email)) {
  setLocalError(
    'Email username contains invalid characters.'
  );
  return;
}

const emailRegex =
  /^[a-zA-Z0-9._%+-]+@carsu\.edu\.ph$/;

const isEmailValid =
  emailRegex.test(finalEmail);

      if (!isEmailValid) {
        setLocalError(
          'Use your official @carsu.edu.ph email only.'
        );

        return;
      }

      if (!acceptedTerms) {
        setLocalError(
          'Please accept the Terms and Conditions.'
        );

        return;
      }

      if (!schoolIdImage) return;

      if (emailError) {
  setLocalError(
    "CARSU email already registered."
  );
  return;
}

if (studentIdError) {
  setLocalError(
    "Student ID already registered."
  );
  return;
}

await onSubmit(
  firstName,
  middleName,
  lastName,
  `${email}@carsu.edu.ph`,
  password,
  course,
  studentId,
  schoolIdImage
);


    } else {
      const finalLoginValue =
  identifierType === 'email'
    ? `${identifier}@carsu.edu.ph`
    : identifier;

onSubmit(
  '',
  '',
  '',
  '',
  password,
  '',
  '',
  new File([], "empty"),
  finalLoginValue
);
    }
  };

const renderInput = (
  label: string,
  value: string,
  setValue: (
    value: string
  ) => void,

  type: string = 'text',

  placeholder: string = '',

  isNameField: boolean = false
) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <label style={labelStyle}>
        {label}
      </label>

      <input
      className="auth-input"
        type={type}
        value={value}
        placeholder={placeholder}
        required
        style={inputStyle}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement>
        ): void => {
          const inputValue =
            e.target.value;

          if (isNameField) {
            handleNameChange(
              inputValue,
              setValue
            );
          } else {
            setValue(inputValue);
          }
        }}
      />
    </div>
  );
};

  return (
  <div
    style={{
      width: '100%',
      maxWidth: isSignup
        ? '1120px'
        : '520px',
      margin: '0 auto',
      color: 'white',
      marginTop: isSignup
  ? '-55px'
  : '0px',
      fontFamily:
        '"Poppins", "Segoe UI", sans-serif',
    }}
  >
    {/* HEADER */}
    <div
      style={{
        textAlign: 'center',
        marginBottom: '34px',
      }}
    >
      <h2
        style={{
          color: '#ffffff',
          fontSize: '2rem',
          fontWeight: 600,
          letterSpacing: '10px',
          margin: 0,
          textTransform: 'uppercase',
        }}
      >
        ICT LIBRARY OFFICE
      </h2>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '8px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '2px',
            background: '#8b5cf6',
            borderRadius: '20px',
          }}
        />

        <h1
          style={{
            margin: 0,
            color: '#ffffff',
            fontSize: '2rem',
            fontWeight: 600,
            letterSpacing: '3px',
          }}
        >
          {title}
        </h1>

        <div
          style={{
            width: '60px',
            height: '2px',
            background: '#8b5cf6',
            borderRadius: '20px',
          }}
        />
      </div>
    </div>

    {/* GLASS */}
    <div
      style={{
        backdropFilter: 'blur(18px)',
        background:
          'rgba(255,255,255,0.11)',
        border:
          '1px solid rgba(255,255,255,0.12)',
        borderRadius: '18px',
        padding: '38px 36px 30px',
        boxShadow:
          '0 10px 35px rgba(0,0,0,0.32), 0 0 12px rgba(255,255,255,0.06)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isSignup ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '22px 34px',
              }}
            >
              {/* LEFT */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {renderInput(
                  'First Name',
                  firstName,
                  setFirstName,
                  'text',
                  'Enter first name',
                  true
                )}

                {renderInput(
                  'Middle Name (Type "none" if none)',
                  middleName,
                  setMiddleName,
                  'text',
                  'Enter middle name',
                  true
                )}

                {/* CARSU EMAIL */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <label style={labelStyle}>
                    CARSU Email
                  </label>
                  {/* INPUT WRAPPER */}
                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <input
                      className="auth-input"
                      type="text"
                      value={email}
                      placeholder="Enter your CARSU email"
                      required
                      style={{
                        ...inputStyle,
                        paddingRight: '150px',
                      }}
                      onChange={(e) => {

                        let cleaned =
                          e.target.value;

                        // remove spaces
                        cleaned =
                          cleaned.replace(/\s/g, '');

                        // remove invalid chars
                        cleaned =
                          cleaned.replace(
                            /[^a-zA-Z0-9._+-]/g,
                            ''
                          );

                        // prevent double dots
                        cleaned =
                          cleaned.replace(
                            /\.{2,}/g,
                            '.'
                          );

                        // prevent starting dot
                        cleaned =
                          cleaned.replace(
                            /^\./,
                            ''
                          );

                        // prevent multiple underscores
                        cleaned =
                          cleaned.replace(
                            /_{2,}/g,
                            '_'
                          );

                        setEmail(cleaned);

                        if (setEmailError) {
                          setEmailError('');
                        }
                      }}
                    />

                    <span
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform:
                        // 1
                          'translateY(-50%)',
                        color:
                          'rgba(255,255,255,0.55)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        pointerEvents: 'none',
                      }}
                    >
                      @carsu.edu.ph
                    </span>
                  </div>

                  {/* RESERVED ERROR SPACE */}
                  <div
                    style={{
                      minHeight: '24px',
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: '0.2s ease',
                    }}
                  >
                    {checkingEmail ? (
                      <p
                        style={{
                          color: '#aaa',
                          fontSize: '0.8rem',
                          margin: 0,
                        }}
                      >
                        Checking email availability...
                      </p>
                    ) : emailError ? (
                      <p
                        style={{
                          color: 'red',
                          fontSize: '0.85rem',
                          margin: 0,
                        }}
                      >
                        {emailError}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* SCHOOL ID UPLOAD */}
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
  }}
>
 <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  }}
>

  <label
    style={{
      ...labelStyle,
      marginBottom: 0,
    }}
  >
    Upload School ID
  </label>

  {internalUploadSuccess && (

    <span
      style={{
        color: '#7dffb3',
        fontSize: '0.78rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      ✓ Uploaded Successfully
    </span>

  )}

</div>
  <label
    htmlFor="school-id-upload"
    style={{
      ...inputStyle,
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '16px',
      cursor: 'pointer',
      overflow: 'hidden',
    }}
  >
    <span
      style={{
        color: schoolIdImage
          ? '#ffffff'
          : 'rgba(255,255,255,0.65)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {schoolIdImage
        ? schoolIdImage.name
        : 'Click to upload ID'}
    </span>
  </label>

  <input
  className="auth-input"
  id="school-id-upload"
  type="file"
  accept=".png,.jpg,.jpeg"
  style={{
    display: 'none',
  }}
  onChange={handleSchoolIdUpload}
/>

{internalPreview && (

  <button
    type="button"
    onClick={() =>
  setInternalPreviewModal(true)
}
    style={{
      marginTop: '10px',
      background: 'none',
      border: 'none',
      color: '#93c5fd',
      cursor: 'pointer',
      fontSize: '0.8rem',
fontWeight: 600,
letterSpacing: '0.2px',
textDecoration: 'underline',
      padding: 0,
    }}
  >
    Preview Uploaded ID
  </button>

)}
</div>
              </div>

              {/* RIGHT */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {renderInput(
                  'Last Name',
                  lastName,
                  setLastName,
                  'text',
                  'Enter last name',
                  true
                )}

                {/* COURSE */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <label style={labelStyle}>
                    Course
                  </label>

                  <select
  className="auth-select"
  value={course}
  onChange={(e) =>
    setCourse(
      e.target.value
    )
  }
  required
  style={{
    ...inputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    background: 'rgba(255,255,255,0.08)',
    color: '#ffffff',
  }}
>
                    <option value="">
                      Select course
                    </option>

                    {courses.map(
                      (
                        courseItem
                      ) => (
                        <option
                          key={
                            courseItem
                          }
                          value={
                            courseItem
                          }
                        >
                          {courseItem}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* STUDENT ID */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <label style={labelStyle}>
                    Student ID "000-00000" (Dash is automatic)
                  </label>

                 <input
  className="auth-input"
  type="text"
  inputMode="numeric"
  value={studentId}
  onChange={(e) => {
  let value = e.target.value.replace(/\D/g, '');

  if (value.length > 8) {
    value = value.slice(0, 8);
  }

  if (value.length > 3) {
    value = value.slice(0, 3) + '-' + value.slice(3);
  }

  setStudentId(value);
  setStudentIdError?.('');
}}
  required
  maxLength={9}
  placeholder="Enter student ID"
  style={inputStyle}
/>

<div
  style={{
    minHeight: '24px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: '0.2s ease',
  }}
>
  {studentIdError && (
    <p
      style={{
        color: 'red',
        fontSize: '0.85rem',
        margin: 0,
      }}
    >
      {studentIdError}
    </p>
  )}
</div>
                </div>

               {/* PASSWORD */}
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    marginTop: '8px',
    height: '220px', // LOCKED HEIGHT
    minHeight: '220px',
    maxHeight: '220px',
    overflow: 'hidden',
  }}
>
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  }}
>

<label
  style={{
    ...labelStyle,
    marginBottom: 0,
    lineHeight: 1,
  }}
>
    Password
  </label>

<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '20px', // LOCK HEIGHT
    minHeight: '20px',
    maxHeight: '20px',
  }}
>

    {/* MINI BAR */}
    <div
      style={{
        width: '250px',
        height: '6px',
        borderRadius: '999px',
        background:
          'rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width:
  passwordStrength === ''
    ? '0%'
    : passwordStrength === 'weak'
    ? '25%'
    : passwordStrength === 'medium'
    ? '50%'
    : passwordStrength === 'strong'
    ? '75%'
    : '100%',

          height: '100%',

         background:
  passwordStrength === 'weak'
    ? '#ef4444'

    : passwordStrength === 'medium'
    ? '#facc15'

    : passwordStrength === 'strong'
    ? '#3b82f6'

    : passwordStrength === 'excellent'
    ? '#22c55e'

    : 'transparent',

          transition:
            'all 0.25s ease',
        }}
      />
    </div>

    {/* STATUS */}
    <span
      style={{
        marginTop: '0px',
lineHeight: 1,
display: 'flex',
alignItems: 'center',
height: '20px',
        fontSize: '0.76rem',
        fontWeight: 700,
        letterSpacing: '0.3px',

      color:
  passwordStrength === 'weak'
    ? '#ef4444'

    : passwordStrength === 'medium'
    ? '#facc15'

    : passwordStrength === 'strong'
    ? '#60a5fa'

    : passwordStrength === 'excellent'
    ? '#7dffb3'

    : 'transparent',
      }}
    >
     {passwordStrength === ''
  ? ''

  : passwordStrength === 'weak'
  ? 'Weak'

  : passwordStrength === 'medium'
  ? 'Medium'

  : passwordStrength === 'strong'
  ? 'Strong'

  : 'Excellent'}
    </span>

  </div>
</div>

<div
  style={{
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'flex-start',
  }}
>
    <input
  className="auth-input"
  type={
    showPassword
      ? 'text'
      : 'password'
  }
  value={password}
  placeholder="Enter your password"
      onChange={(e) => {

  const value =
    e.target.value;

  setPassword(value);

  evaluatePasswordStrength(value);

}}
      required
      style={{
        ...inputStyle,
        paddingRight: '52px',
      }}
    />
<div
  style={{
    marginTop: '10px',
    height: '78px',
minHeight: '78px',
maxHeight: '78px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2px 8px',
    fontSize: '0.78rem',
    fontWeight: 600,
  }}
>

  <span
    style={{
      color: passwordChecks.length
        ? '#7dffb3'
        : '#ff8b8b',
    }}
  >
    {passwordChecks.length ? '✓' : '✗'} 8+
    characters
  </span>

  <span
    style={{
      color:
        passwordChecks.uppercase &&
        passwordChecks.lowercase
          ? '#7dffb3'
          : '#ff8b8b',
    }}
  >
    {passwordChecks.uppercase &&
    passwordChecks.lowercase
      ? '✓'
      : '✗'} Uppercase & lowercase
  </span>

  <span
    style={{
      color: passwordChecks.number
        ? '#7dffb3'
        : '#ff8b8b',
    }}
  >
    {passwordChecks.number ? '✓' : '✗'} At
    least 1 number
  </span>

  <span
    style={{
      color: passwordChecks.special
        ? '#7dffb3'
        : '#ff8b8b',
    }}
  >
    {passwordChecks.special ? '✓' : '✗'} At
    least 1 special character
  </span>

</div>
    <button
      type="button"
      onClick={() =>
        setShowPassword(
          !showPassword
        )
      }
      style={{
        position: 'absolute',
        top: '26px',
        right: '14px',
        transform:
          'translateY(-50%)',
        border: 'none',
        background:
          'transparent',
        cursor: 'pointer',
        color:
          'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'center',
        padding: 0,
      }}
    >
      {showPassword ? (
        <EyeOff size={20} />
      ) : (
        <Eye size={20} />
      )}
    </button>
  </div>
</div>
              </div>
            </div>
            <div
  style={{
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }}
>
</div>
           {/* SIGNUP REMINDERS */}
<div
  style={{
    marginTop: '-60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  }}
>

  {/* LOGIN NOTE */}
  <span
    style={{
      fontSize: '0.88rem',
      color: 'rgba(255,255,255,0.82)',
      textAlign: 'center',
      fontWeight: 500,
      letterSpacing: '0.2px',
      lineHeight: 1.5,
    }}
  >
    • Your CARSU email or Student ID together with your password will be used to sign in to your account.
  </span>

  {/* SCHOOL ID NOTE */}
  <span
    style={{
      fontSize: '0.88rem',
      color: 'rgba(255,255,255,0.72)',
      textAlign: 'center',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.2px',
    }}
  >
    • Your uploaded School ID will serve as proof of identity verification. Please ensure that the image is clear and readable.
  </span>

  {/* ADMIN VERIFICATION NOTE */}
  <span
    style={{
      fontSize: '0.88rem',
      color: '#facc15',
      textAlign: 'center',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.2px',
    }}
  >
    • Newly created accounts are subject to admin verification before full access is granted.
  </span>

</div>

            {/* TERMS */}
            <div
              onClick={
                handleTermsCheckboxClick
              }
              style={{
                display: 'flex',
                justifyContent:
                  'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '22px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
              className="auth-input"
                type="checkbox"
                checked={acceptedTerms}
                readOnly
                style={{
                  width: '17px',
                  height: '17px',
                  cursor: 'pointer',
                }}
              />

              <span
                style={{
                  color:
                    'rgba(255,255,255,0.92)',
                  fontWeight: 500,
                }}
              >
                I accept{' '}
                <span
                  style={{
                    color: '#8b5cf6',
                    fontWeight: 700,
                    textDecoration:
                      'underline',
                  }}
                >
                  Terms and Conditions
                </span>
              </span>
            </div>

                          {/* SIGNUP BUTTON */}
            <button
              type="submit"
              disabled={
  loading ||
  !isFormValid ||
  !!emailError ||
  !!studentIdError ||
  passwordStrength !== 'excellent'
}
              style={{
                width: '300px',
                height: '52px',
                margin:
                  '18px auto 0',
                border: 'none',
                borderRadius: '7px',
                cursor:
                  loading ||
                  !isFormValid
                    ? 'not-allowed'
                    : 'pointer',
                background:
                  'linear-gradient(90deg,#6366f1,#8b5cf6)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                opacity:
                  loading ||
                  !isFormValid
                    ? 0.6
                    : 1,
              }}
            >
              {loading
                ? 'Processing...'
                : buttonText}
            </button>
          </>
        ) : (
          <>
            <div
  style={{
    display: 'flex',
    flexDirection: 'column',
  }}
>
  <label style={labelStyle}>
    CARSU Account or Student ID
  </label>
  <div
    style={{
      position: 'relative',
    }}
  >
    <input
    className="auth-input"
      type="text"
      value={identifier}
      onChange={
        handleIdentifierChange
      }
      placeholder="Student ID or CARSU Account"
      style={{
        ...inputStyle,
        paddingRight:
          identifierType === 'email'
            ? '150px'
            : '16px',
      }}
    />

    {identifierType ===
      'email' && (
      <span
        style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform:
          // 3
            'translateY(-50%)',
          color:
            'rgba(255,255,255,0.55)',
          fontWeight: 600,
        }}
      >
        @carsu.edu.ph
      </span>
    )}
  </div>
</div>

            <div
              style={{
                marginTop: '18px',
                display: 'flex',
                flexDirection:
                  'column',
              }}
            >
              <label
                style={labelStyle}
              >
                Password
              </label>

              <div
                style={{
                  position:
                    'relative',
                }}
              >
                <input
                className="auth-input"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  style={{
                    ...inputStyle,
                    paddingRight:
                      '50px',
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={{
                    position:
                      'absolute',
                    top: '50%',
                    right: '14px',
                    transform:
                    // 4
                      'translateY(-50%)',
                    background:
                      'transparent',
                    border: 'none',
                    cursor:
                      'pointer',
                    color:
                      '#ffffff',
                  }}
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                    />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* FORGOT ACCOUNT */}
            <div
              style={{
                marginTop: '14px',
                textAlign: 'center',
              }}
            >
              <span
                onClick={() =>
  navigate('/forgot-password')
}
                style={{
                  color: '#c4b5fd',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition:
                    '0.2s ease',
                }}
                onMouseEnter={(
                  e
                ) => {
                  e.currentTarget.style.color =
                    '#ffffff';
                }}
                onMouseLeave={(
                  e
                ) => {
                  e.currentTarget.style.color =
                    '#c4b5fd';
                }}
              >
                Forgot account?
                Click here.
              </span>
            </div>

            {/* LOGIN/SIGNIN BUTTON */}
            <button
              type="submit"
              disabled={
                 loading ||
                 isLocked ||
                 !isFormValid
                }
              style={{
                width: '100%',
                height: '52px',
                marginTop: '18px',
                border: 'none',
                borderRadius:
                  '7px',
                background:
                  'linear-gradient(90deg,#6366f1,#8b5cf6)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor:
                  loading ||
                  !isFormValid
                    ? 'not-allowed'
                    : 'pointer',
                transition:
                  'all 0.18s ease',
                boxShadow:
                  '0 4px 14px rgba(139,92,246,0.25)',
              }}
              onMouseEnter={(
                e
              ) => {
                if (
                  !loading &&
                  isFormValid
                ) {
                  e.currentTarget.style.transform =
                    'translateY(2px) translateX(-2px)';

                  e.currentTarget.style.boxShadow =
                    '-4px 8px 18px rgba(0,0,0,0.28)';
                }
              }}
              onMouseLeave={(
                e
              ) => {
                e.currentTarget.style.transform =
                  'translateY(0px) translateX(0px)';

                e.currentTarget.style.boxShadow =
                  '0 4px 14px rgba(139,92,246,0.25)';
              }}
            >
              {isLocked
  ? `Try again in ${lockCountdown}s`
  : loading
    ? 'Signing in...'
    : buttonText}
            </button>
          </>
        )}
      </form>

      {(localError ||
        backendError) && (
        <p
          style={{
            marginTop: '18px',
            color: '#fecaca',
            textAlign: 'center',
            fontSize: '0.9rem',
          }}
        >
          {localError ||
            backendError}
        </p>
      )}

      {/* SWITCH */}
      <p
        style={{
          marginTop: '18px',
          textAlign: 'center',
          color:
            'rgba(255,255,255,0.85)',
          fontSize: '0.95rem',
          cursor: 'pointer',
        }}
        onClick={() =>
          navigate(
            isSignup
              ? '/signin'
              : '/signup'
          )
        }
      >
        {isSignup
          ? 'Already have an account? '
          : "Don't have an account? "}

        <span
          style={{
            color: '#8b5cf6',
            fontWeight: 700,
          }}
        >
          {isSignup
            ? 'Sign in'
            : 'Sign up'}
        </span>
      </p>
    </div>

    {/* TERMS MODAL */}
    {showTerms && (
      <div
        style={{
          position: 'fixed',
top: 0,
left: 0,
width: '100vw',
height: '100vh',
margin: 0,
          background:
            'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent:
            'center',
          alignItems: 'center',
          zIndex: 999,
          padding: '20px',
        }}
      >
        <div
          style={{
            background:
              '#ffffff',
            color: '#000000',
            padding: '2rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <h2
            style={{
              color: '#000000',
              fontWeight: 800,
              marginBottom:
                '18px',
            }}
          >
            Terms and Conditions
          </h2>

          <p
            style={{
              color: '#000000',
              lineHeight: 1.7,
              fontSize: '1rem',
            }}
          >
            By using the ICT
            Library Office
            System, you agree to
            comply with
            university policies,
            data privacy
            regulations, and
            academic rules.
          </p>

          <p
            style={{
              color: '#000000',
              lineHeight: 1.7,
              fontSize: '1rem',
            }}
          >
            Your account and
            activities may be
            monitored for
            security, record
            keeping, and
            administrative
            purposes.
          </p>

          <p
            style={{
              color: '#000000',
              lineHeight: 1.7,
              fontSize: '1rem',
            }}
          >
            Any misuse of the
            system may result in
            disciplinary action
            or account
            suspension.
          </p>

          <button
            onClick={
              handleAgreeTerms
            }
            style={{
              marginTop: '20px',
              padding:
                '12px 24px',
              border: 'none',
              borderRadius:
                '8px',
              background:
                '#6366f1',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            I Agree
          </button>
        </div>
      </div>
    )}

{internalPreviewModal &&
  internalPreview && (

  <div
    onClick={() =>
      setInternalPreviewModal(false)
    }

    style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background:
        'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
    }}
  >

    <img
      src={internalPreview}

      alt="Uploaded School ID"

    style={{
  maxWidth: '95vw',
  maxHeight: '95vh',
  objectFit: 'contain',
  borderRadius: '14px',
  boxShadow:
    '0 0 40px rgba(0,0,0,0.45)',
  display: 'block',
}}
    />

  </div>

)}

  </div>
);

}