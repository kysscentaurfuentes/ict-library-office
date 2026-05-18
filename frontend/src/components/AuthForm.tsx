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

onSubmit: (
  firstName: string,
  middleName: string,
  lastName: string,
  email: string,
  password: string,
  course: string,
  studentId: string,
  schoolIdImage: File,
  identifier?: string
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
  const cleanedValue =
    value.replace(/[^a-zA-Z\s]/g, '');

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

  const [showForgotModal, setShowForgotModal] =
    useState<boolean>(false);

  const [forgotStudentId, setForgotStudentId] =
    useState<string>('');

  const [forgotEmail, setForgotEmail] =
    useState<string>('');

  const [forgotLoading, setForgotLoading] =
    useState<boolean>(false);

  const [forgotMessage, setForgotMessage] =
    useState<string>('');

  const [schoolIdImage, setSchoolIdImage] =
    useState<File | null>(null);

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

  const handleForgotStudentIdChange = (
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

    setForgotStudentId(value);
  };

  const handleForgotSubmit =
    async (): Promise<void> => {
      const noInputProvided =
        !forgotStudentId.trim() &&
        !forgotEmail.trim();

      if (noInputProvided) {
        setForgotMessage(
          'Please provide at least one account detail.'
        );

        return;
      }

      try {
        setForgotLoading(true);

        const API_BASE =
          window.location.hostname ===
          'localhost'
            ? import.meta.env.VITE_LOCAL_API
            : import.meta.env.VITE_NGROK_API;

        const finalForgotEmail =
          forgotEmail.trim()
            ? `${forgotEmail.trim()}@carsu.edu.ph`
            : '';

        const response =
          await fetch(
            `${API_BASE}/forgot-account`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                studentId:
                  forgotStudentId,

                email:
                  finalForgotEmail,
              }),
            }
          );

        const data =
          await response.json();

        setForgotMessage(
          data.message
        );
      } catch (err) {
        setForgotMessage(
          'Failed to submit request.'
        );
      } finally {
        setForgotLoading(false);
      }
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

     const finalEmail =
  `${email}@carsu.edu.ph`;

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

await onSubmit(
  firstName,
  middleName,
  lastName,
  `${email}@carsu.edu.ph`,
  password,
  course,
  studentId,
  schoolIdImage!
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
      transform: isSignup
        ? 'translateY(-55px)'
        : 'translateY(0px)',
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

             <div
  style={{
    display: 'flex',
    flexDirection: 'column',
  }}
>
  <label style={labelStyle}>
    CARSU Email
  </label>

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
     onChange={(
  e: React.ChangeEvent<HTMLInputElement>
): void => {
  const cleaned =
    e.target.value.replace(/@/g, '');

  setEmail(cleaned);
}}
    />

    <span
      style={{
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(255,255,255,0.55)',
        fontSize: '0.9rem',
        fontWeight: 600,
      }}
    >
      @carsu.edu.ph
    </span>
  </div>
</div>

                {/* SCHOOL ID UPLOAD */}
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
  }}
>
  <label style={labelStyle}>
    Upload School ID
  </label>

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
                    Student ID
                    (000-00000)
                  </label>

                  <input
                  className="auth-input"
                    type="text"
                    inputMode="numeric"
                    value={studentId}
                    onChange={
                      handleStudentIdChange
                    }
                    required
                    maxLength={9}
                    placeholder="Enter student ID"
                    style={inputStyle}
                  />
                </div>

               {/* PASSWORD */}
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
  }}
