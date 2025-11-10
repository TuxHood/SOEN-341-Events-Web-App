import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/apiClient";

export default function AdminOrganizerApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [actionError, setActionError] = useState({});
  const [actionSuccess, setActionSuccess] = useState({});

  const fetchUsers = async () => {
    try {
    const res = await api.get("/users/");
      // Prefer known shapes from the backend when available
      const payload = res.data;
      if (Array.isArray(payload)) setUsers(payload);
      else if (payload && typeof payload === 'object') setUsers(payload.users ?? payload.results ?? payload);
      else setUsers([]);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      // surface a user-friendly error message (include status if available)
      const status = err.response?.status;
      const message = err.response?.data?.detail || err.message || 'Failed to fetch users.';
      setError(status ? `${status} - ${message}` : message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    setActionError((s) => ({ ...s, [id]: null }));
    setActionSuccess((s) => ({ ...s, [id]: null }));
    try {
      const res = await api.post(`/users/${id}/approve_organizer/`);
      console.debug('Approve response', res);
      setActionSuccess((s) => ({ ...s, [id]: 'approved' }));
      await fetchUsers();
    } catch (err) {
      console.error("Approve error:", err);
      const message = err.response?.data?.detail || err.response?.data || err.message || 'Approve failed';
      setActionError((s) => ({ ...s, [id]: String(message) }));
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    setActionError((s) => ({ ...s, [id]: null }));
    setActionSuccess((s) => ({ ...s, [id]: null }));
    try {
      const res = await api.post(`/users/${id}/reject_organizer/`);
      console.debug('Reject response', res);
      setActionSuccess((s) => ({ ...s, [id]: 'rejected' }));
      await fetchUsers();
    } catch (err) {
      console.error("Reject error:", err);
      const message = err.response?.data?.detail || err.response?.data || err.message || 'Reject failed';
      setActionError((s) => ({ ...s, [id]: String(message) }));
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
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

  // Ensure we always map over an array. Some API responses return an object
  // like { users: [...] } or { results: [...] } so normalize here.
  const usersArray = Array.isArray(users)
    ? users
    : users && typeof users === 'object'
    ? users.users ?? users.results ?? []
    : [];

  console.debug('[debug] OrganizerApproval users', usersArray);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", paddingBottom: "60px" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: 8 }}>
            <Link to="/admin" style={{ color: "#4f46e5", textDecoration: "none" }}>
              ← Back to Dashboard
            </Link>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px", color: "#111827" }}>
            Organizer Approval Panel
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            Approve or reject pending organizer account requests
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {error ? (
          <div style={{ textAlign: 'center', color: '#ef4444' }}>
            <p style={{ fontWeight: 600 }}>Error loading users</p>
            <p>{error}</p>
            <p style={{ color: '#6b7280' }}>Make sure you're signed in as an admin.</p>
          </div>
        ) : usersArray.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>No users found.</p>
        ) : (
          <div style={{ display: "grid", gap: "24px" }}>
            {usersArray.map((user) => (
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
                        cursor: actionLoading[user.id] ? 'wait' : 'pointer',
                        opacity: actionLoading[user.id] ? 0.7 : 1,
                      }}
                      disabled={!!actionLoading[user.id]}
                    >
                      {actionLoading[user.id] ? 'Working…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        cursor: actionLoading[user.id] ? 'wait' : 'pointer',
                        opacity: actionLoading[user.id] ? 0.7 : 1,
                      }}
                      disabled={!!actionLoading[user.id]}
                    >
                      {actionLoading[user.id] ? 'Working…' : 'Reject'}
                    </button>
                  </div>
                )}
                {actionError[user.id] && (
                  <div style={{ marginTop: 8, color: '#b91c1c', fontWeight: 600 }}>{actionError[user.id]}</div>
                )}
                {actionSuccess[user.id] && (
                  <div style={{ marginTop: 8, color: '#065f46', fontWeight: 600 }}>User {actionSuccess[user.id]}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

