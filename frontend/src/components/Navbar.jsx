import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import NotificationsPanel from './NotificationsPanel'; // Import NotificationsPanel
import { useAuth } from '../context/AuthContext'; // Import useAuth from AuthContext

const Navbar = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // State to control the notifications dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State to control the profile dropdown
  const { isAuthenticated, login, logout, user } = useAuth(); // Get user auth state from AuthContext
  const navigate = useNavigate(); // Use navigate hook for routing

  // Refs for dropdowns
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Toggle Notifications dropdown
  const toggleNotifications = () => {
    if (isProfileOpen) setIsProfileOpen(false); // Close profile dropdown if it is open
    setIsNotificationsOpen(!isNotificationsOpen); // Toggle notifications dropdown visibility
  };

  // Toggle Profile dropdown
  const toggleProfileDropdown = () => {
    if (isNotificationsOpen) setIsNotificationsOpen(false); // Close notifications dropdown if it is open
    setIsProfileOpen(!isProfileOpen); // Toggle profile dropdown visibility
  };

  // Handle logout
  const handleLogout = () => {
    logout(); // Call logout function from AuthContext
    setIsProfileOpen(false); // Close profile dropdown after logging out
  };

  // Close dropdowns if clicked outside
  const handleClickOutside = (event) => {
    if (
      notificationsRef.current && !notificationsRef.current.contains(event.target) &&
      profileRef.current && !profileRef.current.contains(event.target)
    ) {
      setIsNotificationsOpen(false); // Close notifications if clicked outside
      setIsProfileOpen(false); // Close profile if clicked outside
    }
  };

  // Set up event listener to detect clicks outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Logo click to redirect to the homepage ("/" or "/main")
  const handleLogoClick = () => {
    navigate('/'); // Redirect to home or you can change to '/main' based on your requirement
  };

  return (
    <nav className="bg-blue-500 p-4 flex justify-between items-center">
      {/* Click on logo redirects to '/' or '/main' */}
      <div className="text-white font-bold cursor-pointer" onClick={handleLogoClick}>
        TaskMaster
      </div>
      <input
        type="text"
        placeholder="Search tasks"
        className="px-3 py-2 rounded border focus:outline-none"
      />
      <div className="flex gap-4">
        <div className="relative" ref={notificationsRef}>
          <button className="text-white" onClick={toggleNotifications}>
            Notifications
          </button>
          {/* Dropdown for notifications */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg rounded-lg z-10">
              <NotificationsPanel />
            </div>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <button className="text-white" onClick={toggleProfileDropdown}>
            Profile
          </button>
          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg rounded-lg z-10">
              {isAuthenticated ? (
                // If authenticated, show Logout option
                <button className="block w-full px-4 py-2 text-left" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                // If not authenticated, show Login and Signup options
                <>
                  <button
                    className="block w-full px-4 py-2 text-left"
                    onClick={() => login({ username: 'user', password: 'password' })} // Example login, update as needed
                  >
                    Login
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left"
                    onClick={() => console.log('Signup clicked')} // Implement signup logic as needed
                  >
                    Signup
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
