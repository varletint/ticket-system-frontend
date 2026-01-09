import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiRefresh,
  HiTicket,
  HiExternalLink,
} from "react-icons/hi";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      setOrders(response.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (orderId) => {
    if (
      !confirm(
        "Retry this payment? You will be redirected to complete the payment."
      )
    )
      return;

    try {
      setRetrying(orderId);
      const response = await orderAPI.retryPayment(orderId);

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to retry payment");
      setRetrying(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <HiCheckCircle className='text-green-500 text-xl' />;
      case "failed":
        return <HiXCircle className='text-red-500 text-xl' />;
      default:
        return <HiClock className='text-amber-500 text-xl' />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      completed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}>
        {status}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>My Orders</h1>
        <button
          onClick={fetchOrders}
          className='btn btn-secondary flex items-center gap-2'>
          <HiRefresh /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className='card p-12 text-center'>
          <HiTicket className='mx-auto text-5xl text-gray-300 mb-4' />
          <h2 className='text-xl font-semibold text-gray-600 mb-2'>
            No orders yet
          </h2>
          <p className='text-gray-500 mb-4'>
            Browse events and purchase tickets to see your orders here.
          </p>
          <Link to='/events' className='btn btn-primary'>
            Browse Events
          </Link>
        </div>
      ) : (
        <div className='space-y-4'>
          {orders.map((order) => (
            <div
              key={order._id}
              className='card p-4 hover:shadow-md transition-shadow'>
              <div className='flex items-start gap-4'>
                {/* Event Image */}
                <div className='w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100'>
                  {order.event?.bannerImage ? (
                    <img
                      src={order.event.bannerImage}
                      alt={order.event.title}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <HiTicket className='text-2xl text-gray-400' />
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <h3 className='font-semibold text-gray-900 truncate'>
                        {order.event?.title || "Event"}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {order.quantity}x {order.tierName}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {getStatusIcon(order.paymentStatus)}
                      {getStatusBadge(order.paymentStatus)}
                    </div>
                  </div>

                  <div className='mt-2 flex items-center justify-between'>
                    <div>
                      <p className='text-lg font-bold text-primary-600'>
                        ₦{order.totalAmount?.toLocaleString()}
                      </p>
                      <p className='text-xs text-gray-400'>
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className='flex gap-2'>
                      {order.paymentStatus === "completed" && (
                        <Link
                          to='/my-tickets'
                          className='btn btn-primary text-sm flex items-center gap-1'>
                          <HiTicket /> View Tickets
                        </Link>
                      )}

                      {(order.paymentStatus === "failed" ||
                        order.paymentStatus === "pending") && (
                        <button
                          onClick={() => handleRetry(order._id)}
                          disabled={retrying === order._id}
                          className='btn btn-primary text-sm flex items-center gap-1'>
                          {retrying === order._id ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <HiExternalLink />
                              {order.paymentStatus === "failed"
                                ? "Retry Payment"
                                : "Complete Payment"}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Info (if failed) */}
              {order.transaction?.status === "failed" &&
                order.transaction?.failureReason && (
                  <div className='mt-3 p-2 bg-red-50 rounded text-sm text-red-600'>
                    <strong>Reason:</strong> {order.transaction.failureReason}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
