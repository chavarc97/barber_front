import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Service } from '../../types';
import { Clock, DollarSign, Scissors } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    } else {
      setLoading(false);
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [isAuthenticated]);
  const fetchServices = async () => {
    try {
      const data = await api.get<Service[]>('services/', false);
      console.log(data);
      setServices(data);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    console.log(selectedService);
    window.location.href = `/book?service=${service.id}`;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Services</h1>
        <p className="text-gray-600">Choose from our range of professional services</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
          >
            <div className="bg-linear-to-br from-blue-500 to-blue-600 p-6 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">{service.name}</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 min-h-[60px]">{service.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} mins</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>{service.price}</span>
                </div>
              </div>

              <button
                onClick={() => handleBookService(service)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="bg-gray-100 rounded-xl p-12 text-center">
          <Scissors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No services available</h3>
          <p className="text-gray-500">Check back later for our services</p>
        </div>
      )}
    </div>
  );
}
