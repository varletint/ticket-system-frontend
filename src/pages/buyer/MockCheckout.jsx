import { useSearchParams, useNavigate } from "react-router-dom";
import { HiCreditCard, HiLockClosed, HiShieldCheck } from "react-icons/hi";

const MockCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ref = searchParams.get("ref") || "unknown";
  const amount = parseInt(searchParams.get("amount")) || 0;

  const handlePayment = () => {
    // Simulate payment and redirect to verify page
    navigate(`/payment/verify?reference=${ref}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='w-full max-w-md'>
        {/* Mock Payment Card */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          {/* Header */}
          <div className='bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5'>
            <div className='flex items-center gap-3'>
              <HiShieldCheck className='text-2xl text-white' />
              <div>
                <p className='text-white/80 text-sm'>Mock Payment Gateway</p>
                <p className='text-white font-semibold'>Secure Checkout</p>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className='px-6 py-6 border-b border-gray-100 text-center'>
            <p className='text-gray-500 text-sm mb-1'>Amount to Pay</p>
            <p className='text-4xl font-bold text-gray-900'>
              ₦{amount.toLocaleString()}
            </p>
            <p className='text-gray-400 text-xs mt-2 font-mono'>Ref: {ref}</p>
          </div>

          {/* Mock Card Form */}
          <div className='px-6 py-6'>
            <div className='space-y-4'>
              {/* Card Number */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Card Number
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    value='4242 4242 4242 4242'
                    readOnly
                    className='input-field pl-10 bg-gray-50'
                  />
                  <HiCreditCard className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Expiry
                  </label>
                  <input
                    type='text'
                    value='12/28'
                    readOnly
                    className='input-field bg-gray-50'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    CVV
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      value='123'
                      readOnly
                      className='input-field pl-10 bg-gray-50'
                    />
                    <HiLockClosed className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Mode Notice */}
            <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <p className='text-yellow-800 text-sm text-center'>
                ⚠️ This is a <strong>test payment</strong>. No real charges will
                be made.
              </p>
            </div>

            {/* Action Buttons */}
            <div className='mt-6 space-y-3'>
              <button
                onClick={handlePayment}
                className='w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center gap-2'>
                <HiLockClosed />
                Pay ₦{amount.toLocaleString()}
              </button>
              <button
                onClick={handleCancel}
                className='w-full btn-secondary py-2'>
                Cancel Payment
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 bg-gray-50 border-t border-gray-100'>
            <div className='flex items-center justify-center gap-2 text-gray-400 text-sm'>
              <HiShieldCheck />
              <span>Secured by Mock Paystack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockCheckout;
