import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Appointment } from '../../types';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BarberAppointments() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Verificar que el usuario esté autenticado y sea barbero
    if (isAuthenticated) {
      if (user?.role !== 'barber') {
        window.location.href = '/';
        return;
      }
      fetchAppointments();
    } else {
      setLoading(false);
      window.location.href = '/login';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Obtener todas las citas
      const response = await api.get<Appointment[] | { results: Appointment[] }>('/appointments/');
      
      // Manejar tanto arrays directos como objetos con propiedad results
      const allAppointments = Array.isArray(response) ? response : response.results || [];
      
      // Filtrar las citas donde el usuario actual es el barbero
      const myAppointments = allAppointments.filter(
        (apt) => apt.barber === user?.user.id
      );

      // Separar en upcoming (booked) y completed
      const upcoming = myAppointments.filter((apt) => apt.status === 'booked');
      const completed = myAppointments.filter((apt) => apt.status === 'completed');

      setUpcomingAppointments(upcoming);
      setCompletedAppointments(completed);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId: number) => {
    if (!confirm('¿Estás seguro de que quieres marcar esta cita como completada?')) {
      return;
    }

    try {
      await api.patch(`/appointments/${appointmentId}/complete/`);

      // Actualizar la lista de citas
      await fetchAppointments();

      alert('Cita marcada como completada exitosamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      await api.patch(`/appointments/${appointmentId}/cancel/`, {
        reason: 'Canceled by barber',
      });

      // Actualizar la lista de citas
      await fetchAppointments();

      alert('Cita cancelada exitosamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('es-ES', {
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
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">{appointment.client_name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium">{date}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-700">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Hora</p>
              <p className="font-medium">
                {time} ({appointment.duration_minutes} mins)
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">Servicio</p>
            <p className="font-medium text-gray-700">{appointment.service_name}</p>
          </div>
        </div>

        {appointment.status === 'booked' && (
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => handleCompleteAppointment(appointment.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Marcar como Completada</span>
            </button>
            <button
              onClick={() => handleCancelAppointment(appointment.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
          </div>
        )}
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

  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : completedAppointments;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Citas como Barbero</h1>
        <p className="text-gray-600">Gestiona tus citas y marca las completadas</p>
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
            Próximas Citas ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Completadas ({completedAppointments.length})
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
            {activeTab === 'upcoming' ? 'No hay citas próximas' : 'No hay citas completadas'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'upcoming'
              ? 'Las citas reservadas aparecerán aquí'
              : 'Tu historial de citas completadas aparecerá aquí'}
          </p>
        </div>
      )}
    </div>
  );
}
