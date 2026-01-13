import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventAPI, ticketAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  HiCalendar,
  HiLocationMarker,
  HiClock,
  HiTicket,
  HiMinus,
  HiPlus,
} from "react-icons/hi";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getOne(id);
      setEvent(response.data.event);
      if (response.data.event.ticketTiers?.length > 0) {
        setSelectedTier(response.data.event.ticketTiers[0]);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedTier) {
      setError("Please select a ticket type");
      return;
    }

    setPurchasing(true);
    setError("");

    try {
      const response = await ticketAPI.purchase({
        eventId: event._id,
        tierId: selectedTier._id,
        quantity,
      });

      // Redirect to payment
      window.location.href = response.data.paymentUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Purchase failed");
      setPurchasing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return <div className='text-center py-16'>Event not found</div>;

  const eventDate = new Date(event.eventDate);

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      {/* Banner */}
      <div className='relative h-64 md:h-96 overflow-hidden mb-8 border border-text'>
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full gradient-primary flex items-center justify-center'>
            <span className='text-text text-8xl font-bold opacity-70'>
              {event.title.charAt(0)}
            </span>
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-secondary-surface to-transparent' />
        <div className='absolute bottom-6 left-6 text-text'>
          <span className='badge p-0.5 px-2 bg-text/20 backdrop-blur-sm text-text mb-2 capitalize'>
            {event.category}
          </span>
          <h1 className='text-3xl md:text-4xl font-bold capitalize'>
            {event.title}
          </h1>
          {event.artist && (
            <p className='text-xl opacity-90 mt capitalize'>{event.artist}</p>
          )}
        </div>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        {/* Event Info */}
        <div className='md:col-span-2 space-y-6'>
          {/* Date & Location */}
          <div className='card p-2'>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='flex items-start gap-3'>
                <div className='p-3 bg-text/40'>
                  <HiCalendar className='text-xl text-primary-600' />
                </div>
                <div>
                  <p className='font-semibold text-text'>
                    {eventDate.toLocaleDateString("en-NG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className='text-text/60 flex items-center gap-1'>
                    <HiClock />
                    {eventDate.toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='p-3 bg-text/40'>
                  <HiLocationMarker className='text-xl text-text' />
                </div>
                <div>
                  <p className='font-semibold text-text'>{event.venue.name}</p>
                  <p className='text-text/60'>
                    {event.venue.address && `${event.venue.address}, `}
                    {event.venue.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className='card p-2'>
            <h2 className='text-lg font-semibold text-text'>
              About This Event
            </h2>
            <p className='text-text/70 whitespace-pre-line'>
              {event.description}
            </p>
          </div>
        </div>

        {/* Ticket Selection */}
        <div className='space-y-4'>
          <div className='card px-2 py-4 sticky top-24'>
            <h2 className='text-lg font-semibold text-text mb-4 flex items-center gap-2'>
              <HiTicket className='text-primary-600' />
              Select Tickets
            </h2>

            {/* Ticket Tiers */}
            <div className='space-y-3 mb-6'>
              {event.ticketTiers?.map((tier) => {
                const available = tier.quantity - tier.soldCount;
                const isSelected = selectedTier?._id === tier._id;

                return (
                  <button
                    key={tier._id}
                    onClick={() => setSelectedTier(tier)}
                    disabled={available === 0}
                    className={`w-full p-2 text-left transition-all
                      ${
                        isSelected
                          ? "bg-text/10"
                          : "border-text hover:border-text/90"
                      }
                      ${available === 0 ? "opacity-50 cursor-not-allowed" : ""}
                    `}>
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='font-semibold text-text'>{tier.name}</p>
                        {tier.description && (
                          <p className='text-sm text-text mt-1'>
                            {tier.description}
                          </p>
                        )}
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-text'>
                          ₦{tier.price.toLocaleString()}
                        </p>
                        <p
                          className={`text-xs ${
                            available < 10 ? "text-red-500" : "text-text/90"
                          }`}>
                          {available === 0 ? "Sold Out" : `${available} left`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quantity */}
            {selectedTier && (
              <div className='mb-6'>
                <label className='block text-sm font-medium text-text mb-2'>
                  Quantity
                </label>
                <div className='flex items-center gap-4'>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className='p-2 text-text border border-text hover:bg-surface/50'>
                    <HiMinus />
                  </button>
                  <span className='text-xl text-text/90 font-semibold w-8 text-center'>
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(selectedTier.maxPerUser || 4, quantity + 1)
                      )
                    }
                    className='p-2 text-text border border-text hover:bg-surface/50'>
                    <HiPlus />
                  </button>
                </div>
                <p className='text-xs text-text/90 mt-2'>
                  Max {selectedTier.maxPerUser || 4} per person
                </p>
              </div>
            )}

            {/* Total */}
            {selectedTier && (
              <div className='border-t border-text/90 pt-4 mb-4'>
                <div className='flex justify-between text-lg'>
                  <span className='text-text/90'>Total</span>
                  <span className='font-bold text-text'>
                    ₦{(selectedTier.price * quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={purchasing || !selectedTier}
              className='w-full btn py-3 disabled:opacity-50'>
              {purchasing ? "Processing..." : user ? "Buy Now" : "Login to Buy"}
            </button>

            <p className='text-xs text-text/80 text-center mt-4'>
              Secure payment powered by Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