>
  <label style={labelStyle}>
    Password
  </label>

  <div
    style={{
      position: 'relative',
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
      onChange={(e) =>
        setPassword(
          e.target.value
        )
      }
      placeholder="Enter your password"
      required
      style={{
        ...inputStyle,
        paddingRight: '52px',
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
        position: 'absolute',
        top: '50%',
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

            {/* NOTE */}
            <div
              style={{
                marginTop: '22px',
                display: 'flex',
                justifyContent:
                  'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.88rem',
                  color:
                    'rgba(255,255,255,0.82)',
                  textAlign: 'center',
                  fontWeight: 500,
                  letterSpacing:
                    '0.2px',
                }}
              >
                (Note: Your CARSU email or student ID and
                password will be used
                to sign in to your
                account)
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
                !isFormValid
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
                      'translateY(-50%)',
                    background:
                      'transparent',
                    border: 'none',
                    cursor:
                      'pointer',
                    color:
                      '#4b5563',
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
                  setShowForgotModal(
                    true
                  )
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
          inset: 0,
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

    {/* FORGOT ACCOUNT MODAL */}
    {showForgotModal && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'transparent',
          display: 'flex',
          justifyContent:
            'center',
          alignItems:
            'flex-start',
          paddingTop: '70px',
          zIndex: 9999,
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '640px',
            background:
              'rgba(15,15,25,0.995)',
            border:
              '1px solid rgba(255,255,255,0.08)',
            borderRadius:
              '18px',
            padding:
              '38px 42px',
            backdropFilter:
              'blur(12px)',
          }}
        >
          <h2
            style={{
              color: '#fff',
              textAlign: 'center',
              marginBottom:
                '14px',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing:
                '0.5px',
            }}
          >
            Recover Account
          </h2>

          <p
            style={{
              color:
                'rgba(255,255,255,0.78)',
              textAlign: 'center',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom:
                '24px',
            }}
          >
            Enter any account
            detail you remember.
            You may provide your
            Student ID or
            official CARSU email.
            You do not need to
            complete both
            fields.
          </p>

          {/* STUDENT ID */}
          <div
            style={{
              marginBottom:
                '16px',
            }}
          >
            <label
              style={labelStyle}
            >
              Student ID
            </label>

            <input
            className="auth-input"
              type="text"
              inputMode="numeric"
              value={
                forgotStudentId
              }
              onChange={
                handleForgotStudentIdChange
              }
              maxLength={9}
              placeholder="Student-ID (Ex. 000-00000)"
              style={inputStyle}
            />
          </div>

          {/* EMAIL */}
          <div
            style={{
              marginBottom:
                '18px',
            }}
          >
            <label
              style={labelStyle}
            >
              CARSU Email
            </label>

            <div
              style={{
                position:
                  'relative',
              }}
            >
              <input
              className="auth-input"
                type="text"
                value={
                  forgotEmail
                }
                onChange={(
                  e
                ) => {
                  const cleaned =
                    e.target.value.replace(
                      /@.*/g,
                      ''
                    );

                  setForgotEmail(
                    cleaned
                  );
                }}
                placeholder="Enter your email username"
                style={{
                  ...inputStyle,
                  paddingRight:
                    '130px',
                }}
              />

              <span
                style={{
                  position:
                    'absolute',
                  right: '14px',
                  top: '50%',
                  transform:
                    'translateY(-50%)',
                  color:
                    'rgba(255,255,255,0.55)',
                  fontSize:
                    '0.9rem',
                  fontWeight: 600,
                }}
              >
                @carsu.edu.ph
              </span>
            </div>
          </div>

          <p
            style={{
              marginTop: '-8px',
              marginBottom:
                '18px',
              fontSize: '0.82rem',
              color:
                'rgba(255,255,255,0.65)',
              lineHeight: 1.5,
            }}
          >
            Note: Enter only
            your email username
            (example:
            juandela.cruz)
            (do not include
            @carsu.edu.ph)
            (juandela.cruz@carsu.edu.ph
            is incorrect)
          </p>

          {/* MESSAGE */}
          {forgotMessage && (
            <p
              style={{
                color: '#c4b5fd',
                textAlign:
                  'center',
                marginBottom:
                  '14px',
              }}
            >
              {forgotMessage}
            </p>
          )}

          {/* BUTTONS */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
            }}
          >
            <button
              onClick={() =>
                setShowForgotModal(
                  false
                )
              }
              style={{
                flex: 1,
                height: '50px',
                border: 'none',
                borderRadius:
                  '8px',
                background:
                  '#374151',
                color: '#fff',
                cursor:
                  'pointer',
                fontWeight: 700,
              }}
            >
              Cancel
            </button>

            <button
              onClick={
                handleForgotSubmit
              }
              disabled={
                forgotLoading
              }
              style={{
                flex: 1,
                height: '50px',
                border: 'none',
                borderRadius:
                  '8px',
                background:
                  'linear-gradient(90deg,#6366f1,#8b5cf6)',
                color: '#fff',
                cursor:
                  'pointer',
                fontWeight: 700,
              }}
            >
              {forgotLoading
                ? 'Submitting...'
                : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}