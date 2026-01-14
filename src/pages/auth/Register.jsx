import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiTicket } from "react-icons/hi";
import { useThemeStore } from "../../store/themeStore";

const Register = () => {
  const theme = useThemeStore((state) => state.theme);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/");
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...data } = formData;
      await register(data);

      if (formData.role === "organizer") {
        navigate("/organizer");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8 flex flex-col items-center'>
          <img
            src={theme === "dark" ? "/assets/logo-2.png" : "/assets/logo1.png"}
            alt='Getick Logo'
            className='h-18 w-20'
          />
          <h1 className='text-2xl font-bold text-text mt-4'>Create Account</h1>
          <p className='text-text mt-2'>Join to start booking tickets</p>
        </div>

        <div className='card p-2'>
          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                Full Name
              </label>
              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleChange}
                className='input w-full'
                placeholder='John Doe'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='input w-full'
                placeholder='you@example.com'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                Phone Number
              </label>
              <input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                className='input w-full'
                placeholder='08012345678'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                Account Type
              </label>
              <select
                name='role'
                value={formData.role}
                onChange={handleChange}
                className='input w-full'>
                <option value='buyer'>Ticket Buyer</option>
                <option value='organizer'>Event Organizer</option>
              </select>
              {formData.role === "organizer" && (
                <p className='text-xs text-amber-600 mt-1'>
                  Organizer accounts require admin approval before publishing
                  events
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                Password
              </label>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className='input w-full'
                placeholder='••••••••'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                Confirm Password
              </label>
              <input
                type='password'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                className='input w-full'
                placeholder='••••••••'
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full btn py-3 disabled:opacity-50'>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className='text-center mt-6 text-sm text-text'>
            Already have an account?{" "}
            <Link
              to='/login'
              className='text-primary-600 hover:underline font-medium'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
