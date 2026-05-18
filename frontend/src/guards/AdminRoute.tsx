// frontend/src/guards/AdminRoute.tsx
import { useQuery, gql } from "@apollo/client";
import { Navigate } from "react-router-dom";

const ME = gql`
  query {
    me {
      role
    }
  }
`;

export default function AdminRoute({ children }: any) {
  const token = localStorage.getItem("token");

  const { data, loading, error } = useQuery(ME, {
    skip: !token,
  });

  if (!token) {
    return <Navigate to="/signin" />;
  }

  if (loading) {
  return <div style={{ color: "white" }}>Loading...</div>;
}

  if (error || data?.me?.role !== "Admin") {
    return <Navigate to="/homescreen" />;
  }

  return children;
}