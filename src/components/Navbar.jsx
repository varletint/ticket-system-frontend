import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiTicket, HiMenu, HiX } from "react-icons/hi";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, isOrganizer, isValidator, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className='bg-white shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2'>
            <HiTicket className='text-3xl text-primary-600' />
            <span className='font-bold text-xl text-gray-900'>TicketHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-6'>
            <Link
              to='/events'
              className='text-gray-600 hover:text-primary-600 transition-colors'>
              Events
            </Link>

            {user ? (
              <>
                <Link
                  to='/my-tickets'
                  className='text-gray-600 hover:text-primary-600 transition-colors'>
                  My Tickets
                </Link>
                <Link
                  to='/my-orders'
                  className='text-gray-600 hover:text-primary-600 transition-colors'>
                  My Orders
                </Link>

                {(isOrganizer || isAdmin) && (
                  <Link
                    to='/organizer'
                    className='text-gray-600 hover:text-primary-600 transition-colors'>
                    Organizer
                  </Link>
                )}

                {(isValidator || isAdmin) && (
                  <Link
                    to='/validator'
                    className='text-gray-600 hover:text-primary-600 transition-colors'>
                    Validator
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to='/admin'
                    className='text-gray-600 hover:text-primary-600 transition-colors'>
                    Admin
                  </Link>
                )}

                <div className='flex items-center gap-4 ml-4 pl-4 border-l border-gray-200'>
                  <Link
                    to='/profile'
                    className='text-sm text-gray-600 hover:text-primary-600 transition-colors'>
                    {user.fullName}
                    <span className='ml-2 badge badge-info'>{user.role}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='btn-secondary text-sm'>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className='flex items-center gap-3'>
                <Link to='/login' className='btn-secondary'>
                  Login
                </Link>
                <Link to='/register' className='btn-primary'>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className='md:hidden text-gray-600'
            onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <HiX className='text-2xl' />
            ) : (
              <HiMenu className='text-2xl' />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-100 animate-fade-in'>
            <div className='flex flex-col gap-3'>
              <Link
                to='/events'
                className='px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg'>
                Events
              </Link>

              {user ? (
                <>
                  <Link
                    to='/my-tickets'
                    className='px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg'>
                    My Tickets
                  </Link>
                  <Link
                    to='/my-orders'
                    className='px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg'>
                    My Orders
                  </Link>

                  {(isOrganizer || isAdmin) && (
                    <Link
                      to='/organizer'
                      className='px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg'>
                      Organizer Dashboard
                    </Link>
                  )}

                  {(isValidator || isAdmin) && (
                    <Link
                      to='/validator'
                      className='px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg'>
                      Validator Dashboard
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to='/admin'
                      className='px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg'>
                      Admin Dashboard
                    </Link>
                  )}

                  <hr className='my-2' />
                  <Link
                    to='/profile'
                    className='px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg'>
                    My Profile
                  </Link>
                  <div className='px-3 py-2 text-sm text-gray-500'>
                    Logged in as {user.fullName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className='mx-3 btn-secondary text-sm'>
                    Logout
                  </button>
                </>
              ) : (
                <div className='flex flex-col gap-2 px-3'>
                  <Link to='/login' className='btn-secondary text-center'>
                    Login
                  </Link>
                  <Link to='/register' className='btn-primary text-center'>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
