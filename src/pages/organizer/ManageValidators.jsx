import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { organizerAPI, eventAPI } from "../../services/api";
import {
  HiUserAdd,
  HiTrash,
  HiArrowLeft,
  HiMail,
  HiPhone,
} from "react-icons/hi";

const ManageValidators = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [validators, setValidators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventRes, validatorsRes] = await Promise.all([
        eventAPI.getOne(eventId),
        organizerAPI.getEventValidators(eventId),
      ]);
      setEvent(eventRes.data.event || eventRes.data);
      setValidators(validatorsRes.data.validators || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await organizerAPI.createValidator(eventId, formData);
      setSuccess(response.data.message);
      setValidators([...validators, response.data.validator]);
      setFormData({ fullName: "", email: "", password: "", phone: "" });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add validator");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (validatorId) => {
    if (!confirm("Remove this validator from the event?")) return;

    try {
      await organizerAPI.removeValidator(eventId, validatorId);
      setValidators(validators.filter((v) => v._id !== validatorId));
      setSuccess("Validator removed");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove validator");
    }
  };

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-8'></div>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-6'>
        <Link
          to='/organizer/events'
          className='text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm mb-2'>
          <HiArrowLeft /> Back to Events
        </Link>
        <h1 className='text-2xl font-bold text-gray-900'>Manage Validators</h1>
        <p className='text-gray-500'>{event?.title}</p>
      </div>

      {/* Messages */}
      {error && (
        <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
          {error}
        </div>
      )}
      {success && (
        <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700'>
          {success}
        </div>
      )}

      {/* Add Validator Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className='btn-primary flex items-center gap-2 mb-6'>
          <HiUserAdd /> Add Validator
        </button>
      )}

      {/* Add Validator Form */}
      {showAddForm && (
        <div className='card p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Add New Validator
          </h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Full Name *
                </label>
                <input
                  type='text'
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className='input'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email *
                </label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className='input'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Password *
                </label>
                <input
                  type='password'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className='input'
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Phone (optional)
                </label>
                <input
                  type='tel'
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className='input'
                />
              </div>
            </div>
            <div className='flex gap-3'>
              <button
                type='submit'
                className='btn-primary'
                disabled={submitting}>
                {submitting ? "Adding..." : "Add Validator"}
              </button>
              <button
                type='button'
                onClick={() => setShowAddForm(false)}
                className='btn-outline'>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Validators List */}
      <div className='card'>
        <div className='p-4 border-b border-gray-100'>
          <h2 className='font-semibold text-gray-900'>
            Validators ({validators.length})
          </h2>
        </div>
        {validators.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            No validators assigned to this event yet.
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {validators.map((validator) => (
              <div
                key={validator._id || validator.id}
                className='p-4 flex items-center justify-between'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    {validator.fullName}
                  </h3>
                  <div className='flex items-center gap-4 text-sm text-gray-500 mt-1'>
                    <span className='flex items-center gap-1'>
                      <HiMail className='text-gray-400' />
                      {validator.email}
                    </span>
                    {validator.phone && (
                      <span className='flex items-center gap-1'>
                        <HiPhone className='text-gray-400' />
                        {validator.phone}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(validator._id || validator.id)}
                  className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                  title='Remove validator'>
                  <HiTrash className='text-xl' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageValidators;
