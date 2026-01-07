import { useState, useEffect } from 'react';
import { HiExclamationCircle, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DisputeManagement = () => {
    const [disputes, setDisputes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: 'open' });
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [resolution, setResolution] = useState({ type: 'full_refund', refundAmount: 0, notes: '' });

    useEffect(() => {
        fetchData();
    }, [filter.status]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter.status) params.status = filter.status;

            const [disputeRes, statsRes] = await Promise.all([
                api.get('/disputes', { params }),
                api.get('/disputes/stats')
            ]);

            setDisputes(disputeRes.data.data);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error fetching disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            setProcessing(true);
            await api.put(`/disputes/${id}`, { status });
            fetchData();
            if (selectedDispute?._id === id) {
                setSelectedDispute({ ...selectedDispute, status });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update dispute');
        } finally {
            setProcessing(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            setProcessing(true);
            await api.post(`/disputes/${id}/resolve`, {
                resolutionType: resolution.type,
                refundAmount: resolution.refundAmount,
                notes: resolution.notes
            });
            fetchData();
            setSelectedDispute(null);
            setResolution({ type: 'full_refund', refundAmount: 0, notes: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to resolve dispute');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            setProcessing(true);
            await api.post(`/disputes/${id}/reject`, { reason });
            fetchData();
            setSelectedDispute(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject dispute');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            open: 'bg-red-100 text-red-700',
            investigating: 'bg-blue-100 text-blue-700',
            pending_user: 'bg-amber-100 text-amber-700',
            resolved: 'bg-green-100 text-green-700',
            rejected: 'bg-gray-100 text-gray-700',
            escalated: 'bg-purple-100 text-purple-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {status?.replace('_', ' ')}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            low: 'bg-gray-100 text-gray-600',
            medium: 'bg-blue-100 text-blue-600',
            high: 'bg-orange-100 text-orange-600',
            urgent: 'bg-red-100 text-red-600'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority] || 'bg-gray-100'}`}>
                {priority}
            </span>
        );
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dispute Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4 border-l-4 border-red-500">
                    <div className="flex items-center gap-3">
                        <HiExclamationCircle className="text-2xl text-red-500" />
                        <div>
                            <p className="text-xs text-gray-500">Open</p>
                            <p className="text-2xl font-bold">{stats?.summary?.openCount || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-3">
                        <HiClock className="text-2xl text-blue-500" />
                        <div>
                            <p className="text-xs text-gray-500">Investigating</p>
                            <p className="text-2xl font-bold">{stats?.summary?.investigatingCount || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-green-500">
                    <div className="flex items-center gap-3">
                        <HiCheckCircle className="text-2xl text-green-500" />
                        <div>
                            <p className="text-xs text-gray-500">Resolved</p>
                            <p className="text-2xl font-bold">{stats?.summary?.resolvedCount || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-gray-500">
                    <div className="flex items-center gap-3">
                        <HiXCircle className="text-2xl text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Rejected</p>
                            <p className="text-2xl font-bold">{stats?.summary?.rejectedCount || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Urgent Alert */}
            {stats?.urgentDisputes > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <HiExclamationCircle className="text-xl" />
                    <span className="font-medium">{stats.urgentDisputes} urgent dispute(s) require immediate attention!</span>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['open', 'investigating', 'pending_user', 'resolved', 'rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter({ status })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter.status === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Disputes Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispute #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {disputes.map((dispute) => (
                                <tr key={dispute._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-mono">{dispute.disputeNumber}</td>
                                    <td className="px-4 py-3 text-sm capitalize">{dispute.type?.replace('_', ' ')}</td>
                                    <td className="px-4 py-3 text-sm">{dispute.user?.email || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm">{dispute.event?.title || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-right font-medium">₦{dispute.amount?.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center">{getPriorityBadge(dispute.priority)}</td>
                                    <td className="px-4 py-3 text-center">{getStatusBadge(dispute.status)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedDispute(dispute);
                                                setResolution({ ...resolution, refundAmount: dispute.amount });
                                            }}
                                            className="text-primary-600 hover:text-primary-800 text-sm"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {disputes.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No disputes found</div>
                )}
            </div>

            {/* Dispute Detail Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold">{selectedDispute.disputeNumber}</h2>
                                <p className="text-gray-500 text-sm">{selectedDispute.subject}</p>
                            </div>
                            <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-gray-500 text-sm">Status</p>
                                {getStatusBadge(selectedDispute.status)}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Priority</p>
                                {getPriorityBadge(selectedDispute.priority)}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Type</p>
                                <p className="capitalize">{selectedDispute.type?.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Amount</p>
                                <p className="font-bold">₦{selectedDispute.amount?.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-500 text-sm mb-1">Description</p>
                            <p className="bg-gray-50 p-3 rounded-lg">{selectedDispute.description}</p>
                        </div>

                        {/* Status Update Buttons */}
                        {!['resolved', 'rejected'].includes(selectedDispute.status) && (
                            <div className="mb-4">
                                <p className="text-gray-500 text-sm mb-2">Update Status</p>
                                <div className="flex gap-2">
                                    {selectedDispute.status === 'open' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedDispute._id, 'investigating')}
                                            disabled={processing}
                                            className="btn btn-secondary text-sm"
                                        >
                                            Start Investigation
                                        </button>
                                    )}
                                    {selectedDispute.status === 'investigating' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedDispute._id, 'pending_user')}
                                            disabled={processing}
                                            className="btn btn-secondary text-sm"
                                        >
                                            Request User Info
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Resolution Form */}
                        {!['resolved', 'rejected'].includes(selectedDispute.status) && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Resolve Dispute</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Resolution Type</label>
                                        <select
                                            value={resolution.type}
                                            onChange={(e) => setResolution({ ...resolution, type: e.target.value })}
                                            className="input w-full"
                                        >
                                            <option value="full_refund">Full Refund</option>
                                            <option value="partial_refund">Partial Refund</option>
                                            <option value="no_refund">No Refund</option>
                                            <option value="replacement">Replacement</option>
                                            <option value="credit">Store Credit</option>
                                        </select>
                                    </div>
                                    {resolution.type.includes('refund') && (
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Refund Amount</label>
                                            <input
                                                type="number"
                                                value={resolution.refundAmount}
                                                onChange={(e) => setResolution({ ...resolution, refundAmount: Number(e.target.value) })}
                                                max={selectedDispute.amount}
                                                className="input w-full"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Notes</label>
                                        <textarea
                                            value={resolution.notes}
                                            onChange={(e) => setResolution({ ...resolution, notes: e.target.value })}
                                            className="input w-full"
                                            rows={3}
                                            placeholder="Resolution notes..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleResolve(selectedDispute._id)}
                                            disabled={processing}
                                            className="btn btn-primary flex-1"
                                        >
                                            {processing ? 'Processing...' : 'Resolve'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedDispute._id)}
                                            disabled={processing}
                                            className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resolution Info */}
                        {selectedDispute.status === 'resolved' && selectedDispute.resolution && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2 text-green-600">Resolved</h3>
                                <p><strong>Type:</strong> {selectedDispute.resolution.type?.replace('_', ' ')}</p>
                                <p><strong>Refund:</strong> ₦{selectedDispute.resolution.refundAmount?.toLocaleString()}</p>
                                <p><strong>Notes:</strong> {selectedDispute.resolution.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisputeManagement;
