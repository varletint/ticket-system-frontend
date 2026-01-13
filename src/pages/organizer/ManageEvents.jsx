import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  HiPlus,
  HiPencil,
  HiEye,
  HiUpload,
  HiBan,
  HiUserGroup,
} from "react-icons/hi";

const ManageEvents = () => {
  const { isApprovedOrganizer, hasPaystack } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getMyEvents();
      setEvents(response.data.events);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (eventId) => {
    if (!confirm("Publish this event? It will be visible to all users."))
      return;

    try {
      await eventAPI.publish(eventId);
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to publish");
    }
  };

  const handleCancel = async (eventId) => {
    if (!confirm("Cancel this event? This action cannot be undone.")) return;

    try {
      await eventAPI.cancel(eventId);
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-text'>Manage Events</h1>
        <Link to='/organizer/create' className='btn flex items-center gap-2'>
          <HiPlus />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className='card text-center'>
          <div className='text-6xl mb-4'>📅</div>
          <h3 className='text-xl font-semibold text-text'>No events yet</h3>
          <p className='text-text/60 mt-2 mb-6'>
            Create your first event to get started
          </p>
          <Link
            to='/organizer/create'
            className='btn inline-flex items-center gap-2'>
            <HiPlus /> Create Event
          </Link>
        </div>
      ) : (
        <div className='card overflow-x-scroll'>
          <table className='w-full'>
            <thead className='bg-text/10'>
              <tr>
                <th className='px-4 py-3 text-left text-sm font-medium text-text/90'>
                  Event
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-text/90'>
                  Date
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-text/90'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-text/90'>
                  Sold
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-text/90'>
                  Revenue
                </th>
                <th className='px-4 py-3 text-right text-sm font-medium text-text/90'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-text/10'>
              {events.map((event) => (
                <tr key={event._id} className='even:bg-text/5 hover:bg-text/20'>
                  <td className='px-2 py-2'>
                    <div>
                      <p className='font-medium text-text text-nowrap'>
                        {event.title}
                      </p>
                      {event.artist && (
                        <p className='text-sm text-text/60'>{event.artist}</p>
                      )}
                    </div>
                  </td>
                  <td className='px-4 py-4 text-sm text-text/80 text-nowrap'>
                    {new Date(event.eventDate).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className='px-4 py-4'>
                    <span
                      className={`badge text-text/80 ${
                        event.status === "published"
                          ? "badge-success"
                          : event.status === "draft"
                          ? "badge-warning"
                          : event.status === "cancelled"
                          ? "badge-error"
                          : "badge-info"
                      }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className='px-4 py-4 text-sm text-text'>
                    {event.totalTicketsSold || 0}
                  </td>
                  <td className='px-4 py-4 text-sm font-medium text-text'>
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    }).format(event.totalRevenue || 0)}
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center justify-end gap-2'>
                      <Link
                        to={`/events/${event._id}`}
                        className='p-2 text-text/60 hover:text-primary-600'
                        title='View'>
                        <HiEye />
                      </Link>
                      <Link
                        to={`/organizer/events/${event._id}/validators`}
                        className='p-2 text-text/60 hover:text-primary-600'
                        title='Manage Validators'>
                        <HiUserGroup />
                      </Link>
                      {!["completed", "cancelled"].includes(event.status) && (
                        <Link
                          to={`/organizer/edit/${event._id}`}
                          className='p-2 text-text/60 hover:text-primary-600'
                          title='Edit'>
                          <HiPencil />
                        </Link>
                      )}
                      {event.status === "draft" && (
                        <button
                          onClick={() => handlePublish(event._id)}
                          disabled={!isApprovedOrganizer || !hasPaystack}
                          className='p-2 text-green-500 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                          title={
                            !isApprovedOrganizer
                              ? "Awaiting approval"
                              : !hasPaystack
                              ? "Setup paystack first"
                              : "Publish"
                          }>
                          <HiUpload />
                        </button>
                      )}
                      {event.status === "published" && (
                        <button
                          onClick={() => handleCancel(event._id)}
                          className='p-2 text-red-500 hover:text-red-700'
                          title='Cancel'>
                          <HiBan />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
