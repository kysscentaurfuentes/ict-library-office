// frontend/src/auth/PolicyAcknowledgement.tsx
import { useState, useEffect } from "react";
import { policySteps } from "./policies/policySteps";
import { gql } from "@apollo/client/core";
import { useMutation } from "@apollo/client/react";
import {
  CURRENT_POLICY_VERSION
} from "../constants/policy";

const ACCEPT_POLICY_UPDATE = gql`
mutation AcceptPolicyUpdate(
  $policyVersion: String!
) {
  acceptPolicyUpdate(
    policyVersion: $policyVersion
  )
}
`;

export default function PolicyAcknowledgement() {

  const [currentStep, setCurrentStep] =
    useState(0);

  const [typedValue, setTypedValue] =
    useState("");

  const [acknowledged, setAcknowledged] =
    useState(false);

    const [
  hasRestoredPolicyStep,
  setHasRestoredPolicyStep
] = useState(false);

const [
  acceptPolicyUpdate
] = useMutation(
  ACCEPT_POLICY_UPDATE
);

const isPolicyUpdate =
  window.location.hash ===
  "#/policy-update";

    useEffect(() => {

  const savedStep =
    sessionStorage.getItem(
      "policyCurrentStep"
    );

  console.log(
    "[POLICY RESTORE] RAW:",
    savedStep
  );

  if (!savedStep) {

    setHasRestoredPolicyStep(true);

    return;
  }

  const parsedStep =
    Number(savedStep);

  console.log(
    "[POLICY RESTORE] PARSED:",
    parsedStep
  );

  if (
    !Number.isNaN(parsedStep)
  ) {

    setCurrentStep(
      parsedStep
    );
  }

  setHasRestoredPolicyStep(true);

}, []);

  const currentPolicy =
    policySteps[currentStep];

  const isLastStep =
    currentStep ===
    policySteps.length - 1;

 useEffect(() => {

  if (
    !hasRestoredPolicyStep
  ) {
    return;
  }

  console.log(
    "[POLICY AUTOSAVE]",
    currentStep
  );

  sessionStorage.setItem(
    "policyCurrentStep",
    String(currentStep)
  );

}, [
  currentStep,
  hasRestoredPolicyStep
]);

 const handleNext = async () => {

  if (isLastStep) {

  sessionStorage.setItem(
    "policyAccepted",
    "true"
  );

  // =========================
  // POLICY UPDATE MODE
  // =========================
  if (isPolicyUpdate) {

    try {

  await acceptPolicyUpdate({
  variables: {
    policyVersion:
      CURRENT_POLICY_VERSION
  }
});

sessionStorage.removeItem(
  "policyCurrentStep"
);

      window.location.hash =
        "#/homescreen";

      return;

    } catch (err) {

      console.error(
        "POLICY UPDATE FAILED:",
        err
      );

      alert(
        "Failed to update policy acknowledgement."
      );

      return;
    }
  }

  // =========================
  // NORMAL SIGNUP FLOW
  // =========================
  window.location.hash =
    "#/signup";

  return;
}
    setCurrentStep((prev) => prev + 1);

    setAcknowledged(false);

    setTypedValue("");
  };

  const handleBack = () => {

    if (currentStep === 0) {
      return;
    }

    setCurrentStep((prev) => prev - 1);

    setAcknowledged(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Poppins",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "750px",
          background:
            "rgba(255,255,255,0.06)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          padding: "40px",
          backdropFilter: "blur(18px)",
        }}
      >

        {/* PROGRESS */}
        <p
          style={{
            color: "#a78bfa",
            fontWeight: 700,
            marginBottom: "14px",
          }}
        >
          Step {currentStep + 1} of{" "}
          {policySteps.length}
        </p>

        {/* TITLE */}
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "20px",
          }}
        >
          {currentPolicy.title}
        </h1>

        {/* CONTENT */}
        <p
          style={{
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.88)",
            fontSize: "1rem",
          }}
        >
          {currentPolicy.content}
        </p>

        {/* ACKNOWLEDGEMENT */}
        <div
          style={{
            marginTop: "35px",
          }}
        >

          {currentPolicy.acknowledgementType ===
          "button" ? (

            <button
              onClick={() =>
                setAcknowledged(true)
              }
              style={{
                padding: "12px 22px",
                border: "none",
                borderRadius: "10px",
                background: "#8b5cf6",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              I Understand
            </button>

          ) : (

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <label>
                Type AGREE to continue
              </label>

              <input
                type="text"
                value={typedValue}
                onChange={(e) => {

                  const value =
                    e.target.value;

                  setTypedValue(value);

                  setAcknowledged(
                    value.trim()
                      .toUpperCase() ===
                      "AGREE"
                  );
                }}
                placeholder="Type AGREE"
                style={{
                  height: "50px",
                  borderRadius: "10px",
                  border:
                    "1px solid rgba(255,255,255,0.12)",
                  background:
                    "rgba(255,255,255,0.06)",
                  color: "#fff",
                  padding: "0 16px",
                  fontSize: "1rem",
                }}
              />
            </div>

          )}
        </div>

        {/* BUTTONS */}
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >

          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            style={{
              padding: "12px 22px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              opacity:
                currentStep === 0
                  ? 0.5
                  : 1,
            }}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!acknowledged}
            style={{
              padding: "12px 22px",
              borderRadius: "10px",
              border: "none",
              background: "#8b5cf6",
              color: "#fff",
              fontWeight: 700,
              cursor:
                !acknowledged
                  ? "not-allowed"
                  : "pointer",

              opacity:
                !acknowledged
                  ? 0.5
                  : 1,
            }}
          >
            {isLastStep
              ? "Finish"
              : "Next"}
          </button>

        </div>
      </div>
    </div>
  );
}