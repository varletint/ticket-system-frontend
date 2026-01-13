import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { validationAPI } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { HiQrcode, HiCalendar, HiLocationMarker } from "react-icons/hi";

const ValidatorDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await validationAPI.getMyEvents();
      setEvents(response.data.events);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-text'>Validator Dashboard</h1>
        <Link to='/validator/scan' className='btn flex items-center gap-2'>
          <HiQrcode /> scan
        </Link>
      </div>

      {events.length === 0 ? (
        <div className='card p-12 text-center'>
          <div className='text-6xl mb-4'>📋</div>
          <h3 className='text-xl font-semibold text-text'>
            No assigned events
          </h3>
          <p className='text-text mt-2'>
            You haven't been assigned to any events yet. Contact an admin to get
            assigned.
          </p>
        </div>
      ) : (
        <>
          <p className='text-text mb-6'>
            You are assigned to validate tickets for the following events:
          </p>

          <div className='grid gap-4'>
            {events.map((event) => (
              <div key={event._id} className='card p-2'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-semibold text-lg text-text'>
                      {event.title}
                    </h3>
                    <div className='mt flex flex-col text-sm text-text/80'>
                      <span className='flex items-center gap-1'>
                        <HiCalendar />
                        {new Date(event.eventDate).toLocaleDateString("en-NG", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className='flex items-center gap-1'>
                        <HiLocationMarker />
                        {event.venue?.city}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/validator/scan?event=${event._id}`}
                    className='btn flex items-center gap-2'>
                    <HiQrcode /> Scan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ValidatorDashboard;
