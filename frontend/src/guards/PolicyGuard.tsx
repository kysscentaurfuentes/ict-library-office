// frontend/src/guards/PolicyGuard.tsx
import { ReactNode, useEffect } from "react";
import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import {
  CURRENT_POLICY_VERSION
} from "../constants/policy";

const ME = gql`
  query Me {
    me {
      id
      policy_version
    }
  }
`;

type Props = {
  children: ReactNode;
};

export default function PolicyGuard({
  children,
}: Props) {

  const token =
    localStorage.getItem("token");

  const {
    data,
    loading,
    error,
  } = useQuery(ME, {
    skip: !token,
    fetchPolicy: "network-only",
  });

  useEffect(() => {

    if (!token) {
      return;
    }

    if (loading) {
      return;
    }

    if (error) {
      return;
    }

    const user =
      data?.me;

    if (!user) {
      return;
    }

    console.log(
      "[POLICY CHECK]",
      {
        current:
          CURRENT_POLICY_VERSION,
        user:
          user.policy_version,
      }
    );

    if (
      user.policy_version !==
      CURRENT_POLICY_VERSION
    ) {

      window.location.hash =
        "#/policy-update";
    }

  }, [
    token,
    loading,
    error,
    data
  ]);

  return <>{children}</>;
}