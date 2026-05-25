// frontend/src/pages/Admin/AuditLogs.tsx

import {
  gql,
  useQuery,
} from "@apollo/client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Activity,
  AlertTriangle,
  Clock3,
  Globe,
} from "lucide-react";

const GET_AUDIT_LOGS = gql`
  query {
    auditLogs {
      id
      action
      severity
      source
      ip_address
      created_at
      metadata
      target_table
      target_id
      user_agent
    }
  }
`;

const thStyle = {
  textAlign: "left" as const,
  padding: "16px",
  fontSize: "0.85rem",
  color: "#94a3b8",
  fontWeight: 600,
};

const tdStyle = {
  padding: "16px",
  fontSize: "0.92rem",
  color: "#f8fafc",
};

export default function AuditLogs() {

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(GET_AUDIT_LOGS, {
    pollInterval: 5000, // 🔥 realtime refresh every 5 sec
  });

  const [search, setSearch] =
    useState("");

  const [severityFilter, setSeverityFilter] =
    useState("ALL");

  const [sourceFilter, setSourceFilter] =
    useState("ALL");

  const [selectedLog, setSelectedLog] =
    useState<any>(null);

  useEffect(() => {
    console.log(
      "🔥 AUDIT LOGS:",
      data
    );
  }, [data]);

  const logs =
    data?.auditLogs || [];

  const filteredLogs =
    useMemo(() => {

      return logs.filter((log: any) => {

        const matchesSearch =
          log.action
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          log.ip_address
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          log.source
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesSeverity =
          severityFilter === "ALL"
            ? true
            : log.severity ===
              severityFilter;

        const matchesSource =
          sourceFilter === "ALL"
            ? true
            : log.source ===
              sourceFilter;

        return (
          matchesSearch &&
          matchesSeverity &&
          matchesSource
        );

      });

    }, [
      logs,
      search,
      severityFilter,
      sourceFilter,
    ]);

  const stats = {

    total:
      logs.length,

    failedLogins:
      logs.filter(
        (x: any) =>
          x.action ===
          "FAILED_LOGIN"
      ).length,

    successfulLogins:
      logs.filter(
        (x: any) =>
          x.action ===
          "SUCCESSFUL_LOGIN"
      ).length,

    passwordResets:
      logs.filter(
        (x: any) =>
          x.action?.includes(
            "PASSWORD_RESET"
          )
      ).length,

    critical:
      logs.filter(
        (x: any) =>
          x.severity ===
          "CRITICAL"
      ).length,
  };

  const getSeverityColor = (
    severity: string
  ) => {

    switch (severity) {

      case "CRITICAL":
        return "#7f1d1d";

      case "ERROR":
        return "#9a3412";

      case "WARNING":
        return "#854d0e";

      default:
        return "#1d4ed8";
    }
  };

  const getActionColor = (
    action: string
  ) => {

    if (
      action?.includes(
        "FAILED"
      )
    ) {
      return "#ef4444";
    }

    if (
      action?.includes(
        "SUCCESS"
      )
    ) {
      return "#22c55e";
    }

    if (
      action?.includes(
        "BLOCKED"
      )
    ) {
      return "#f97316";
    }

    return "#cbd5e1";
  };

  if (loading) {
    return (
      <div
        style={{
          color: "white",
          padding: 40,
        }}
      >
        Loading audit logs...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          color: "#ef4444",
          padding: 40,
        }}
      >
        Error loading audit logs.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        color: "white",
        background:
          "#020617",
        minHeight: "100vh",
      }}
    >

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "2.2rem",
              fontWeight: 800,
            }}
          >
            SIEM Audit Logs
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: 8,
            }}
          >
            Security Event Monitoring Dashboard
          </p>
        </div>

        <button
          onClick={() => refetch()}
          style={{
            border: "none",
            background: "#2563eb",
            color: "white",
            padding:
              "10px 18px",
            borderRadius: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >

        <Card
          icon={
            <Activity size={20} />
          }
          title="Total Logs"
          value={stats.total}
        />

        <Card
          icon={
            <ShieldAlert size={20} />
          }
          title="Failed Logins"
          value={
            stats.failedLogins
          }
        />

        <Card
          icon={
            <ShieldCheck size={20} />
          }
          title="Successful Logins"
          value={
            stats.successfulLogins
          }
        />

        <Card
          icon={
            <AlertTriangle size={20} />
          }
          title="Critical Events"
          value={
            stats.critical
          }
        />

      </div>

      {/* FILTER BAR */}
      <div
        style={{
  display: "grid",
  gridTemplateColumns:
    "minmax(300px, 1fr) 180px 180px",
  gap: 12,
  alignItems: "center",
          marginBottom: 24,
          background:
            "#0f172a",
          padding: 16,
          borderRadius: 16,
          border:
            "1px solid #1e293b",
        }}
      >

        {/* SEARCH */}
       <div
  style={{
    flex: "0 1 600px",
    minWidth: 260,
    maxWidth: 700,
    position: "relative",
  }}
>
          <Search
            size={16}
            style={{
              position:
                "absolute",
              left: 12,
              top: 12,
              color:
                "#94a3b8",
            }}
          />

          <input
            placeholder="Search action, source, IP..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              width: "100%",
              background:
                "#111827",
              border:
                "1px solid #334155",
              borderRadius: 12,
              padding:
                "10px 12px 10px 38px",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        {/* SEVERITY */}
        <select
          value={
            severityFilter
          }
          onChange={(e) =>
            setSeverityFilter(
              e.target.value
            )
          }
          style={selectStyle}
        >
          <option value="ALL">
            All Severity
          </option>

          <option value="INFO">
            INFO
          </option>

          <option value="WARNING">
            WARNING
          </option>

          <option value="ERROR">
            ERROR
          </option>

          <option value="CRITICAL">
            CRITICAL
          </option>
        </select>

        {/* SOURCE */}
        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(
              e.target.value
            )
          }
          style={selectStyle}
        >
          <option value="ALL">
            All Source
          </option>

          <option value="backend">
            backend
          </option>

          <option value="frontend">
            frontend
          </option>

          <option value="system">
            system
          </option>
        </select>

      </div>

      {/* TABLE */}
      <div
        style={{
          background:
            "#0f172a",
          borderRadius: 20,
          overflow: "hidden",
          border:
            "1px solid #1e293b",
        }}
      >

        <div
          style={{
            overflowX: "auto",
          }}
        >

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >

            <thead
              style={{
                background:
                  "#111827",
                position:
                  "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <tr>

                <th style={thStyle}>
                  Action
                </th>

                <th style={thStyle}>
                  Severity
                </th>

                <th style={thStyle}>
                  Source
                </th>

                <th style={thStyle}>
                  IP Address
                </th>

                <th style={thStyle}>
                  Time
                </th>

                <th style={thStyle}>
                  Details
                </th>                
                
                <th style={thStyle}>
                  Target
                </th>

                <th style={thStyle}>
                  Metadata
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredLogs.map(
                (log: any) => (

                  <tr
                    key={log.id}
                    onClick={() =>
                      setSelectedLog(
                        log
                      )
                    }
                    style={{
                      borderBottom:
                        "1px solid #1e293b",

                      cursor:
                        "pointer",

                      transition:
                        "0.2s",
                    }}
                  >

                    <td
                      style={{
                        ...tdStyle,
                        color:
                          getActionColor(
                            log.action
                          ),
                        fontWeight: 700,
                      }}
                    >
                      {log.action}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          padding:
                            "4px 12px",

                          borderRadius:
                            "999px",

                          background:
                            getSeverityColor(
                              log.severity
                            ),

                          fontSize:
                            "0.8rem",

                          fontWeight: 700,
                        }}
                      >
                        {
                          log.severity
                        }
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {log.source}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 8,
                        }}
                      >
                        <Globe size={15} />
                        {
                          log.ip_address
                        }
                      </div>
                    </td>

                 <td style={tdStyle}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <Clock3 size={15} />

    {
      log.created_at
        ? (() => {

            const timestamp =
              Number(log.created_at);

            // UNIX TIMESTAMP (milliseconds)
            if (!isNaN(timestamp)) {

              return new Date(
                timestamp
              ).toLocaleString();
            }

            // NORMAL SQL TIMESTAMP
            return new Date(
              String(log.created_at)
                .replace(" ", "T")
            ).toLocaleString();

          })()
        : "N/A"
    }

  </div>
</td>

                    <td style={tdStyle}>
  <div>
    <div
      style={{
        fontWeight: 700,
        color: "#e2e8f0",
      }}
    >
      {log.target_table || "N/A"}
    </div>

    <div
      style={{
        fontSize: "0.75rem",
        color: "#64748b",
      }}
    >
      ID: {log.target_id || "N/A"}
    </div>
  </div>
</td>

<td
  style={{
    ...tdStyle,
    maxWidth: 260,
  }}
>
  <div
    style={{
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: "#94a3b8",
      fontSize: "0.82rem",
    }}
  >
    {log.metadata || "No metadata"}
  </div>
</td>

                    <td style={tdStyle}>
                      <button
                        style={{
                          background:
                            "#1d4ed8",

                          border:
                            "none",

                          color:
                            "white",

                          padding:
                            "8px 12px",

                          borderRadius:
                            10,

                          cursor:
                            "pointer",
                        }}
                      >
                        View
                      </button>
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}
      {selectedLog && (

        <div
          onClick={() =>
            setSelectedLog(
              null
            )
          }
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 99999,
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              background:
                "#0f172a",

              width: "90%",
              maxWidth: 700,

              borderRadius: 20,

              padding: 24,

              border:
                "1px solid #334155",
            }}
          >

            <h2
              style={{
                marginTop: 0,
              }}
            >
              Log Details
            </h2>

            <div
  style={{
    marginBottom: 20,
    display: "grid",
    gap: 10,
  }}
