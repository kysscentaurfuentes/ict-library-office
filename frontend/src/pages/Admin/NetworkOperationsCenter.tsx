// frontend/src/pages/Admin/NetworkOperationsCenter.tsx

import React from "react";

export default function NetworkOperationsCenter() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#020617",
      }}
    >
      <iframe
        src="http://localhost:3000/d/adf7dsn/ict-network-operations-center?orgId=1&kiosk"
        width="100%"
        height="100%"
        style={{
          border: "none",
        }}
        title="ICT Network Operations Center"
      />
    </div>
  );
}