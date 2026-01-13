import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        role: roleFilter || undefined,
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error:", error);
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
      alert(error.response?.data?.message || "Failed to update role");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-text'>Manage Users</h1>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className='input w-40'>
          <option value=''>All Roles</option>
          <option value='buyer'>Buyers</option>
          <option value='organizer'>Organizers</option>
          <option value='validator'>Validators</option>
          <option value='admin'>Admins</option>
        </select>
      </div>

      <div className='card overflow-x-scroll'>
        <table className='w-full'>
          <thead className='bg-text/40'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium text-text'>
                User
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-text'>
                Email
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-text'>
                Role
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-text'>
                Status
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-text'>
                Joined
              </th>
              <th className='px-4 py-3 text-right text-sm font-medium text-text'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-text/40'>
            {users.map((user) => (
              <tr key={user._id} className='hover:bg-text/40'>
                <td className='px-4 py-4 font-medium text-text'>
                  {user.fullName}
                </td>
                <td className='px-4 py-4 text-sm text-text/70'>{user.email}</td>
                <td className='px-4 py-4'>
                  <span className='badge badge-info text-text capitalize'>
                    {user.role}
                  </span>
                </td>
                <td className='px-4 py-4'>
                  {user.role === "organizer" && (
                    <span
                      className={`badge text-text/80 ${
                        user.organizerProfile?.platformStatus === "approved"
                          ? "badge-success"
                          : user.organizerProfile?.platformStatus === "pending"
                          ? "badge-warning"
                          : "badge-error"
                      }`}>
                      {user.organizerProfile?.platformStatus || "N/A"}
                    </span>
                  )}
                </td>
                <td className='px-4 py-4 text-sm text-text'>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className='px-4 py-4'>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className='input text-sm py-1 px-2 w-32'>
                    <option value='buyer'>Buyer</option>
                    <option value='organizer'>Organizer</option>
                    <option value='validator'>Validator</option>
                    <option value='admin'>Admin</option>
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
