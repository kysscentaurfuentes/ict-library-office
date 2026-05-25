import { gql, useQuery } from "@apollo/client";

const GET_SCAN_LOGS = gql`
  query {

    scanLogs {

      id
      student_id
      device_id
      status
      created_at
      flag
      risk_score

    }
  }
`;

export default function ScanLogs() {

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(
    GET_SCAN_LOGS,
    {
      pollInterval: 3000,
    }
  );

  if (loading) {

    return (
      <div
        style={{
          color: "white",
          padding: 24,
        }}
      >
        Loading scan logs...
      </div>
    );
  }

  if (error) {

    return (
      <div
        style={{
          color: "red",
          padding: 24,
        }}
      >
        Error loading scan logs.
      </div>
    );
  }

  return (

    <div
      style={{
        padding: 24,
        color: "white",
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >

        <div>

          <h1
            style={{
              fontSize: 42,
              marginBottom: 4,
            }}
          >
            Scan Logs
          </h1>

          <div
            style={{
              color: "#94a3b8",
            }}
          >
            QR Scan Monitoring Dashboard
          </div>

        </div>

        <button
          onClick={() => refetch()}
          style={{
            background: "#2563eb",
            border: "none",
            color: "white",
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Refresh
        </button>

      </div>

      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >

          <thead>

            <tr
              style={{
                background: "#020617",
                color: "#94a3b8",
              }}
            >

              <th style={thStyle}>Student ID</th>
              <th style={thStyle}>Device ID</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Flag</th>
              <th style={thStyle}>Risk Score</th>
              <th style={thStyle}>Time</th>

            </tr>

          </thead>

          <tbody>

            {
              data?.scanLogs?.map(
                (log: any) => {

                  return (

                    <tr
                      key={log.id}
                      style={{
                        borderTop:
                          "1px solid #1e293b",
                      }}
                    >

                      <td style={tdStyle}>
                        {log.student_id}
                      </td>

                      <td style={tdStyle}>
                        {log.device_id}
                      </td>

                      <td style={tdStyle}>

                        <span
                          style={{
                            padding:
                              "6px 12px",

                            borderRadius: 999,

                            fontSize: 13,

                            fontWeight: 700,

                            background:
                              log.status === "success"
                                ? "rgba(34,197,94,0.15)"
                                : log.status === "fail"
                                ? "rgba(239,68,68,0.15)"
                                : "rgba(234,179,8,0.15)",

                            color:
                              log.status === "success"
                                ? "#22c55e"
                                : log.status === "fail"
                                ? "#ef4444"
                                : "#eab308",
                          }}
                        >
                          {log.status}
                        </span>

                      </td>

                      <td style={tdStyle}>
                        {log.flag || "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {log.risk_score}
                      </td>

                      <td style={tdStyle}>
                        {
                          new Date(
                            String(log.created_at)
                              .replace(" ", "T")
                          ).toLocaleString()
                        }
                      </td>

                    </tr>
                  );
                }
              )
            }

          </tbody>

        </table>

      </div>

    </div>
  );
}

const thStyle = {
  padding: "16px",
  textAlign: "left" as const,
  fontWeight: 700,
};

const tdStyle = {
  padding: "16px",
};