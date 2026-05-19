// frontend/src/pages/SignUp.tsx
import { gql } from '@apollo/client/core';
import { useMutation } from '@apollo/client/react';
import AuthForm from '../components/AuthForm';
import { useDynamicBackground } from '../hooks/useDynamicBackground';
import { ApolloError } from "@apollo/client";
import { useLazyQuery } from "@apollo/client";
import { useState, useEffect } from "react";


const CHECK_SIGNUP = gql`
query CheckSignupAvailability(
  $email: String
  $StudentId: String
) {
  checkSignupAvailability(
    email: $email
    StudentId: $StudentId
  ) {
    available
    field
  }
}
`;

const REQUEST_SIGNUP_OTP = gql`
mutation RequestSignupOTP(
  $first_name: String!
  $middle_name: String
  $last_name: String!
  $email: String!
  $password: String!
  $course: String!
  $StudentId: String!
  $school_id_image: String!
) {

  requestSignupOTP(
    first_name: $first_name
    middle_name: $middle_name
    last_name: $last_name
    email: $email
    password: $password
    course: $course
    StudentId: $StudentId
    school_id_image: $school_id_image
  )
}
`;

type RequestSignupOTPResponse = {
  requestSignupOTP: boolean;
};

type SignupVariables = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password: string;
  course: string;
  StudentId: string;
  school_id_image: string;
};

export default function SignUp() {
 const [
  requestSignupOTP,
  { loading, error }
] =
useMutation<
  RequestSignupOTPResponse,
  SignupVariables
>(
  REQUEST_SIGNUP_OTP
);
    const [checkAvailability] = useLazyQuery(CHECK_SIGNUP);
    const [emailError, setEmailError] = useState("");
    const [studentIdError, setStudentIdError] = useState("");
    const [email, setEmail] = useState("");
    const [studentId, setStudentId] = useState("");
    const [emailExists, setEmailExists] = useState<boolean | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);

  const currentBackground =
    useDynamicBackground();

    

const handleSignup = async (
  firstName: string,
  middleName: string,
  lastName: string,
  email: string,
  password: string,
  course: string,
  studentId: string,
  schoolIdImage: File
) => {
  
  try {
    // =========================
    // API BASE
    // =========================
   const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_FALLBACK;

    // =========================
    // CREATE FORMDATA
    // =========================
    const formData = new FormData();

formData.append(
  "uploadType",
  "temporary-school-id"
);

formData.append(
  "studentId",
  studentId
);

formData.append(
  "image",
  schoolIdImage
);
    // =========================
    // UPLOAD IMAGE FIRST
    // =========================
    console.log("API_BASE:", API_BASE);
    const uploadRes = await fetch(
      `${API_BASE}/api/upload-school-id`,
      {
        method: "POST",
        body: formData,
      }
    );
    
    if (!uploadRes.ok) {

  const uploadError =
    await uploadRes.json();

  throw new Error(
    uploadError.message ||
    "Upload failed."
  );
}

    const uploadData =
      await uploadRes.json();

    const imageUrl =
      uploadData.imageUrl;

    // =========================
    // NOW CREATE ACCOUNT
    // =========================
    await requestSignupOTP({
      variables: {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email,
        password,
        course,
        StudentId: studentId,
        school_id_image: imageUrl,
      },
    });

localStorage.setItem(
  "pendingSignupEmail",
  email
);

alert(
  "OTP sent to your CARSU email."
);

window.location.hash =
  "#/verify-signup-otp";

return;

  } catch (err) {

  console.error(
    "Signup failed:",
    err
  );

  localStorage.removeItem(
    "token"
  );

  // =========================
  // APOLLO / GRAPHQL ERRORS
  // =========================
  if (err instanceof ApolloError) {

    const graphQLError =
      err.graphQLErrors[0];

    const errorCode =
      graphQLError?.extensions
        ?.code;

    switch (errorCode) {

      case "EMAIL_EXISTS":
        setEmailError(
          "CARSU email already registered."
        );
        return;

      case "STUDENT_ID_EXISTS":
  setStudentIdError(
    "Student ID already registered."
  );
  return;

      case "INVALID_EMAIL_DOMAIN":
        alert(
          "Only CARSU email is allowed."
        );
        return;

      default:
        alert(
          graphQLError?.message ||
          "Signup failed."
        );
        return;
    }
  }

  // =========================
  // NON-GRAPHQL ERRORS
  // =========================
  if (err instanceof Error) {

    alert(err.message);

    return;
  }

  alert(
    "Unexpected signup error."
  );
}
};

useEffect(() => {
if (!email || email.trim().length < 5) {
  setEmailError("");
  setEmailExists(false);
  setCheckingEmail(false);
  return;
}

  const timeout = setTimeout(async () => {
    setCheckingEmail(true);

    try {
      const res = await checkAvailability({
        variables: { email: email.trim() },
      });

      const result = res.data?.checkSignupAvailability;

      if (result?.field === "email") {
        const exists = !result.available;

        setEmailExists?.(exists);
        setEmailError?.(exists ? "Email already exists" : "");
      }

    } catch (err) {
      // optional safety fallback
      setEmailError?.("Unable to check email");
    } finally {
      setCheckingEmail(false);
    }
  }, 600);

  return () => clearTimeout(timeout);
}, [email]);

useEffect(() => {
  const idRegex = /^\d{3}-\d{5}$/;

  if (!studentId) {
    setStudentIdError("");
    return;
  }

  if (!idRegex.test(studentId)) {
    setStudentIdError("");
    return;
  }

  let isActive = true;

  const timeout = setTimeout(async () => {
    try {
      const res = await checkAvailability({
        variables: {
          StudentId: studentId
        },
      });

      if (!isActive) return;

      const result =
        res.data?.checkSignupAvailability;

      if (result?.field === "StudentId") {

        if (!result.available) {

          setStudentIdError(
            "Student ID already registered."
          );

        } else {

          setStudentIdError("");

        }
      }

    } catch (err) {

      if (isActive) {
        setStudentIdError("");
      }

    }
  }, 500);

  return () => {
    isActive = false;
    clearTimeout(timeout);
  };

}, [studentId, checkAvailability]);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* BACKGROUND */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            currentBackground
              ? `url(${currentBackground})`
              : 'none',
          backgroundSize: 'cover',
          backgroundPosition:
            'center',
        }}
      />

      {/* DARK OVERLAY */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'rgba(0,0,0,0.62)',
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          display: 'flex',
          justifyContent:
            'center',
        }}
      >
       <AuthForm
  title="SIGN UP"
  buttonText="Create Account"
  onSubmit={handleSignup}
  loading={loading}
  error={error?.message}
  mode="signup"
  emailError={emailError}
  setEmailError={setEmailError}
  studentIdError={studentIdError}
  setStudentIdError={setStudentIdError}
  checkingEmail={checkingEmail}
/>
      </div>
    </div>
  );
}