import { useAuth } from '../../context/AuthContext';
import { Calendar, Scissors, Star, Clock } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();



  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl text-white shadow-xl">
        <h1 className="text-5xl font-bold mb-4">Welcome to BarberShop</h1>
        <p className="text-xl mb-8 text-blue-100">
          Book your appointment with the best barbers in town
        </p>
        {!isAuthenticated && (
          <div className="flex justify-center space-x-4">
            <a
              href="/signup"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition shadow-lg"
            >
              Get Started
            </a>
            <a
              href="/services"
              className="px-8 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition"
            >
              View Services
            </a>
          </div>
        )}
        {isAuthenticated && (
          <a
            href="/services"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition shadow-lg"
          >
            Book Now
          </a>
        )}
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Booking</h3>
          <p className="text-gray-600">
            Book your appointments online with just a few clicks
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Scissors className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Barbers</h3>
          <p className="text-gray-600">
            Our skilled barbers provide top-quality services
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Rated</h3>
          <p className="text-gray-600">
            Highly rated by our satisfied customers
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Hours</h3>
          <p className="text-gray-600">
            We work around your schedule
          </p>
        </div>
      </section>

      {isAuthenticated && (
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/services"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
            >
              <Scissors className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Browse Services</h3>
            </a>
            <a
              href="/barbers"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
            >
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">View Barbers</h3>
            </a>
            <a
              href="/appointments"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
            >
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">My Appointments</h3>
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
