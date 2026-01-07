import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ticketAPI } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  HiTicket,
  HiDownload,
  HiCalendar,
  HiLocationMarker,
} from "react-icons/hi";

// ============ TanStack Query Implementation (Uncomment to use) ============
// import { useQuery } from '@tanstack/react-query';
//
// const MyTickets = () => {
//   const {
//     data: tickets = [],
//     isLoading: loading,
//     error,
//     refetch
//   } = useQuery({
//     queryKey: ['myTickets'],
//     queryFn: async () => {
//       const response = await ticketAPI.getMyTickets();
//       return response.data.tickets;
//     },
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     refetchOnWindowFocus: true,
//   });
//
//   const handleDownload = async (ticketId) => {
//     try {
//       const response = await ticketAPI.download(ticketId);
//       window.open(response.data.pdfUrl, '_blank');
//     } catch (error) {
//       console.error('Error downloading ticket:', error);
//     }
//   };
// ============ End TanStack Query Implementation ============

// ============ Current useEffect Implementation ============
const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.getMyTickets();
      setTickets(response.data.tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (ticketId) => {
    try {
      const response = await ticketAPI.download(ticketId);
      window.open(response.data.pdfUrl, "_blank");
    } catch (error) {
      console.error("Error downloading ticket:", error);
    }
  };
  // ============ End useEffect Implementation ============

  if (loading) return <LoadingSpinner />;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
        <HiTicket className='text-primary-600' />
        My Tickets
      </h1>

      {tickets.length === 0 ? (
        <div className='text-center py-16 card'>
          <div className='text-6xl mb-4'>🎫</div>
          <h3 className='text-xl font-semibold text-gray-900'>
            No tickets yet
          </h3>
          <p className='text-gray-500 mt-2 mb-6'>
            Your purchased tickets will appear here
          </p>
          <Link to='/events' className='btn-primary'>
            Browse Events
          </Link>
        </div>
      ) : (
        <div className='space-y-4'>
          {tickets.map((ticket) => {
            const eventDate = new Date(ticket.event.eventDate);
            const isPast = eventDate < new Date();

            return (
              <div
                key={ticket._id}
                className={`card p-6 ${isPast ? "opacity-60" : ""}`}>
                <div className='flex flex-col sm:flex-row gap-4'>
                  {/* Event Image */}
                  <div className='w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 flex-shrink-0'>
                    {ticket.event.bannerImage ? (
                      <img
                        src={ticket.event.bannerImage}
                        alt={ticket.event.title}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-white text-2xl font-bold opacity-50'>
                        {ticket.event.title?.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Ticket Info */}
                  <div className='flex-1'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='font-semibold text-gray-900'>
                          {ticket.event.title}
                        </h3>
                        {ticket.event.artist && (
                          <p className='text-primary-600 text-sm'>
                            {ticket.event.artist}
                          </p>
                        )}
                      </div>
                      <span
                        className={`badge ${
                          ticket.status === "valid"
                            ? "badge-success"
                            : ticket.status === "used"
                            ? "badge-info"
                            : "badge-error"
                        }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className='mt-3 flex flex-wrap gap-4 text-sm text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <HiCalendar />
                        {eventDate.toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className='flex items-center gap-1'>
                        <HiLocationMarker />
                        {ticket.event.venue?.city}
                      </div>
                      <div className='flex items-center gap-1'>
                        <HiTicket />
                        {ticket.tierName}
                      </div>
                    </div>

                    <div className='mt-4 flex items-center justify-between'>
                      <span className='font-semibold text-gray-900'>
                        ₦{ticket.price?.toLocaleString()}
                      </span>

                      {ticket.status === "valid" && (
                        <button
                          onClick={() => handleDownload(ticket._id)}
                          className='btn-primary text-sm flex items-center gap-2'>
                          <HiDownload />
                          Download PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
