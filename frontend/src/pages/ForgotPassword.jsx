import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      await axios.post(`${API_BASE}/api/users/password-reset/`, { email });
      setStatus("If that email exists, we sent a reset link.");
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center">Forgot password?</h1>
        <p className="text-sm text-center">
          Enter your email address and we&apos;ll send you a password reset link.
        </p>

        <input
          type="email"
          required
          placeholder="you@example.com"
          className="border rounded px-3 py-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full px-4 py-2 rounded bg-black text-white"
        >
          Send reset link
        </button>

        {status && (
          <p className="text-sm text-center mt-2">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
