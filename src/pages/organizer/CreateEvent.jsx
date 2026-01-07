import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { HiPlus, HiTrash } from 'react-icons/hi';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        artist: '',
        category: 'concert',
        venue: { name: '', address: '', city: '', state: '', country: 'Nigeria' },
        eventDate: '',
        ticketTiers: [{ name: 'General Admission', price: 5000, quantity: 100, maxPerUser: 4 }]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('venue.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                venue: { ...prev.venue, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTierChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            ticketTiers: prev.ticketTiers.map((tier, i) =>
                i === index ? { ...tier, [field]: field === 'name' ? value : Number(value) } : tier
            )
        }));
    };

    const addTier = () => {
        setFormData(prev => ({
            ...prev,
            ticketTiers: [...prev.ticketTiers, { name: '', price: 0, quantity: 50, maxPerUser: 4 }]
        }));
    };

    const removeTier = (index) => {
        if (formData.ticketTiers.length > 1) {
            setFormData(prev => ({
                ...prev,
                ticketTiers: prev.ticketTiers.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await eventAPI.create(formData);
            navigate('/organizer/events');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>

                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input"
                                placeholder="Summer Music Festival 2024"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Artist / Performer</label>
                                <input
                                    type="text"
                                    name="artist"
                                    value={formData.artist}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Burna Boy, Wizkid"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="input">
                                    <option value="concert">Concert</option>
                                    <option value="festival">Festival</option>
                                    <option value="theater">Theater</option>
                                    <option value="sports">Sports</option>
                                    <option value="conference">Conference</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input min-h-[100px]"
                                placeholder="Describe your event..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time *</label>
                            <input
                                type="datetime-local"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Venue */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue</h2>

                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                            <input
                                type="text"
                                name="venue.name"
                                value={formData.venue.name}
                                onChange={handleChange}
                                className="input"
                                placeholder="Eko Convention Centre"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                name="venue.address"
                                value={formData.venue.address}
                                onChange={handleChange}
                                className="input"
                                placeholder="123 Main Street"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input
                                    type="text"
                                    name="venue.city"
                                    value={formData.venue.city}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Lagos"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    name="venue.state"
                                    value={formData.venue.state}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Lagos State"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticket Tiers */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Ticket Tiers</h2>
                        <button type="button" onClick={addTier} className="btn-secondary text-sm flex items-center gap-1">
                            <HiPlus /> Add Tier
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.ticketTiers.map((tier, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">Tier {index + 1}</span>
                                    {formData.ticketTiers.length > 1 && (
                                        <button type="button" onClick={() => removeTier(index)} className="text-red-500 hover:text-red-700">
                                            <HiTrash />
                                        </button>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={tier.name}
                                            onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                                            className="input text-sm"
                                            placeholder="VIP"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Price (₦)</label>
                                        <input
                                            type="number"
                                            value={tier.price}
                                            onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                                            className="input text-sm"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={tier.quantity}
                                            onChange={(e) => handleTierChange(index, 'quantity', e.target.value)}
                                            className="input text-sm"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Max/Person</label>
                                        <input
                                            type="number"
                                            value={tier.maxPerUser}
                                            onChange={(e) => handleTierChange(index, 'maxPerUser', e.target.value)}
                                            className="input text-sm"
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEvent;
