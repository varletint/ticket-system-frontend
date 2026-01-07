import { useState, useEffect } from 'react';
import { eventAPI } from '../../services/api';
import EventCard from '../../components/EventCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiSearch, HiFilter } from 'react-icons/hi';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        fetchEvents();
    }, [category]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (category) params.category = category;
            if (search) params.search = search;

            const response = await eventAPI.getAll(params);
            setEvents(response.data.events);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents();
    };

    const categories = [
        { value: '', label: 'All Events' },
        { value: 'concert', label: 'Concerts' },
        { value: 'festival', label: 'Festivals' },
        { value: 'theater', label: 'Theater' },
        { value: 'sports', label: 'Sports' },
        { value: 'conference', label: 'Conferences' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hero */}
            <div className="gradient-primary rounded-2xl p-8 md:p-12 text-white mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    Find Your Next Experience
                </h1>
                <p className="text-white/80 mb-6 max-w-xl">
                    Discover concerts, festivals, and events happening near you. Book tickets securely with our QR-based system.
                </p>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
                    <div className="flex-1 relative">
                        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search events or artists..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                    </div>
                    <button type="submit" className="btn bg-white text-primary-600 hover:bg-gray-100 px-6">
                        Search
                    </button>
                </form>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                <HiFilter className="text-gray-400" />
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${category === cat.value
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Events Grid */}
            {loading ? (
                <LoadingSpinner />
            ) : events.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎫</div>
                    <h3 className="text-xl font-semibold text-gray-900">No events found</h3>
                    <p className="text-gray-500 mt-2">Check back later for upcoming events</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {events.map(event => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Events;
