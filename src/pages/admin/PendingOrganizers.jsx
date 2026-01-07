import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiCheck, HiX } from 'react-icons/hi';

const PendingOrganizers = () => {
    const [organizers, setOrganizers] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [bankDetails, setBankDetails] = useState({ bankCode: '', accountNumber: '', businessName: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [orgRes, bankRes] = await Promise.all([
                adminAPI.getPendingOrganizers(),
                adminAPI.getBanks()
            ]);
            setOrganizers(orgRes.data.organizers);
            setBanks(bankRes.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await adminAPI.approveOrganizer(userId);
            setSelectedOrg(userId);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (userId) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        try {
            await adminAPI.rejectOrganizer(userId, reason);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject');
        }
    };

    const handleCreateSubaccount = async () => {
        if (!bankDetails.bankCode || !bankDetails.accountNumber) {
            alert('Please fill in bank details');
            return;
        }

        try {
            await adminAPI.createSubaccount(selectedOrg, bankDetails);
            alert('Subaccount created successfully!');
            setSelectedOrg(null);
            setBankDetails({ bankCode: '', accountNumber: '', businessName: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create subaccount');
        }
    };

    if (loading) return <LoadingSpinner />;

    if (selectedOrg) {
        return (
            <div className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Subaccount</h1>
                <div className="card p-6">
                    <p className="text-gray-600 mb-6">
                        Organizer approved! Now create their Paystack subaccount to enable payouts.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                            <select
                                value={bankDetails.bankCode}
                                onChange={(e) => setBankDetails({ ...bankDetails, bankCode: e.target.value })}
                                className="input"
                            >
                                <option value="">Select Bank</option>
                                {banks.map(bank => (
                                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                type="text"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                className="input"
                                placeholder="0123456789"
                                maxLength="10"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                            <input
                                type="text"
                                value={bankDetails.businessName}
                                onChange={(e) => setBankDetails({ ...bankDetails, businessName: e.target.value })}
                                className="input"
                                placeholder="DJ Nova Events"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button onClick={() => setSelectedOrg(null)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button onClick={handleCreateSubaccount} className="btn-primary flex-1">
                            Create Subaccount
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Organizer Approvals</h1>

            {organizers.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-gray-900">All caught up!</h3>
                    <p className="text-gray-500 mt-2">No pending organizer approvals</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {organizers.map(org => (
                        <div key={org._id} className="card p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{org.fullName}</h3>
                                    <p className="text-gray-500 text-sm">{org.email}</p>
                                    {org.organizerProfile?.businessName && (
                                        <p className="text-primary-600 text-sm mt-1">
                                            {org.organizerProfile.businessName}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        Registered: {new Date(org.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(org._id)}
                                        className="btn-success flex items-center gap-1"
                                    >
                                        <HiCheck /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(org._id)}
                                        className="btn-danger flex items-center gap-1"
                                    >
                                        <HiX /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingOrganizers;
