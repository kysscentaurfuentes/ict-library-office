// frontend/src/guards/AdminRoute.tsx

import {
  useQuery,
  gql,
} from "@apollo/client";

import {
  Navigate,
} from "react-router-dom";

const ME = gql`
  query {
    me {
      role
    }
  }
`;

type Props = {
  children: React.ReactNode;
};

export default function AdminRoute({
  children,
}: Props) {

  const token =
    localStorage.getItem(
      "token"
    );

  const storedRole =
    localStorage
      .getItem("role");

  const {
    data,
    loading,
    error,
  } = useQuery(ME, {

    skip: !token,

    fetchPolicy:
      "cache-first",

    errorPolicy:
      "all",
  });

  // =====================================
  // NO TOKEN
  // =====================================

  if (!token) {

    return (
      <Navigate
        to="/signin"
        replace
      />
    );
  }

  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (
      <div
        style={{
          color: "white",
          padding: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  // =====================================
  // BACKEND TEMP ERROR
  // KEEP LOCAL SESSION
  // =====================================

  if (error) {

    console.warn(
      "AdminRoute backend error:",
      error
    );

    // fallback to localStorage
    if (
      storedRole === "Admin"
    ) {

      return <>{children}</>;
    }

    return (
      <Navigate
        to="/homescreen"
        replace
      />
    );
  }

  // =====================================
  // ROLE CHECK
  // =====================================

  if (
    data?.me?.role !==
    "Admin"
  ) {

    return (
      <Navigate
        to="/homescreen"
        replace
      />
    );
  }

  console.log(
  "ADMIN ROUTE ROLE:",
  data?.me?.role
);

console.log(
  "LOCAL ROLE:",
  storedRole
);

console.log(
  "ADMIN ROUTE ERROR:",
  error
);

  return <>{children}</>;
}