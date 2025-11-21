import { useAuth } from '../../context/AuthContext';
import { Scissors, Calendar, User, LogOut, Home, Briefcase, Star } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center space-x-2">
              <Scissors className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BarberShop</span>
            </a>

            {isAuthenticated && (
              <div className="hidden md:flex space-x-6">
                <a
                  href="/"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </a>
                <a
                  href="/services"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Services</span>
                </a>
                <a
                  href="/barbers"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <Star className="w-4 h-4" />
                  <span>Barbers</span>
                </a>
                <a
                  href="/appointments"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Appointments</span>
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.user.username}</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
