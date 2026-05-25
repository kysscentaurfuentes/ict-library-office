// frontend/src/components/AdminTopbar.tsx

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  ShieldAlert,
  Clock3,
  ScanLine,
} from "lucide-react";

export default function AdminTopbar() {

  const location = useLocation();

  const navItems = [
    {
      label: "Pending",
      path: "/admin",
      icon: <Clock3 size={16} />,
    },

    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: <ShieldAlert size={16} />,
    },

    {
      label: "Scan Logs",
      path: "/admin/scan-logs",
      icon: <ScanLine size={16} />,
    },
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        height: 70,
        background: "#020617",
        borderBottom: "1px solid #1e293b",

        display: "flex",
        alignItems: "center",
        paddingLeft: 24,
        paddingRight: 24,
        gap: 12,
      }}
    >

      {
        navItems.map((item) => {

          const isActive =
            location.pathname === item.path;

          return (

            <Link
              key={item.path}
              to={item.path}

              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,

                padding: "10px 16px",

                borderRadius: 10,

                textDecoration: "none",

                transition: "0.2s ease",

                background:
                  isActive
                    ? "#1e293b"
                    : "transparent",

                color:
                  isActive
                    ? "#60a5fa"
                    : "#ffffff",

                fontWeight: 600,

                border:
                  isActive
                    ? "1px solid #334155"
                    : "1px solid transparent",
              }}

              onMouseEnter={(e) => {

                if (!isActive) {

                  e.currentTarget.style.background =
                    "#0f172a";
                }
              }}

              onMouseLeave={(e) => {

                if (!isActive) {

                  e.currentTarget.style.background =
                    "transparent";
                }
              }}
            >

              {item.icon}

              {item.label}

            </Link>
          );
        })
      }

    </div>
  );
}