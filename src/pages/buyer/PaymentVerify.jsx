import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ticketAPI } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  console.log(searchParams.get("reference"));

  useEffect(() => {
    // Paystack can return either 'reference' or 'trxref' as the payment reference
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    if (reference) {
      verifyPayment(reference);
    } else {
      setStatus("failed");
      setError("No payment reference found");
    }
  }, [searchParams]);

  const verifyPayment = async (reference) => {
    try {
      const response = await ticketAPI.verify(reference);
      setOrder(response.data.order);
      setStatus("success");
    } catch (err) {
      setStatus("failed");
      setError(err.response?.data?.message || "Payment verification failed");
    }
  };

  if (status === "verifying") {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <LoadingSpinner size='lg' />
          <p className='mt-4 text-gray-600'>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className='min-h-[60vh] flex items-center justify-center px-4'>
        <div className='text-center max-w-md'>
          <HiXCircle className='text-6xl text-red-500 mx-auto' />
          <h1 className='text-2xl font-bold text-gray-900 mt-4'>
            Payment Failed
          </h1>
          <p className='text-gray-500 mt-2'>{error}</p>
          <div className='mt-6 flex gap-4 justify-center'>
            <Link to='/events' className='btn-secondary'>
              Browse Events
            </Link>
            <button onClick={() => navigate(-1)} className='btn-primary'>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-[60vh] flex items-center justify-center px-4'>
      <div className='text-center max-w-md'>
        <div className='animate-bounce'>
          <HiCheckCircle className='text-7xl text-green-500 mx-auto' />
        </div>
        <h1 className='text-2xl font-bold text-gray-900 mt-4'>
          Payment Successful!
        </h1>
        <p className='text-gray-500 mt-2'>
          Your tickets have been generated and are ready to download.
        </p>

        {order && (
          <div className='mt-6 card p-4 text-left'>
            <p className='text-sm text-gray-500'>Order ID</p>
            <p className='font-mono text-sm'>{order.id}</p>

            {order.tickets && (
              <div className='mt-4'>
                <p className='text-sm text-gray-500 mb-2'>Tickets Generated</p>
                {order.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className='flex items-center justify-between py-2 border-t border-gray-100'>
                    <span className='text-sm'>{ticket.tierName}</span>
                    <Link
                      to={`/my-tickets`}
                      className='text-primary-600 text-sm hover:underline'>
                      View Ticket
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className='mt-6 flex gap-4 justify-center'>
          <Link to='/my-tickets' className='btn-primary'>
            View My Tickets
          </Link>
          <Link to='/events' className='btn-secondary'>
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerify;
