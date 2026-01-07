import { useState, useEffect } from 'react';
import { HiCheckCircle, HiExclamation, HiRefresh, HiDatabase } from 'react-icons/hi';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const Reconciliation = () => {
    const [summary, setSummary] = useState(null);
    const [mismatches, setMismatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [fixing, setFixing] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, mismatchRes] = await Promise.all([
                api.get('/reconciliation/summary'),
                api.get('/reconciliation/mismatches')
            ]);
            setSummary(summaryRes.data.data);
            setMismatches(mismatchRes.data.data.mismatches);
        } catch (error) {
            console.error('Error fetching reconciliation data:', error);
        } finally {
            setLoading(false);
        }
    };

    const runReconciliation = async () => {
        if (!confirm('Run full reconciliation? This will fix event ticket counts and revenue totals.')) return;
        try {
            setRunning(true);
            const res = await api.post('/reconciliation/run');
            alert(`Reconciliation complete: ${res.data.data.eventsFixed} events fixed in ${res.data.data.duration}`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to run reconciliation');
        } finally {
            setRunning(false);
        }
    };

    const fixMismatch = async (mismatch) => {
        try {
            setFixing(mismatch.entityId);
            const res = await api.post('/reconciliation/fix', {
                type: mismatch.type,
                entityId: mismatch.entityId,
                action: 'auto'
            });
            if (res.data.data.fixed) {
                alert(res.data.data.message);
                fetchData();
            } else {
                alert(res.data.data.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to fix mismatch');
        } finally {
            setFixing(null);
        }
    };

    const getSeverityBadge = (severity) => {
        const styles = {
            high: 'bg-red-100 text-red-700',
            medium: 'bg-amber-100 text-amber-700',
            low: 'bg-blue-100 text-blue-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[severity]}`}>
                {severity}
            </span>
        );
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Data Reconciliation</h1>
                <button
                    onClick={runReconciliation}
                    disabled={running}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {running ? (
                        <>Running...</>
                    ) : (
                        <><HiRefresh /> Run Full Reconciliation</>
                    )}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Orders Summary */}
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Orders</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Orders</span>
                            <span className="font-bold">{summary?.orders?.total || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Revenue</span>
                            <span className="font-bold">₦{(summary?.orders?.revenue || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Expected Tickets</span>
                            <span className="font-bold">{summary?.orders?.ticketsExpected || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Tickets Summary */}
                <div className={`card p-6 ${summary?.tickets?.isHealthy ? 'border-green-200' : 'border-red-200 border-2'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Tickets</h3>
                        {summary?.tickets?.isHealthy ? (
                            <HiCheckCircle className="text-green-500 text-xl" />
                        ) : (
                            <HiExclamation className="text-red-500 text-xl" />
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Actual Count</span>
                            <span className="font-bold">{summary?.tickets?.actual || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Discrepancy</span>
                            <span className={`font-bold ${summary?.tickets?.discrepancy !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {summary?.tickets?.discrepancy || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Transactions Summary */}
                <div className={`card p-6 ${summary?.transactions?.isHealthy ? 'border-green-200' : 'border-red-200 border-2'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Transactions</h3>
                        {summary?.transactions?.isHealthy ? (
                            <HiCheckCircle className="text-green-500 text-xl" />
                        ) : (
                            <HiExclamation className="text-red-500 text-xl" />
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total</span>
                            <span className="font-bold">{summary?.transactions?.total || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Net Amount</span>
                            <span className="font-bold">₦{(summary?.transactions?.net || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Discrepancy</span>
                            <span className={`font-bold ${summary?.transactions?.discrepancy !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {summary?.transactions?.discrepancy || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Status */}
            <div className="card p-6 mb-8">
                <h3 className="font-semibold text-gray-700 mb-4">System Health</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg text-center ${summary?.health?.ticketsHealthy ? 'bg-green-50' : 'bg-red-50'}`}>
                        {summary?.health?.ticketsHealthy ? (
                            <HiCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
                        ) : (
                            <HiExclamation className="text-3xl text-red-500 mx-auto mb-2" />
                        )}
                        <p className="font-medium">Tickets</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${summary?.health?.revenueHealthy ? 'bg-green-50' : 'bg-red-50'}`}>
                        {summary?.health?.revenueHealthy ? (
                            <HiCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
                        ) : (
                            <HiExclamation className="text-3xl text-red-500 mx-auto mb-2" />
                        )}
                        <p className="font-medium">Revenue</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${summary?.health?.transactionsHealthy ? 'bg-green-50' : 'bg-red-50'}`}>
                        {summary?.health?.transactionsHealthy ? (
                            <HiCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
                        ) : (
                            <HiExclamation className="text-3xl text-red-500 mx-auto mb-2" />
                        )}
                        <p className="font-medium">Transactions</p>
                    </div>
                </div>
            </div>

            {/* Mismatches */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <HiDatabase className="text-gray-500" />
                        Data Mismatches ({mismatches.length})
                    </h3>
                </div>

                {mismatches.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Severity</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {mismatches.map((m, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-mono">{m.type}</td>
                                        <td className="px-4 py-3 text-sm">{m.entity}</td>
                                        <td className="px-4 py-3 text-sm">{m.description}</td>
                                        <td className="px-4 py-3 text-center">{getSeverityBadge(m.severity)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => fixMismatch(m)}
                                                disabled={fixing === m.entityId}
                                                className="text-primary-600 hover:text-primary-800 text-sm"
                                            >
                                                {fixing === m.entityId ? 'Fixing...' : 'Fix'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <HiCheckCircle className="text-5xl text-green-500 mb-2" />
                        <p>No mismatches found. System is healthy!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reconciliation;
