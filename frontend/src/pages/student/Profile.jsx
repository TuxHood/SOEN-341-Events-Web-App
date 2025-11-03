import { useEffect, useState } from "react";
import { TicketsAPI } from "../../api/api";

export default function Profile() {
  const [me, setMe] = useState({
    name: "Student",
    email: "student@example.com",
  }); // replace with your auth/me endpoint if available

  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const t = await TicketsAPI.mine();
        const arr = t.results || t || [];
        setTicketCount(arr.length || 0);
      } catch {
        /* ignore errors */
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await fetch(`/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <div className="max-w-lg bg-white border rounded-xl p-4">
      <div className="text-sm text-gray-500 mb-3">Basic Info</div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-gray-500">
          Name
          <div className="text-base text-gray-900 mt-1">{me.name}</div>
        </label>

        <label className="text-xs text-gray-500">
          Email
          <div className="text-base text-gray-900 mt-1">{me.email}</div>
        </label>

        <label className="text-xs text-gray-500">
          Tickets Claimed
          <div className="text-base text-gray-900 mt-1">{ticketCount}</div>
        </label>
      </div>

      <div className="mt-6">
        <button
          onClick={logout}
          className="px-3 py-2 text-sm border rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
