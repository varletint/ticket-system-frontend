import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiUsers, HiCalendar, HiCurrencyDollar, HiClock } from 'react-icons/hi';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <HiUsers className="text-2xl text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <HiCalendar className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Events</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.events?.total || 0}</p>
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
                            <p className="text-2xl font-bold text-gray-900">₦{(stats?.orders?.revenue || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <HiClock className="text-2xl text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Approvals</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals?.organizers || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Link to="/admin/users" className="card p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900">Manage Users</h3>
                    <p className="text-gray-500 text-sm mt-1">View and manage all platform users</p>
                </Link>
                <Link to="/admin/organizers" className="card p-6 hover:shadow-md transition-shadow border-2 border-amber-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        Pending Organizers
                        {stats?.pendingApprovals?.organizers > 0 && (
                            <span className="badge bg-amber-100 text-amber-800">
                                {stats?.pendingApprovals?.organizers}
                            </span>
                        )}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Review and approve organizer accounts</p>
                </Link>
                <Link to="/events" className="card p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900">View Events</h3>
                    <p className="text-gray-500 text-sm mt-1">Browse all platform events</p>
                </Link>
            </div>

            {/* New Admin Features */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Link to="/admin/transactions" className="card p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white">
                    <h3 className="font-semibold text-gray-900">💳 Transaction Monitor</h3>
                    <p className="text-gray-500 text-sm mt-1">Track payments, retry failures, process refunds</p>
                </Link>
                <Link to="/admin/disputes" className="card p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-white">
                    <h3 className="font-semibold text-gray-900">⚠️ Dispute Management</h3>
                    <p className="text-gray-500 text-sm mt-1">Handle refund requests and payment issues</p>
                </Link>
                <Link to="/admin/reconciliation" className="card p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-white">
                    <h3 className="font-semibold text-gray-900">🔄 Reconciliation</h3>
                    <p className="text-gray-500 text-sm mt-1">Ensure data consistency and fix mismatches</p>
                </Link>
                <Link to="/admin/audit" className="card p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-white">
                    <h3 className="font-semibold text-gray-900">📋 Audit Log</h3>
                    <p className="text-gray-500 text-sm mt-1">View system activity and action history</p>
                </Link>
            </div>

            {/* User Breakdown */}
            <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Users by Role</h2>
                <div className="grid grid-cols-4 gap-4">
                    {['buyer', 'organizer', 'validator', 'admin'].map(role => (
                        <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{stats?.users?.byRole?.[role] || 0}</p>
                            <p className="text-sm text-gray-500 capitalize">{role}s</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
