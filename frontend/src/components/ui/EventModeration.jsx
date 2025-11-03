import React, { useEffect, useState } from "react";
import api from "../api/axios";

const EventModeration = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // get all events with "Pending" status
  useEffect(() => {
    const fetchPendingEvents = async () => {
      try {
        const res = await api.get("/api/events/");
        const pending = res.data.filter(
          (event) => event.status === "Pending"
        );
        setPendingEvents(pending);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvents();
  }, []);

  // Approve event
  const handleApprove = async (id) => {
    try {
      const res = await api.post(`/api/events/${id}/approve/`);
      setMessage(res.data.message);
      setPendingEvents((prev) =>
        prev.filter((event) => event.id !== id)
      );
    } catch (err) {
      console.error("Error approving event:", err);
      setMessage("Failed to approve event.");
    }
  };

  // Reject event
  const handleReject = async (id) => {
    try {
      const res = await api.post(`/api/events/${id}/reject/`);
      setMessage(res.data.message);
      setPendingEvents((prev) =>
        prev.filter((event) => event.id !== id)
      );
    } catch (err) {
      console.error("Error rejecting event:", err);
      setMessage("Failed to reject event.");
    }
  };

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Event Moderation</h2>

      {message && (
        <div className="mb-4 text-sm text-green-700">{message}</div>
      )}

      {pendingEvents.length === 0 ? (
        <p>No pending events to review.</p>
      ) : (
        <div className="grid gap-4">
          {pendingEvents.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  {event.description}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(event.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(event.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventModeration;
