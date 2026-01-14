import { useState, useEffect } from "react";
import {
  HiCurrencyDollar,
  HiRefresh,
  HiExclamation,
  HiCheck,
  HiClock,
} from "react-icons/hi";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const TransactionMonitor = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter.status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;

      const [transRes, statsRes] = await Promise.all([
        api.get("/transactions", { params }),
        api.get("/transactions/stats", { params }),
      ]);

      setTransactions(transRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id) => {
    if (!confirm("Are you sure you want to retry this transaction?")) return;
    try {
      setProcessing(true);
      const response = await api.post(`/transactions/${id}/retry`);

      // If backend returns a payment URL, redirect user to complete payment
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
        return;
      }

      fetchData();
      setSelectedTransaction(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to retry transaction");
    } finally {
      setProcessing(false);
    }
  };

  const handleRefund = async (id, amount) => {
    const reason = prompt("Enter refund reason:");
    if (!reason) return;
    try {
      setProcessing(true);
      await api.post(`/transactions/${id}/refund`, { amount, reason });
      fetchData();
      setSelectedTransaction(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to process refund");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      initiated: "bg-gray-100 text-gray-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-purple-100 text-purple-700",
      partially_refunded: "bg-amber-100 text-amber-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100"
        }`}>
        {status?.replace("_", " ")}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-text'>Transaction Monitor</h1>
        <button onClick={fetchData} className='btn flex items-center gap-2'>
          <HiRefresh />
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
        <div className='card p-2'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-green-100 '>
              <HiCheck className='text-green-600' />
            </div>
            <div>
              <p className='text-xs text-text/60'>Completed</p>
              <p className='text-xl font-bold text-text/80'>
                {stats?.summary?.completedCount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className='card p-2'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-red-100 '>
              <HiExclamation className='text-red-600' />
            </div>
            <div>
              <p className='text-xs text-text/60'>Failed</p>
              <p className='text-xl font-bold text-text/80'>
                {stats?.summary?.failedCount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className='card p-2'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 '>
              <HiClock className='text-blue-600' />
            </div>
            <div>
              <p className='text-xs text-text/60'>Pending</p>
              <p className='text-xl font-bold text-text/80'>
                {stats?.summary?.pendingCount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className='card p-2'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-purple-100 '>
              <HiCurrencyDollar className='text-purple-600' />
            </div>
            <div>
              <p className='text-xs text-text/60'>Refunded</p>
              <p className='text-xl font-bold text-text/80'>
                {stats?.summary?.refundedCount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-secondary-surface p-2'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-text/10 '>
              <HiCurrencyDollar className='text-text/30' />
            </div>
            <div>
              <p className='text-xs text-text/60'>Total Revenue</p>
              <p className='text-base font-bold text-text/80'>
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(stats?.summary?.totalAmount || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='card p-2 mb-6 text-text/90 flex flex-col gap-2'>
        <div className='grid md:grid-cols-3 gap-4'>
          <div>
            <label htmlFor='status'>Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className='input w-full'>
              <option value=''>All Status</option>
              <option value='initiated'>Initiated</option>
              <option value='processing'>Processing</option>
              <option value='completed'>Completed</option>
              <option value='failed'>Failed</option>
              <option value='refunded'>Refunded</option>
            </select>
          </div>
          <div>
            <label htmlFor='startDate'>Start Date</label>
            <input
              type='date'
              value={filter.startDate}
              onChange={(e) =>
                setFilter({ ...filter, startDate: e.target.value })
              }
              className='input w-full'
              placeholder='Start Date'
            />
          </div>
          <div>
            <label htmlFor='endDate'>End Date</label>
            <input
              type='date'
              value={filter.endDate}
              onChange={(e) =>
                setFilter({ ...filter, endDate: e.target.value })
              }
              className='input w-full'
              placeholder='End Date'
            />
          </div>
        </div>
        <div className='flex justify-end'>
          <button onClick={fetchData} className='btn w-full sm:w-50 '>
            Apply
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-text/20'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-text/60 uppercase'>
                  ID
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-text/60 uppercase'>
                  User
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-text/60 uppercase'>
                  Event
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-text/60 uppercase'>
                  Amount
                </th>
                <th className='px-4 py-3 text-center text-xs font-medium text-text/60 uppercase'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-text/60 uppercase'>
                  Date
                </th>
                <th className='px-4 py-3 text-center text-xs font-medium text-text/60 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-text/20'>
              {transactions.map((tx) => (
                <tr key={tx._id} className='hover:bg-text/5 even:bg-text/10'>
                  <td className='px-4 py-3 text-sm font-mono text-text/60'>
                    {tx._id.slice(-8)}
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    {tx.user?.email || "N/A"}
                  </td>
                  <td className='px-4 py-3  text-sm text-text/60 text-nowrap'>
                    {tx.event?.title || "N/A"}
                  </td>
                  <td className='px-4 py-3 text-sm text-text/60 text-right font-medium'>
                    ₦{tx.amount?.toLocaleString()}
                  </td>
                  <td className='px-4 py-3 text-center'>
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className='px-4 py-3 text-sm text-text/60'>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <button
                      onClick={() => setSelectedTransaction(tx)}
                      className='text-text/80 hover:text-text/60 text-sm'>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <div className='p-8 text-center text-text/60'>
            No transactions found
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6'>
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-xl font-bold'>Transaction Details</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className='text-gray-400 hover:text-gray-600'>
                ✕
              </button>
            </div>

            <div className='space-y-4'>
              <div className='flex justify-between'>
                <span className='text-text/60'>Status</span>
                {getStatusBadge(selectedTransaction.status)}
              </div>
              <div className='flex justify-between'>
                <span className='text-text/60'>Amount</span>
                <span className='font-bold'>
                  ₦{selectedTransaction.amount?.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text/60'>Refunded</span>
                <span>
                  ₦{selectedTransaction.totalRefunded?.toLocaleString() || 0}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text/60'>User</span>
                <span>{selectedTransaction.user?.email}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text/60'>Gateway</span>
                <span className='capitalize'>
                  {selectedTransaction.gateway?.provider}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text/60'>Reference</span>
                <span className='font-mono text-sm'>
                  {selectedTransaction.gateway?.reference}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text/60'>Retries</span>
                <span>
                  {selectedTransaction.retryCount} /{" "}
                  {selectedTransaction.maxRetries}
                </span>
              </div>

              {/* Actions */}
              <div className='pt-4 border-t flex gap-2'>
                {selectedTransaction.status === "failed" &&
                  selectedTransaction.retryCount <
                    selectedTransaction.maxRetries && (
                    <button
                      onClick={() => handleRetry(selectedTransaction._id)}
                      disabled={processing}
                      className='btn btn-primary flex-1'>
                      {processing ? "Processing..." : "Retry Transaction"}
                    </button>
                  )}
                {selectedTransaction.status === "completed" &&
                  selectedTransaction.amount >
                    (selectedTransaction.totalRefunded || 0) && (
                    <button
                      onClick={() =>
                        handleRefund(
                          selectedTransaction._id,
                          selectedTransaction.amount -
                            (selectedTransaction.totalRefunded || 0)
                        )
                      }
                      disabled={processing}
                      className='btn btn-secondary flex-1'>
                      {processing ? "Processing..." : "Refund"}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionMonitor;
