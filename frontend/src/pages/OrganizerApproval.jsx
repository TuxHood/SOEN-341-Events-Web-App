import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function AdminOrganizerApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/users/${id}/approve_organizer/`);
      fetchUsers();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/api/users/${id}/reject_organizer/`);
      fetchUsers();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h2 style={{ color: "#6b7280" }}>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", paddingBottom: "60px" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px", color: "#111827" }}>
            Organizer Approval Panel
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            Approve or reject pending organizer account requests
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {users.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>No users found.</p>
        ) : (
          <div style={{ display: "grid", gap: "24px" }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  background: "#fff",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827" }}>{user.name}</h3>
                  <p style={{ color: "#6b7280", fontSize: "14px" }}>{user.email}</p>
                  <p style={{ color: "#374151", fontSize: "14px", marginTop: "6px" }}>
                    Role: {user.role} | Status:{" "}
                    <span
                      style={{
                        color:
                          user.status === "pending"
                            ? "#eab308"
                            : user.status === "active"
                            ? "#22c55e"
                            : "#ef4444",
                        fontWeight: 600
                      }}
                    >
                      {user.status}
                    </span>
                  </p>
                </div>

                {user.role === "organizer" && user.status === "pending" && (
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button
                      onClick={() => handleApprove(user.id)}
                      style={{
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

