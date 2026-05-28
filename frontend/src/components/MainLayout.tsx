// frontend/src/components/MainLayout.tsx

import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import AdminTopbar from "./AdminTopbar";

export default function MainLayout() {

  const [
    hoveredFromParent,
    setHoverFromParent,
  ] = useState<string | null>(null);

  // =========================================
  // ROLE CHECK
  // =========================================

  const role =
    localStorage.getItem("role");

  const isAdmin =
    role === "Admin";

  return (

    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100dvh",
        background: "#0f172a",
        overflow: "hidden",
      }}
    >

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <Sidebar
        hoveredFromParent={
          hoveredFromParent
        }
        setHoverFromParent={
          setHoverFromParent
        }
      />

      {/* =====================================
          RIGHT SIDE
      ===================================== */}

      <div
        style={{
          marginLeft: "260px",

          flex: 1,

          height: "100dvh",

          display: "flex",
          flexDirection: "column",

          minWidth: 0,

          overflow: "hidden",
        }}
      >

        {/* =================================
            ADMIN TOPBAR
        ================================= */}

        {
          isAdmin && (
            <AdminTopbar />
          )
        }

        {/* =================================
            PAGE CONTENT
        ================================= */}

        <div
          style={{
            flex: 1,

            overflowX: "hidden",
            overflowY: "auto",

            minHeight: 0,
          }}
        >

          <Outlet
            context={{
              setHoverFromParent,
            }}
          />

        </div>

      </div>

    </div>
  );
}