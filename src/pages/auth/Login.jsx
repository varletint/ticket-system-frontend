import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiTicket } from "react-icons/hi";
import { useThemeStore } from "../../store/themeStore";
import logo from "../../assets/logo.png";
import getick from "../../assets/getick.png";

const Login = () => {
  const theme = useThemeStore((state) => state.theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "organizer") {
        navigate("/organizer");
      } else if (user.role === "validator") {
        navigate("/validator");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[80vh] bg-surface flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8 flex flex-col items-center'>
          <img
            src={theme === "dark" ? logo : getick}
            alt='Getick Logo'
            className='h-18 w-20'
          />
          <h1 className='text-2xl font-bold text-text mt-4'>Welcome Back</h1>
          <p className='text-text mt-2'>Sign in to your account</p>
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
                Email
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='input w-full'
                placeholder='you@example.com'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='input w-full'
                placeholder='••••••••'
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full btn disabled:opacity-50'>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className='text-center mt-6 text-sm text-gray-500'>
            Don't have an account?{" "}
            <Link
              to='/register'
              className='text-text hover:underline font-medium'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
