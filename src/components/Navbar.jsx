import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiTicket, HiMenu, HiX, HiMoon, HiSun } from "react-icons/hi";
import { useState } from "react";
import { useApplyTheme } from "../hooks/useApplyTheme";
import { useThemeStore } from "../store/themeStore";

const Navbar = () => {
  useApplyTheme();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { user, logout, isOrganizer, isValidator, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className='bg-surface sticky border-b border-text top-0 z-50 backdrop-blur-xs'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          {/* <HiTicket className='text-3xl text-text' onClick={ toggleTheme } /> */}
          {theme === "dark" ? (
            <HiSun className='text-xl text-text' onClick={toggleTheme} />
          ) : (
            <HiMoon className='text-xl text-text' onClick={toggleTheme} />
          )}
          <Link to='/' className='flex items-center gap-2'>
            <span className='font-bold text-xl text-text font-[Plus_Jakarta_Sans]'>
              Getick
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-6'>
            <Link
              to='/events'
              className='text-text hover:text-text transition-colors'>
              Events
            </Link>

            {user ? (
              <>
                <Link
                  to='/my-tickets'
                  className='text-text hover:text-text transition-colors'>
                  My Tickets
                </Link>
                <Link
                  to='/my-orders'
                  className='text-text hover:text-text transition-colors'>
                  My Orders
                </Link>

                {(isOrganizer || isAdmin) && (
                  <Link
                    to='/organizer'
                    className='text-text hover:text-text transition-colors'>
                    Organizer
                  </Link>
                )}

                {(isValidator || isAdmin) && (
                  <Link
                    to='/validator'
                    className='text-text hover:text-text transition-colors'>
                    Validator
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to='/admin'
                    className='text-text hover:text-text transition-colors'>
                    Admin
                  </Link>
                )}

                <div className='flex items-center gap-4 ml-4 pl-4 border-l border-gray-200'>
                  <Link
                    to='/profile'
                    className='text-sm text-text hover:text-text transition-colors'>
                    {user.fullName}
                    <span className='ml-2 badge badge-info'>{user.role}</span>
                  </Link>
                  <button onClick={handleLogout} className='btn text-sm'>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className='flex items-center gap-3'>
                <Link to='/login' className='btn'>
                  Login
                </Link>
                <Link to='/register' className='btn'>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className='md:hidden text-text'
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
          <div className='md:hidden py-4 border-t border-text animate-fade-in'>
            <div className='flex flex-col gap-3'>
              <Link
                to='/events'
                className='px-3 py-2 text-text hover:bg-gray-50 rounded-lg'>
                Events
              </Link>

              {user ? (
                <>
                  <Link
                    to='/my-tickets'
                    className='px-3 py-2 text-text hover:bg-gray-50 rounded-lg'>
                    My Tickets
                  </Link>
                  <Link
                    to='/my-orders'
                    className='px-3 py-2 text-text hover:bg-gray-50 rounded-lg'>
                    My Orders
                  </Link>

                  {(isOrganizer || isAdmin) && (
                    <Link
                      to='/organizer'
                      className='px-3 py-2 text-text hover:bg-gray-50 rounded-lg'>
                      Organizer Dashboard
                    </Link>
                  )}

                  {(isValidator || isAdmin) && (
                    <Link
                      to='/validator'
                      className='px-3 py-2 text-text hover:bg-gray-50 rounded-lg'>
                      Validator Dashboard
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to='/admin'
                      className='px-3 py-2 text-text hover:bg-gray-50 rounded-lg'>
                      Admin Dashboard
                    </Link>
                  )}

                  <hr className='my-2 border border-text' />
                  <Link
                    to='/profile'
                    className='px-3 py-2 text-text hover:bg-gray-50 rounded-lg'>
                    My Profile
                  </Link>
                  <div className='px-3 py-2 text-sm text-gray-500'>
                    Logged in as {user.fullName}
                  </div>
                  <button onClick={handleLogout} className='mx-3 btn text-sm'>
                    Logout
                  </button>
                </>
              ) : (
                <div className='flex flex-col gap-2 px-3'>
                  <Link to='/login' className='btn text-center'>
                    Login
                  </Link>
                  <Link to='/register' className='btn text-center'>
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
