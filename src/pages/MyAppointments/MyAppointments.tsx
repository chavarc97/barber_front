import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Appointment } from '../../types';
import { Calendar, Clock, User, XCircle, Edit, Star } from 'lucide-react';
import RatingModal from '../../components/RatingModal/RatingModal';
import RescheduleModal from '../../components/RescheduleModal/RescheduleModal';
import { useAuth } from '../../context/AuthContext';

export default function MyAppointments() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [selectedForRating, setSelectedForRating] = useState<Appointment | null>(null);
  const [selectedForReschedule, setSelectedForReschedule] = useState<Appointment | null>(null);
  const [error, setError] = useState('');
  const [ratedAppointments, setRatedAppointments] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete. Only fetch appointments when authenticated.
    if (isAuthenticated) {
      setLoading(false);
      setUpcomingAppointments([]);
      setPastAppointments([]);
      fetchAppointments();
      fetchMyRatings();
      
      return;
    } else {
      setLoading(false);
      // Redirect to login page
      window.location.href = '/login';
    }
    
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [upcoming, history] = await Promise.all([
        api.get<Appointment[]>('/appointments/upcoming/'),
        api.get<Appointment[]>('/appointments/history/'),
      ]);

      setUpcomingAppointments(upcoming);
      setPastAppointments(history);
      
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRatings = async () => {
    try {
      const myRatings = await api.get<any[]>('/ratings/my_ratings/');
      const ids = new Set<number>();
      if (Array.isArray(myRatings)) {
        myRatings.forEach((r) => {
          const appt = r.appointment ?? r.appointment_id ?? (r.appointment && (r.appointment.id ?? r.appointment));
          if (typeof appt === 'number') ids.add(appt);
          else if (appt && typeof appt === 'object' && typeof appt.id === 'number') ids.add(appt.id);
        });
      }
      setRatedAppointments(ids);
    } catch (err) {
      console.error('Failed to fetch my ratings', err);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.patch(`/appointments/${appointmentId}/cancel/`, {
        reason: 'Canceled by client',
      });

      setUpcomingAppointments((prev) =>
        prev.filter((apt) => apt.id !== appointmentId)
      );

      alert('Appointment canceled successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const { date, time } = formatDateTime(appointment.appointment_datetime);

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                appointment.status
              )}`}
            >
              {appointment.status.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-500">#{appointment.id}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-gray-700">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Barber</p>
              <p className="font-medium">
                {appointment.barber.first_name && appointment.barber.last_name
                  ? `${appointment.barber.first_name} ${appointment.barber.last_name}`
                  : appointment.barber.username}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{date}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">
                {time} ({appointment.duration_minutes} mins)
              </p>
            </div>
          </div>

          {appointment.notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">{appointment.notes}</p>
            </div>
          )}
        </div>

        {appointment.status === 'booked' && (
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => setSelectedForReschedule(appointment)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="w-4 h-4" />
              <span>Reschedule</span>
            </button>
            <button
              onClick={() => handleCancelAppointment(appointment.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}

        {appointment.status === 'completed' && (() => {
          const isRated = ratedAppointments.has(appointment.id);
          return (
            <button
              onClick={() => !isRated && setSelectedForRating(appointment)}
              disabled={isRated}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 mt-4 rounded-lg transition ${isRated ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
            >
              <Star className="w-4 h-4" />
              <span>{isRated ? 'Already Rated' : 'Rate Service'}</span>
            </button>
          );
        })()}
      </div>
    );
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

  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your upcoming and past appointments</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            History ({pastAppointments.length})
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAppointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>

      {displayAppointments.length === 0 && (
        <div className="bg-gray-100 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'upcoming'
              ? 'Book your first appointment to get started'
              : 'Your appointment history will appear here'}
          </p>
          {activeTab === 'upcoming' && (
            <a
              href="/services"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Book Appointment
            </a>
          )}
        </div>
      )}

      {selectedForRating && (
        <RatingModal
          appointment={selectedForRating}
          onClose={() => setSelectedForRating(null)}
          onSuccess={() => {
            setSelectedForRating(null);
            fetchAppointments();
            fetchMyRatings();
          }}
        />
      )}

      {selectedForReschedule && (
        <RescheduleModal
          appointment={selectedForReschedule}
          onClose={() => setSelectedForReschedule(null)}
          onSuccess={() => {
            setSelectedForReschedule(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}
