import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { UserProfile } from '../../types';
import { Star, User, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Barbers() {
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchBarbers();
    }
    else {
      setLoading(false);
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [isAuthenticated]);
  const fetchBarbers = async () => {
    try {
      const data = await api.get<UserProfile[]>('profiles/barbers/');
      setBarbers(data);
      console.log(data);
    } catch (err) {
      setError('Failed to load barbers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookBarber = (barber: UserProfile) => {
    window.location.href = `/book?barber=${barber.user.id}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Expert Barbers</h1>
        <p className="text-gray-600">Meet our team of professional barbers</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
          >
            <div className="bg-linear-to-br from-slate-700 to-slate-800 p-6 text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-center">
                {barber.user.first_name && barber.user.last_name
                  ? `${barber.user.first_name} ${barber.user.last_name}`
                  : barber.user.username}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {barber.average_rating ? (
                  <>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(barber.average_rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-700 font-semibold">
                      {barber.average_rating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({barber.total_ratings} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">No reviews yet</span>
                )}
              </div>

              {barber.user.email && (
                <p className="text-gray-600 text-sm text-center">{barber.user.email}</p>
              )}

              {barber.phone_number && (
                <p className="text-gray-600 text-sm text-center">{barber.phone_number}</p>
              )}

              <button
                onClick={() => handleBookBarber(barber)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {barbers.length === 0 && (
        <div className="bg-gray-100 rounded-xl p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No barbers available</h3>
          <p className="text-gray-500">Check back later</p>
        </div>
      )}
    </div>
  );
}
