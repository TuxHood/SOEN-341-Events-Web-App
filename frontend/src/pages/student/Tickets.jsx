import { useEffect, useState } from "react";
import { TicketsAPI } from "../../api/api";
import Spinner from "../../components/Spinner";
import TicketCard from "../../components/TicketCard";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const t = await TicketsAPI.mine();
        setTickets(t.results || t || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-gray-500">No tickets yet.</div>
      ) : (
        tickets.map((t) => <TicketCard key={t.id || t.code} t={t} />)
      )}
    </div>
  );
}
