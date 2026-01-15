import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventAPI } from "../../services/api";
import { HiPlus, HiTrash, HiExclamationCircle } from "react-icons/hi";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { hasPaystack } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    artist: "",
    category: "concert",
    venue: { name: "", address: "", city: "", state: "", country: "Nigeria" },
    eventDate: "",
    ticketTiers: [
      { name: "General Admission", price: 5000, quantity: 100, maxPerUser: 4 },
    ],
  });

  // Block event creation if payout is not set up
  if (!hasPaystack) {
    return (
      <div className='bg-surface w-full'>
        <div className='max-w-xl mx-auto px-4 py-8'>
          <div className='card p-8 text-center'>
            <div className='w-16 h-16 bg-amber-100 flex items-center justify-center mx-auto mb-4'>
              <HiExclamationCircle className='text-3xl text-amber-600' />
            </div>
            <h1 className='text-xl font-bold text-text mb-2'>
              Payout Setup Required
            </h1>
            <p className='text-text/70 mb-4'>
              You need to set up your payout account before you can create
              events. This ensures you can receive payments from ticket sales.
            </p>
            <Link to='/organizer/setup-payout' className='btn-primary'>
              Setup Payout Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("venue.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        venue: { ...prev.venue, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTierChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map((tier, i) =>
        i === index
          ? { ...tier, [field]: field === "name" ? value : Number(value) }
          : tier
      ),
    }));
  };

  const addTier = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: [
        ...prev.ticketTiers,
        { name: "", price: 0, quantity: 50, maxPerUser: 4 },
      ],
    }));
  };

  const removeTier = (index) => {
    if (formData.ticketTiers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        ticketTiers: prev.ticketTiers.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await eventAPI.create(formData);
      navigate("/organizer/events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-surface w-full'>
      <div className='max-w-3xl mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold text-text mb-6'>Create New Event</h1>

        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 text-red-700 '>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Info */}
          <div className='card p-2'>
            <h2 className='text-lg font-semibold text-text mb-4'>
              Event Details
            </h2>

            <div className='grid gap-4'>
              <div>
                <label className='block text-sm font-medium text-text mb-1'>
                  Event Title *
                </label>
                <input
                  type='text'
                  name='title'
                  value={formData.title}
                  onChange={handleChange}
                  className='input w-full'
                  placeholder='Summer Music Festival 2024'
                  required
                />
              </div>

              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-text mb-1'>
                    Artist / Performer
                  </label>
                  <input
                    type='text'
                    name='artist'
                    value={formData.artist}
                    onChange={handleChange}
                    className='input w-full'
                    placeholder='Burna Boy, Wizkid'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-text mb-1'>
                    Category
                  </label>
                  <select
                    name='category'
                    value={formData.category}
                    onChange={handleChange}
                    className='input w-full'>
                    <option value='concert'>Concert</option>
                    <option value='festival'>Festival</option>
                    <option value='theater'>Theater</option>
                    <option value='sports'>Sports</option>
                    <option value='conference'>Conference</option>
                    <option value='other'>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-text mb-1'>
                  Description *
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  className='input min-h-[100px] w-full'
                  placeholder='Describe your event...'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-text mb-1'>
                  Event Date & Time *
                </label>
                <input
                  type='datetime-local'
                  name='eventDate'
                  value={formData.eventDate}
                  onChange={handleChange}
                  className='input w-full'
                  required
                />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className='card p-2'>
            <h2 className='text-lg font-semibold text-text mb-4'>Venue</h2>

            <div className='grid gap-4'>
              <div>
                <label className='block text-sm font-medium text-text mb-1'>
                  Venue Name *
                </label>
                <input
                  type='text'
                  name='venue.name'
                  value={formData.venue.name}
                  onChange={handleChange}
                  className='input w-full'
                  placeholder='Eko Convention Centre'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-text mb-1'>
                  Address
                </label>
                <input
                  type='text'
                  name='venue.address'
                  value={formData.venue.address}
                  onChange={handleChange}
                  className='input w-full'
                  placeholder='123 Main Street'
                />
              </div>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-text mb-1'>
                    City *
                  </label>
                  <input
                    type='text'
                    name='venue.city'
                    value={formData.venue.city}
                    onChange={handleChange}
                    className='input w-full'
                    placeholder='Lagos'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-text mb-1'>
                    State
                  </label>
                  <input
                    type='text'
                    name='venue.state'
                    value={formData.venue.state}
                    onChange={handleChange}
                    className='input w-full'
                    placeholder='Lagos State'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Tiers */}
          <div className='card p-2'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-text'>Ticket Tiers</h2>
              <button
                type='button'
                onClick={addTier}
                className='btn text-sm flex items-center gap-1'>
                <HiPlus /> Add Tier
              </button>
            </div>

            <div className='space-y-4'>
              {formData.ticketTiers.map((tier, index) => (
                <div key={index} className='p-4 bg-secondary-surface '>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-sm font-medium text-text'>
                      Tier {index + 1}
                    </span>
                    {formData.ticketTiers.length > 1 && (
                      <button
                        type='button'
                        onClick={() => removeTier(index)}
                        className='text-red-500 hover:text-red-700'>
                        <HiTrash />
                      </button>
                    )}
                  </div>
                  <div className='grid md:grid-cols-4 gap-3'>
                    <div>
                      <label className='block text-xs text-text mb-1'>
                        Name
                      </label>
                      <input
                        type='text'
                        value={tier.name}
                        onChange={(e) =>
                          handleTierChange(index, "name", e.target.value)
                        }
                        className='input text-sm'
                        placeholder='VIP'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-text mb-1'>
                        Price (₦)
                      </label>
                      <input
                        type='number'
                        value={tier.price}
                        onChange={(e) =>
                          handleTierChange(index, "price", e.target.value)
                        }
                        className='input text-sm'
                        min='0'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-text mb-1'>
                        Quantity
                      </label>
                      <input
                        type='number'
                        value={tier.quantity}
                        onChange={(e) =>
                          handleTierChange(index, "quantity", e.target.value)
                        }
                        className='input text-sm'
                        min='1'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-text mb-1'>
                        Max/Person
                      </label>
                      <input
                        type='number'
                        value={tier.maxPerUser}
                        onChange={(e) =>
                          handleTierChange(index, "maxPerUser", e.target.value)
                        }
                        className='input text-sm'
                        min='1'
                        max='10'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='flex gap-4'>
            <button
              type='button'
              onClick={() => navigate(-1)}
              className='btn flex-1'>
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='btn text-text flex-1 disabled:opacity-50'>
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
