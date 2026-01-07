import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { HiUser, HiPhone, HiLockClosed, HiCheck, HiExclamationCircle } from 'react-icons/hi';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [organizerData, setOrganizerData] = useState({
        businessName: '',
        description: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || '',
                phone: user.phone || ''
            }));
            if (user.role === 'organizer' && user.organizerProfile) {
                setOrganizerData({
                    businessName: user.organizerProfile.businessName || '',
                    description: user.organizerProfile.description || ''
                });
            }
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleOrganizerChange = (e) => {
        const { name, value } = e.target;
        setOrganizerData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password && formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const updateData = {
                fullName: formData.fullName,
                phone: formData.phone
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            if (user.role === 'organizer') {
                updateData.organizerProfile = organizerData;
            }

            const response = await authAPI.updateProfile(updateData);
            setSuccess(response.data.message);
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            if (refreshUser) await refreshUser();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="card">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <HiUser className="text-primary-600" />
                        My Profile
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Update your personal information
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <HiExclamationCircle className="text-red-500 flex-shrink-0" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <HiCheck className="text-green-500 flex-shrink-0" />
                            <p className="text-green-700 text-sm">{success}</p>
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="08012345678"
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    {user?.role === 'organizer' && (
                        <>
                            <hr className="my-6" />
                            <h3 className="font-semibold text-gray-900">Organizer Details</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={organizerData.businessName}
                                    onChange={handleOrganizerChange}
                                    placeholder="Your business or brand name"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={organizerData.description}
                                    onChange={handleOrganizerChange}
                                    placeholder="Tell attendees about your events..."
                                    rows={3}
                                    className="input"
                                />
                            </div>
                        </>
                    )}

                    <hr className="my-6" />
                    <h3 className="font-semibold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500">Leave blank to keep current password</p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
