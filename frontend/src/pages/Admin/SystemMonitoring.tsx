// frontend/src/pages/Admin/SystemMonitoring.tsx

export default function SystemMonitoring() {
  return (
    <div
      style={{
        height: "calc(100dvh - 70px)",
        overflow: "hidden",
      }}
    >
      <iframe
        src="http://localhost:3000/d/adx46p7/ict-infrastructure-monitoring?orgId=1&kiosk"

        style={{
          width: "100%",

          // 🔥 IMPORTANT
          height: "calc(100% - 4px)",

          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}