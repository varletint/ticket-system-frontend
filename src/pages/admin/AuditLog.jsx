import { useState, useEffect } from 'react';
import { HiClock, HiExclamation, HiUser, HiDocumentText } from 'react-icons/hi';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: '', severity: '', entityType: '' });
    const [selectedLog, setSelectedLog] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });

    useEffect(() => {
        fetchData();
    }, [pagination.page]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 30 };
            if (filter.action) params.action = filter.action;
            if (filter.severity) params.severity = filter.severity;
            if (filter.entityType) params.entityType = filter.entityType;

            const [logsRes, statsRes] = await Promise.all([
                api.get('/audit', { params }),
                api.get('/audit/stats')
            ]);

            setLogs(logsRes.data.data);
            setPagination(logsRes.data.pagination);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityBadge = (severity) => {
        const styles = {
            info: 'bg-blue-100 text-blue-700',
            warning: 'bg-amber-100 text-amber-700',
            error: 'bg-red-100 text-red-700',
            critical: 'bg-purple-100 text-purple-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[severity] || 'bg-gray-100'}`}>
                {severity}
            </span>
        );
    };

    const formatAction = (action) => {
        return action?.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' → ');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <HiDocumentText className="text-2xl text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Total (24h)</p>
                            <p className="text-xl font-bold">{stats?.summary?.total || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <HiExclamation className="text-2xl text-red-500" />
                        <div>
                            <p className="text-xs text-gray-500">Errors</p>
                            <p className="text-xl font-bold text-red-600">{stats?.summary?.errors || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <HiExclamation className="text-2xl text-amber-500" />
                        <div>
                            <p className="text-xs text-gray-500">Warnings</p>
                            <p className="text-xl font-bold text-amber-600">{stats?.summary?.warnings || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <HiExclamation className="text-2xl text-purple-500" />
                        <div>
                            <p className="text-xs text-gray-500">Critical</p>
                            <p className="text-xl font-bold text-purple-600">{stats?.summary?.critical || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Actions */}
            {stats?.topActions?.length > 0 && (
                <div className="card p-4 mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Top Actions (24h)</h3>
                    <div className="flex flex-wrap gap-2">
                        {stats.topActions.map((a, i) => (
                            <button
                                key={i}
                                onClick={() => setFilter({ ...filter, action: a._id })}
                                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                            >
                                {formatAction(a._id)} <span className="text-gray-500">({a.count})</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        value={filter.action}
                        onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                        placeholder="Search action..."
                        className="input"
                    />
                    <select
                        value={filter.severity}
                        onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                        className="input w-36"
                    >
                        <option value="">All Severity</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="critical">Critical</option>
                    </select>
                    <select
                        value={filter.entityType}
                        onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
                        className="input w-36"
                    >
                        <option value="">All Entities</option>
                        <option value="User">User</option>
                        <option value="Event">Event</option>
                        <option value="Order">Order</option>
                        <option value="Ticket">Ticket</option>
                        <option value="Transaction">Transaction</option>
                        <option value="Dispute">Dispute</option>
                    </select>
                    <button onClick={fetchData} className="btn btn-primary">Search</button>
                    <button onClick={() => { setFilter({ action: '', severity: '', entityType: '' }); fetchData(); }} className="btn btn-secondary">Reset</button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Severity</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr
                                    key={log._id}
                                    onClick={() => setSelectedLog(log)}
                                    className="hover:bg-gray-50 cursor-pointer"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <HiClock className="text-gray-400" />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">{formatAction(log.action)}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-1">
                                            <HiUser className="text-gray-400" />
                                            {log.actor?.email || (log.actor?.isSystem ? 'System' : 'Unknown')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {log.entity?.type} {log.entity?.name && `(${log.entity.name})`}
                                    </td>
                                    <td className="px-4 py-3 text-center">{getSeverityBadge(log.severity)}</td>
                                    <td className="px-4 py-3 text-center">
                                        {log.result?.success ? (
                                            <span className="text-green-600">✓</span>
                                        ) : (
                                            <span className="text-red-600">✗</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t flex justify-center gap-2">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            className="btn btn-secondary"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2">Page {pagination.page} of {pagination.pages}</span>
                        <button
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            className="btn btn-secondary"
                        >
                            Next
                        </button>
                    </div>
                )}

                {logs.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No audit logs found</div>
                )}
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Audit Log Details</h2>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-500 text-sm">Action</p>
                                <p className="font-medium">{formatAction(selectedLog.action)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm">Severity</p>
                                    {getSeverityBadge(selectedLog.severity)}
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Status</p>
                                    <span className={selectedLog.result?.success ? 'text-green-600' : 'text-red-600'}>
                                        {selectedLog.result?.success ? 'Success' : 'Failed'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Actor</p>
                                <p>{selectedLog.actor?.email || (selectedLog.actor?.isSystem ? 'System' : 'Unknown')}</p>
                                <p className="text-xs text-gray-400">{selectedLog.actor?.role}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Entity</p>
                                <p>{selectedLog.entity?.type}: {selectedLog.entity?.name || selectedLog.entity?.id}</p>
                            </div>
                            {selectedLog.request && (
                                <div>
                                    <p className="text-gray-500 text-sm">Request</p>
                                    <p className="text-xs font-mono bg-gray-50 p-2 rounded">
                                        {selectedLog.request.method} {selectedLog.request.endpoint}
                                        <br />IP: {selectedLog.request.ipAddress}
                                    </p>
                                </div>
                            )}
                            {selectedLog.result?.errorMessage && (
                                <div>
                                    <p className="text-gray-500 text-sm">Error</p>
                                    <p className="text-red-600 bg-red-50 p-2 rounded text-sm">
                                        {selectedLog.result.errorMessage}
                                    </p>
                                </div>
                            )}
                            {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                                <div>
                                    <p className="text-gray-500 text-sm">Changes</p>
                                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                        {JSON.stringify(selectedLog.changes, null, 2)}
                                    </pre>
                                </div>
                            )}
                            <div>
                                <p className="text-gray-500 text-sm">Timestamp</p>
                                <p>{new Date(selectedLog.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLog;
