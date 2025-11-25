import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default function ResetPassword() {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (password !== password2) {
      setStatus("Passwords do not match.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/users/password-reset/${uidb64}/${token}/`,
        { password }
      );
      setStatus("Password reset successfully. You can now log in.");
    } catch (err) {
      console.error(err);
      setStatus("This reset link is invalid or has expired.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center">Set a new password</h1>

        <input
          type="password"
          required
          placeholder="New password"
          className="border rounded px-3 py-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          required
          placeholder="Confirm new password"
          className="border rounded px-3 py-2 w-full"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />

        <button
          type="submit"
          className="w-full px-4 py-2 rounded bg-black text-white"
        >
          Update password
        </button>

        {status && (
          <p className="text-sm text-center mt-2">
            {status}
          </p>
        )}

        <p className="text-xs text-center mt-4">
          <Link to="/">Back to home</Link>
        </p>
      </form>
    </div>
  );
}
