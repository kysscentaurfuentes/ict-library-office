// frontend/src/pages/SignUp.tsx

import { gql } from '@apollo/client/core';
import { useMutation } from '@apollo/client/react';
import AuthForm from '../components/AuthForm';
import { useDynamicBackground } from '../hooks/useDynamicBackground';

const SIGNUP = gql`
mutation Signup(
  $first_name: String!
  $middle_name: String
  $last_name: String!
  $email: String!
  $password: String!
  $course: String!
  $StudentId: String!
  $school_id_image: String!
) {
  signup(
    first_name: $first_name
    middle_name: $middle_name
    last_name: $last_name
    email: $email
    password: $password
    course: $course
    StudentId: $StudentId
    school_id_image: $school_id_image
  ) {
    token
    user {
      first_name
      StudentId
      role
    }
  }
}
`;

type SignupResponse = {
  signup: {
    token: string;
    user: {
      first_name: string;
      StudentId: string;
      role: string;
    };
  };
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
  const [signup, { loading, error }] =
    useMutation<
      SignupResponse,
      SignupVariables
    >(SIGNUP);

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

  if (!studentId || studentId.length !== 9) {
    return;
  }

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
  "school-id"
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
  throw new Error("Upload failed");
}

    const uploadData =
      await uploadRes.json();

    const imageUrl =
      uploadData.imageUrl;

    // =========================
    // NOW CREATE ACCOUNT
    // =========================
    const res = await signup({
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

    if (!res.data?.signup.token) {
  alert(
    "Account created successfully. Your account is pending Admin approval."
  );

  window.location.hash = "#/signin";
  return;
}

  } catch (err) {

    console.error(
      'Signup failed:',
      err
    );

    localStorage.removeItem(
      'token'
    );

    alert("Signup failed");
  }
};

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
            'rgba(0,0,0,0.45)',
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
        />
      </div>
    </div>
  );
}