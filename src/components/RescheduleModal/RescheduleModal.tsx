import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Appointment, AvailabilityCheck } from '../../types';
import { X, Check, AlertCircle } from 'lucide-react';

interface RescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RescheduleModal({
  appointment,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityCheck | null>(null);
  const [error, setError] = useState('');

  const checkAvailability = async () => {
    if (!newDate || !newTime) return;

    setChecking(true);
    setError('');
    setAvailability(null);

    try {
      const datetime = `${newDate}T${newTime}:00`;
      const result = await api.post<AvailabilityCheck>('/appointments/check_availability/', {
        barber_id: appointment.barber.id,
        appointment_datetime: datetime,
        duration_minutes: appointment.duration_minutes,
      });

      setAvailability(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (newDate && newTime) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [newDate, newTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!availability?.available) {
      setError('Please select an available time slot');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const datetime = `${newDate}T${newTime}:00`;
      await api.patch(`/appointments/${appointment.id}/reschedule/`, {
        appointment_datetime: datetime,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const currentDateTime = new Date(appointment.appointment_datetime);
  const currentDateStr = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const currentTimeStr = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
          <div>
            <p className="text-sm text-gray-600">Current Date & Time</p>
            <p className="font-semibold text-gray-900">
              {currentDateStr} at {currentTimeStr}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Barber</p>
            <p className="font-semibold text-gray-900">
              {appointment.barber.first_name && appointment.barber.last_name
                ? `${appointment.barber.first_name} ${appointment.barber.last_name}`
                : appointment.barber.username}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date *
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Time *
            </label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {checking && (
            <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 p-4 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Checking availability...</span>
            </div>
          )}

          {availability && !checking && (
            <div
              className={`flex items-start space-x-3 p-4 rounded-lg ${
                availability.available
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {availability.available ? (
                <>
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Time slot available!</p>
                    <p className="text-sm text-green-700">You can proceed with rescheduling</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Time slot not available</p>
                    <p className="text-sm text-red-700">{availability.reason}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !availability?.available || checking}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
