import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { HiUsers, HiCalendar, HiCurrencyDollar, HiClock } from "react-icons/hi";

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
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-text mb-6'>Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <div className='card p-2'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-text/50 '>
              <HiUsers className='text-2xl text-text' />
            </div>
            <div>
              <p className='text-sm text-text'>Total Users</p>
              <p className='text-2xl font-bold text-text'>
                {stats?.users?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='card p-2'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-green-50 '>
              <HiCalendar className='text-2xl text-green-600' />
            </div>
            <div>
              <p className='text-sm text-text'>Total Events</p>
              <p className='text-2xl font-bold text-text'>
                {stats?.events?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='card p-2'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-text/40 '>
              <HiCurrencyDollar className='text-2xl text-text' />
            </div>
            <div>
              <p className='text-sm text-text'>Total Revenue</p>
              <p className='text-2xl font-bold text-text'>
                ₦{(stats?.orders?.revenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className='card p-2'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-amber-50 '>
              <HiClock className='text-2xl text-amber-600' />
            </div>
            <div>
              <p className='text-sm text-text'>Pending Approvals</p>
              <p className='text-2xl font-bold text-text'>
                {stats?.pendingApprovals?.organizers || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className='grid md:grid-cols-3 gap-4 mb-8'>
        <Link
          to='/admin/users'
          className='card p-2 hover:shadow-md transition-shadow'>
          <h3 className='font-semibold text-text'>Manage Users</h3>
          <p className='text-text/70 text-sm '>
            View and manage all platform users
          </p>
        </Link>
        <Link
          to='/admin/organizers'
          className='card p-2 hover:shadow-md transition-shadow'>
          <h3 className='font-semibold text-text flex items-center gap-2'>
            Pending Organizers
            {stats?.pendingApprovals?.organizers > 0 && (
              <span className='badge bg-amber-100 text-amber-800'>
                {stats?.pendingApprovals?.organizers}
              </span>
            )}
          </h3>
          <p className='text-text/70 text-sm '>
            Review and approve organizer accounts
          </p>
        </Link>
        <Link
          to='/events'
          className='card p-2 hover:shadow-md transition-shadow'>
          <h3 className='font-semibold text-text'>View Events</h3>
          <p className='text-text/70 text-sm '>Browse all platform events</p>
        </Link>
      </div>

      {/* New Admin Features */}
      <div className='grid md:grid-cols-4 gap-4 mb-8'>
        <Link
          to='/admin/transactions'
          className=' p-2 hover:shadow-md transition-shadow bg-text/30 from-blue-50 to-white'>
          <h3 className='font-semibold text-text'>💳 Transaction Monitor</h3>
          <p className='text-text/70 text-sm '>
            Track payments, retry failures, process refunds
          </p>
        </Link>
        <Link
          to='/admin/disputes'
          className='p-2 hover:shadow-md transition-shadow bg-text/30 from-red-50 to-white'>
          <h3 className='font-semibold text-text'>⚠️ Dispute Management</h3>
          <p className='text-text/70 text-sm '>
            Handle refund requests and payment issues
          </p>
        </Link>
        <Link
          to='/admin/reconciliation'
          className='p-2 hover:shadow-md transition-shadow bg-text/30 from-green-50 to-white'>
          <h3 className='font-semibold text-text'>🔄 Reconciliation</h3>
          <p className='text-text/70 text-sm '>
            Ensure data consistency and fix mismatches
          </p>
        </Link>
        <Link
          to='/admin/audit'
          className='p-2 hover:shadow-md transition-shadow bg-text/30 from-purple-50 to-white'>
          <h3 className='font-semibold text-text'>📋 Audit Log</h3>
          <p className='text-text/70 text-sm '>
            View system activity and action history
          </p>
        </Link>
      </div>

      {/* User Breakdown */}
      <div className='card p-2'>
        <h2 className='font-semibold text-text mb-4'>Users by Role</h2>
        <div className='grid md:grid-cols-4 gap-4'>
          {["buyer", "organizer", "validator", "admin"].map((role) => (
            <div key={role} className='text-center p-4 bg-text/40 '>
              <p className='text-2xl font-bold text-text'>
                {stats?.users?.byRole?.[role] || 0}
              </p>
              <p className='text-sm text-text capitalize'>{role}s</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
