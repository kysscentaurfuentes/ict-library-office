import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Check,
  X,
  Mail,
  BookOpen,
  Eye,
  Clock,
  Users,
  Hourglass,
} from "lucide-react";

import {
  useState,
  useEffect,
} from "react";

const GET_PENDING_USERS = gql`
  query {
    pendingUsers {
      id
      first_name
      middle_name
      last_name
      suffix
      email
      StudentId
      course
      school_id_image
    }
  }
`;

const APPROVE_USER = gql`
  mutation ($userId: Int!) {
    approveUser(userId: $userId)
  }
`;

const REJECT_USER = gql`
  mutation ($userId: Int!) {
    rejectUser(userId: $userId)
  }
`;

export default function AdminDashboard() {
  const { data, refetch, loading } =
    useQuery(GET_PENDING_USERS);

  const [approveUser] =
    useMutation(APPROVE_USER);

  const [rejectUser] =
    useMutation(REJECT_USER);

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [isDarkMode, setIsDarkMode] =
    useState(false);

  useEffect(() => {
    const savedDarkMode =
      localStorage.getItem(
        "darkMode"
      );

    setIsDarkMode(
      savedDarkMode === "true"
    );
  }, []);

  const theme = {
    pageBg: isDarkMode
      ? "#0f172a"
      : "#f8fafc",

    cardBg: isDarkMode
      ? "#1e293b"
      : "#ffffff",

    border: isDarkMode
      ? "#334155"
      : "#e2e8f0",

    text: isDarkMode
      ? "#f8fafc"
      : "#0f172a",

    subText: isDarkMode
      ? "#94a3b8"
      : "#64748b",

    primary: "#2563eb",

    accent: "#3b82f6",

    approve: "#15803d",

    reject: "#b91c1c",

    modalBg:
      "rgba(0,0,0,0.85)",
  };

  const handleApprove = async (
    id: number
  ) => {
    setProcessingId(id);

    await approveUser({
      variables: {
        userId: id,
      },
    });

    await refetch();

    setProcessingId(null);
  };

  const handleReject = async (
    id: number
  ) => {
    setProcessingId(id);

    await rejectUser({
      variables: {
        userId: id,
      },
    });

    await refetch();

    setProcessingId(null);
  };

  const formatName = (
    u: any
  ) => {
    return [
      u.first_name,
      u.middle_name,
      u.last_name,
      u.suffix,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getInitials = (
    u: any
  ) => {
    const first =
      u.first_name?.[0] || "";

    const last =
      u.last_name?.[0] || "";

    return (
      first + last
    ).toUpperCase();
  };

  const stats = {
    total:
      data?.pendingUsers
        ?.length || 0,

    pending:
      data?.pendingUsers
        ?.length || 0,
  };

  return (
    <div
      style={{
        height: "auto",
        boxSizing:
          "border-box",
        background:
          theme.pageBg,
        color:
          theme.text,
        padding: 32,
        fontFamily:
          "Inter, system-ui, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: 32,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
          }}
        >
          Pending Approvals
        </h1>

        <p
          style={{
            color:
              theme.subText,
            display: "flex",
            alignItems:
              "center",
            gap: 6,
            marginTop: 8,
          }}
        >
          <Clock size={14} />
          Review student accounts
        </p>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Applications */}
        <div
          style={{
            background:
              theme.cardBg,
            border:
              `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 20,
            width: 220,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems:
                "center",
            }}
          >
            <Users size={20} />

            <div>
              <div
                style={{
                  color:
                    theme.subText,
                  fontSize: 13,
                }}
              >
                Applications
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {stats.total}
              </div>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div
          style={{
            background:
              theme.cardBg,
            border:
              `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 20,
            width: 220,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems:
                "center",
            }}
          >
            <Hourglass size={20} />

            <div>
              <div
                style={{
                  color:
                    theme.subText,
                  fontSize: 13,
                }}
              >
                Pending
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {stats.pending}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* USER LIST */}
      <div
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: 16,
        }}
      >
        {loading ? (
          <div>
            Loading...
          </div>
        ) : (
          data?.pendingUsers?.map(
            (
              user: any
            ) => (
              <div
                key={user.id}
                style={{
                  background:
                    theme.cardBg,
                  border:
                    `1px solid ${theme.border}`,
                  borderRadius: 16,
                  padding: 20,
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 20,
                }}
              >
                {/* LEFT */}
                <div
                  style={{
                    display:
                      "flex",
                    gap: 16,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background:
                        theme.primary,
                      display:
                        "flex",
                      justifyContent:
                        "center",
                      alignItems:
                        "center",
                      fontWeight: 700,
                      color:
                        "white",
                    }}
                  >
                    {getInitials(
                      user
                    )}
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 16,
                      }}
                    >
                      {formatName(
                        user
                      )}
                    </div>

                    <div
                      style={{
                        color:
                          theme.subText,
                        display:
                          "flex",
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <Mail size={14} />
                      {user.email}
                    </div>

                    <div
                      style={{
                        color:
                          theme.subText,
                        display:
                          "flex",
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <BookOpen size={14} />
                      {user.course}
                    </div>

                    {user.school_id_image && (
                      <button
                        onClick={() =>
                          setPreviewImage(
                            user.school_id_image
                          )
                        }
                        style={{
                          marginTop: 8,
                          background:
                            "none",
                          border:
                            "none",
                          color:
                            theme.accent,
                          cursor:
                            "pointer",
                          padding: 0,
                          display:
                            "flex",
                          gap: 6,
                          alignItems:
                            "center",
                        }}
                      >
                        <Eye size={14} />
                        View School ID
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div
                  style={{
                    display:
                      "flex",
                    gap: 8,
                    alignItems:
                      "center",
                  }}
                >
                  {/* APPROVE */}
                  <button
                    disabled={
                      processingId ===
                      Number(
                        user.id
                      )
                    }
                    onClick={() =>
                      handleApprove(
                        Number(
                          user.id
                        )
                      )
                    }
                    onMouseEnter={(
                      e
                    ) => {
                      e.currentTarget.style.background =
                        theme.approve;
                    }}
                    onMouseLeave={(
                      e
                    ) => {
                      e.currentTarget.style.background =
                        "transparent";
                    }}
                    style={{
                      border:
                        `2px solid ${theme.approve}`,
                      borderRadius: 10,
                      padding:
                        "10px 12px",
                      cursor:
                        "pointer",
                      background:
                        "transparent",
                      transition:
                        "0.2s",
                    }}
                  >
                    <Check
                      color={
                        theme.approve
                      }
                      strokeWidth={
                        3
                      }
                    />
                  </button>

                  {/* REJECT */}
                  <button
                    disabled={
                      processingId ===
                      Number(
                        user.id
                      )
                    }
                    onClick={() =>
                      handleReject(
                        Number(
                          user.id
                        )
                      )
                    }
                    onMouseEnter={(
                      e
                    ) => {
                      e.currentTarget.style.background =
                        theme.reject;
                    }}
                    onMouseLeave={(
                      e
                    ) => {
                      e.currentTarget.style.background =
                        "transparent";
                    }}
                    style={{
                      border:
                        `2px solid ${theme.reject}`,
                      borderRadius: 10,
                      padding:
                        "10px 12px",
                      cursor:
                        "pointer",
                      background:
                        "transparent",
                      transition:
                        "0.2s",
                    }}
                  >
                    <X
                      color={
                        theme.reject
                      }
                      strokeWidth={
                        3
                      }
                    />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          onClick={() =>
            setPreviewImage(
              null
            )
          }
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              theme.modalBg,
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 9999,
          }}
        >
          <img
            src={
              previewImage ||
              undefined
            }
            alt="School ID"
            onClick={(
              e
            ) =>
              e.stopPropagation()
            }
            style={{
              maxWidth:
                "90%",
              maxHeight:
                "90%",
              borderRadius: 12,
            }}
          />
        </div>
      )}
    </div>
  );
}