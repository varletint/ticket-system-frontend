import { Link } from "react-router-dom";
import { HiCalendar, HiLocationMarker } from "react-icons/hi";

const EventCard = ({ event }) => {
  const eventDate = new Date(event.eventDate);
  const dateStr = eventDate.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
  const timeStr = eventDate.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get lowest price
  const lowestPrice =
    event.ticketTiers?.reduce(
      (min, tier) => (tier.price < min ? tier.price : min),
      Infinity
    ) || 0;

  return (
    <Link to={`/events/${event._id}`} className='card group'>
      {/* Image */}
      <div className='relative h-48 bg-gradient-to-br from-secondary-surface to-text/30 overflow-hidden'>
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <span className='text-text text-6xl font-bold opacity-30'>
              {event.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Date badge */}
        <div className='absolute top-3 left-3 bg-secondary px-3 py-1 shadow-lg'>
          <div className='text-center'>
            <div className='text-xs text-text uppercase'>
              {eventDate.toLocaleDateString("en-NG", { month: "short" })}
            </div>
            <div className='text-lg font-bold text-text'>
              {eventDate.getDate()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='px-4 py-2'>
        <h3 className='font-semibold text-lg text-text line-clamp-1 group-hover:text-text transition-colors'>
          {event.title}
        </h3>

        {event.artist && (
          <p className='text-text font-medium text-sm'>{event.artist}</p>
        )}

        <div className='mt-3 flex flex-col gap-1 text-sm text-text/50'>
          <div className='flex items-center gap-2'>
            <HiCalendar className='flex-shrink-0' />
            <span>
              {dateStr} at {timeStr}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <HiLocationMarker className='flex-shrink-0' />
            <span className='line-clamp-1'>
              {event.venue?.name}, {event.venue?.city}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className='mt-4 flex items-center justify-between'>
          <div>
            <span className='text-xs text-gray-500'>From</span>
            <span className='ml-1 text-lg font-bold text-text'>
              ₦{lowestPrice.toLocaleString()}
            </span>
          </div>
          <span className='text-text font-medium text-sm group-hover:underline'>
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
