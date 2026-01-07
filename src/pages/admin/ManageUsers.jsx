import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUsers({ role: roleFilter || undefined });
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!confirm(`Change user role to ${newRole}?`)) return;

        try {
            await adminAPI.updateUserRole(userId, newRole);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update role');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input w-40"
                >
                    <option value="">All Roles</option>
                    <option value="buyer">Buyers</option>
                    <option value="organizer">Organizers</option>
                    <option value="validator">Validators</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 font-medium text-gray-900">{user.fullName}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-4 py-4">
                                    <span className="badge badge-info capitalize">{user.role}</span>
                                </td>
                                <td className="px-4 py-4">
                                    {user.role === 'organizer' && (
                                        <span className={`badge ${user.organizerProfile?.platformStatus === 'approved' ? 'badge-success' :
                                                user.organizerProfile?.platformStatus === 'pending' ? 'badge-warning' :
                                                    'badge-error'
                                            }`}>
                                            {user.organizerProfile?.platformStatus || 'N/A'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className="input text-sm py-1 px-2 w-32"
                                    >
                                        <option value="buyer">Buyer</option>
                                        <option value="organizer">Organizer</option>
                                        <option value="validator">Validator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
