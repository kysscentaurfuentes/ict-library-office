// frontend/src/auth/TwoFactor.tsx
import { useState } from "react";
import { gql } from "@apollo/client/core";
import { useMutation } from "@apollo/client/react";

const VERIFY_2FA = gql`
  mutation VerifyTwoFactor($identifier: String!, $code: String!) {
    verifyTwoFactor(identifier: $identifier, code: $code) {
      token
      user {
        id
        first_name
        last_name
        role
        StudentId
        profile_picture
        vibration_enabled
        dark_mode
      }
    }
  }
`;

type VerifyResponse = {
  verifyTwoFactor: {
    token: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      role: string;
      StudentId: string;
      profile_picture?: string;
      vibration_enabled?: boolean;
      dark_mode?: boolean;
    };
  };
};

type VerifyVars = {
  identifier: string;
  code: string;
};

export default function TwoFactor() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [verifyTwoFactor] = useMutation<VerifyResponse, VerifyVars>(VERIFY_2FA);

  const handleVerify = async () => {
    const identifier = localStorage.getItem("pendingIdentifier");

    if (!identifier) {
      setError("Missing login session. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const res = await verifyTwoFactor({
        variables: {
          identifier,
          code,
        },
      });

      const result = res.data?.verifyTwoFactor;

      if (!result?.token) {
        setError("Invalid or expired code");
        return;
      }

      // save auth
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.removeItem("pendingIdentifier");

      // redirect
      window.location.hash = "#/homescreen";
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: "10px",
      color: "white"
    }}>
      <h2>Two-Factor Authentication</h2>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter 6-digit code"
        style={{
          padding: "10px",
          fontSize: "18px",
          textAlign: "center"
        }}
      />

      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}