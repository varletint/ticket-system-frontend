import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { organizerAPI } from '../../services/api';
import { HiBuildingOffice, HiCreditCard, HiCheck, HiExclamationCircle } from 'react-icons/hi2';

const SetupPayout = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingBanks, setFetchingBanks] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        businessName: user?.organizerProfile?.businessName || '',
        bankCode: '',
        accountNumber: ''
    });

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const response = await organizerAPI.getBanks();
            setBanks(response.data.banks);
        } catch (err) {
            setError('Failed to load banks. Please refresh the page.');
        } finally {
            setFetchingBanks(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'accountNumber' && !/^\d*$/.test(value)) return;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.businessName || !formData.bankCode || !formData.accountNumber) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        if (formData.accountNumber.length !== 10) {
            setError('Account number must be 10 digits');
            setLoading(false);
            return;
        }

        try {
            await organizerAPI.setupPayout(formData);
            setSuccess(true);
            if (refreshUser) await refreshUser();
            setTimeout(() => navigate('/organizer'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to setup payout account');
        } finally {
            setLoading(false);
        }
    };

    if (user?.organizerProfile?.platformStatus !== 'approved') {
        return (
            <div className="max-w-xl mx-auto px-4 py-8">
                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiExclamationCircle className="text-3xl text-amber-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Account Not Approved Yet</h1>
                    <p className="text-gray-600 mb-4">
                        You need to complete your profile to get approved before you can setup payouts.
                    </p>
                    <button onClick={() => navigate('/profile')} className="btn-primary">
                        Complete Profile
                    </button>
                </div>
            </div>
        );
    }

    if (user?.organizerProfile?.paystack?.isActive) {
        return (
            <div className="max-w-xl mx-auto px-4 py-8">
                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiCheck className="text-3xl text-green-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Payout Already Setup</h1>
                    <p className="text-gray-600 mb-4">
                        Your Paystack subaccount is already active. Contact support if you need to make changes.
                    </p>
                    <button onClick={() => navigate('/organizer')} className="btn-primary">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-xl mx-auto px-4 py-8">
                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiCheck className="text-3xl text-green-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Payout Setup Complete!</h1>
                    <p className="text-gray-600">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="card">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <HiCreditCard className="text-primary-600" />
                        Setup Payout Account
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Enter your bank details to receive payments from ticket sales.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <HiExclamationCircle className="text-red-500 flex-shrink-0" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name
                        </label>
                        <div className="relative">
                            <HiBuildingOffice className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="Your business or event name"
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank
                        </label>
                        <select
                            name="bankCode"
                            value={formData.bankCode}
                            onChange={handleChange}
                            className="input"
                            disabled={fetchingBanks}
                        >
                            <option value="">
                                {fetchingBanks ? 'Loading banks...' : 'Select your bank'}
                            </option>
                            {banks.map(bank => (
                                <option key={bank.code} value={bank.code}>
                                    {bank.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            placeholder="10-digit account number"
                            maxLength={10}
                            className="input"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.accountNumber.length}/10 digits
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || fetchingBanks}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Setting up...' : 'Setup Payout Account'}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        You'll receive 90% of ticket sales directly to this account.
                        Platform fee is 10%.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SetupPayout;