>

  <div>
    <strong>Action:</strong>
    {" "}
    {selectedLog.action}
  </div>

  <div>
    <strong>Severity:</strong>
    {" "}
    {selectedLog.severity}
  </div>

  <div>
    <strong>Source:</strong>
    {" "}
    {selectedLog.source}
  </div>

  <div>
    <strong>IP Address:</strong>
    {" "}
    {selectedLog.ip_address}
  </div>

  <div>
    <strong>User Agent:</strong>
    {" "}
    {selectedLog.user_agent}
  </div>

  <div>
  <strong>Created At:</strong>
  {" "}

  {
    selectedLog.created_at
      ? (() => {

          const timestamp =
            Number(
              selectedLog.created_at
            );

          // UNIX TIMESTAMP
          if (!isNaN(timestamp)) {

            return new Date(
              timestamp
            ).toLocaleString();
          }

          // SQL TIMESTAMP
          return new Date(
            String(
              selectedLog.created_at
            ).replace(
              " ",
              "T"
            )
          ).toLocaleString();

        })()
      : "N/A"
  }
</div>

</div>

            <pre
              style={{
                whiteSpace:
                  "pre-wrap",

                color:
                  "#cbd5e1",

                overflowX:
                  "auto",
              }}
            >
{JSON.stringify(
  selectedLog,
  null,
  2
)}
            </pre>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================
   CARD COMPONENT
========================= */

function Card({
  icon,
  title,
  value,
}: any) {

  return (
    <div
      style={{
        background:
          "#0f172a",

        border:
          "1px solid #1e293b",

        borderRadius: 18,

        padding: 20,
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems:
            "center",
          gap: 10,

          marginBottom: 16,
        }}
      >
        {icon}

        <span
          style={{
            color:
              "#94a3b8",
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          fontSize: "2rem",
          fontWeight: 800,
        }}
      >
        {value}
      </div>

    </div>
  );
}

/* =========================
   STYLES
========================= */

const selectStyle = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: "10px 14px",
  color: "white",
  outline: "none",
};