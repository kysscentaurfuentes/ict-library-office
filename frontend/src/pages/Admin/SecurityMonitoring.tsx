// frontend/src/pages/Admin/SecurityMonitoring.tsx

export default function SecurityMonitoring() {

  return (

    <iframe
      src="http://localhost:3000/d/ad7p8ht/ict-surveillance-ai?kiosk"

      style={{
        width: "100%",

        height:
          "calc(100vh - 70px)",

        border: "none",

        display: "block",
      }}
    />

  );
}