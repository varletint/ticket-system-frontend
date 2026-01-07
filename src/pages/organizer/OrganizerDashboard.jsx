import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventAPI } from '../../services/api';
import { HiPlus, HiCalendar, HiCurrencyDollar, HiTicket, HiExclamation } from 'react-icons/hi';

const OrganizerDashboard = () => {
    const { user, isApprovedOrganizer, hasPaystack } = useAuth();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ total: 0, published: 0, revenue: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await eventAPI.getMyEvents();
            const myEvents = response.data.events;
            setEvents(myEvents);

            setStats({
                total: myEvents.length,
                published: myEvents.filter(e => e.status === 'published').length,
                revenue: myEvents.reduce((sum, e) => sum + (e.totalRevenue || 0), 0)
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const renderApprovalStatus = () => {
        const status = user?.organizerProfile?.platformStatus;

        if (status === 'approved' && hasPaystack) return null;

        return (
            <div className="card p-6 mb-6 border-l-4 border-amber-500 bg-amber-50">
                <div className="flex items-start gap-3">
                    <HiExclamation className="text-2xl text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-gray-900">Account Setup Required</h3>
                        {status !== 'approved' ? (
                            <p className="text-gray-600 text-sm mt-1">
                                Your organizer account is <span className="font-medium">{status}</span>.
                                {status === 'pending' && ' Please wait for admin approval to publish events. to speed up the process, please complete your profile.'}
                                {status === 'rejected' && ` Reason: ${user?.organizerProfile?.platformRejectionReason || 'Not specified'}`}
                            </p>
                        ) : !hasPaystack ? (
                            <div>
                                <p className="text-gray-600 text-sm mt-1">
                                    Your account is approved! Set up your payout account to start receiving payments.
                                </p>
                                <Link to="/organizer/setup-payout" className="btn-primary mt-3 inline-block">
                                    Setup Payout Account
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
                <Link to="/organizer/create" className="btn-primary flex items-center gap-2">
                    <HiPlus /> Create Event
                </Link>
            </div>

            {renderApprovalStatus()}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <HiCalendar className="text-2xl text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Events</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <HiTicket className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Published</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent-50 rounded-lg">
                            <HiCurrencyDollar className="text-2xl text-accent-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₦{stats.revenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <Link to="/organizer/events" className="card p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900">Manage Events</h3>
                    <p className="text-gray-500 text-sm mt-1">View, edit, and publish your events</p>
                </Link>
                <Link to="/organizer/create" className="card p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900">Create New Event</h3>
                    <p className="text-gray-500 text-sm mt-1">Set up a new concert or event</p>
                </Link>
            </div>

            {/* Recent Events */}
            <div className="card">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Recent Events</h2>
                </div>
                {events.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No events yet. Create your first event!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {events.slice(0, 5).map(event => (
                            <div key={event._id} className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(event.eventDate).toLocaleDateString('en-NG', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <span className={`badge ${event.status === 'published' ? 'badge-success' :
                                        event.status === 'draft' ? 'badge-warning' :
                                            'badge-error'
                                    }`}>
                                    {event.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizerDashboard;
