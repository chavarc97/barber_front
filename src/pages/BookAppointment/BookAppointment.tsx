import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Service, UserProfile, AvailabilityCheck } from "../../types";
import { Check, AlertCircle } from "lucide-react";
import { useAuth } from '../../context/AuthContext';


export default function BookAppointment() {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const { isAuthenticated, user } = useAuth();
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityCheck | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    fetchServices();
    fetchBarbers();

    console.log(user?.user.id);

    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get("service");
    const barberId = params.get("barber");

    if (serviceId) setSelectedService(parseInt(serviceId));
    if (barberId) setSelectedBarber(parseInt(barberId));
  }, []);

  const fetchServices = async () => {
    try {
      const data = await api.get<Service[]>("services/", false);
      setServices(data);
    } catch (err) {
      console.error("Failed to load services", err);
    }
  };

  const fetchBarbers = async () => {
    try {
      const data = await api.get<UserProfile[]>("profiles/barbers/");
      setBarbers(data);
    } catch (err) {
      console.error("Failed to load barbers", err);
    }
  };

  const checkAvailability = async () => {
    if (!selectedBarber || !appointmentDate || !appointmentTime) {
      return;
    }

    setChecking(true);
    setError("");
    setAvailability(null);

    const service = services.find((s) => s.id === selectedService);
    const durationMinutes = service?.duration_minutes || 30;

    try {
      const datetime = `${appointmentDate}T${appointmentTime}:00`;
      const result = await api.post<AvailabilityCheck>(
        "appointments/check_availability/",
        {
          barber_id: selectedBarber,
          appointment_datetime: datetime,
          duration_minutes: durationMinutes,
        }
      );

      setAvailability(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check availability"
      );
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (selectedBarber && appointmentDate && appointmentTime) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedBarber, appointmentDate, appointmentTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!availability?.available) {
      setError("Please select an available time slot");
      return;
    }

    setLoading(true);
    setError("");

    const service = services.find((s) => s.id === selectedService);
    const datetime = `${appointmentDate}T${appointmentTime}:00`;

    try {
      await api.post("appointments/", {
        barber_id: selectedBarber,
        service_id: selectedService,
        client_id: user?.user.id,
        appointment_datetime: datetime,
        duration_minutes: service?.duration_minutes || 30,
        notes,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/appointments";
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to book appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedBarberData = barbers.find((b) => b.user.id === selectedBarber);

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-4">
            Your appointment has been successfully booked.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Book an Appointment
        </h1>
        <p className="text-gray-600">
          Fill in the details below to schedule your visit
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Service *
          </label>
          <select
            value={selectedService || ""}
            onChange={(e) => setSelectedService(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price} ({service.duration_minutes}{" "}
                mins)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Barber *
          </label>
          <select
            value={selectedBarber || ""}
            onChange={(e) => setSelectedBarber(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a barber</option>
            {barbers.map((barber) => (
              <option key={barber.user.id} value={barber.user.id}>
                {barber.user.first_name && barber.user.last_name
                  ? `${barber.user.first_name} ${barber.user.last_name}`
                  : barber.user.username}
                {barber.average_rating &&
                  ` (${barber.average_rating.toFixed(1)} ★)`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
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
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {availability.available ? (
              <>
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">
                    Time slot available!
                  </p>
                  <p className="text-sm text-green-700">
                    You can proceed with booking
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">
                    Time slot not available
                  </p>
                  <p className="text-sm text-red-700">{availability.reason}</p>
                </div>
              </>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any special requests or notes..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {selectedServiceData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Booking Summary
            </h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>Service: {selectedServiceData.name}</p>
              <p>Duration: {selectedServiceData.duration_minutes} minutes</p>
              <p>Price: ${selectedServiceData.price}</p>
              {selectedBarberData && (
                <p>
                  Barber:{" "}
                  {selectedBarberData.user.first_name &&
                  selectedBarberData.user.last_name
                    ? `${selectedBarberData.user.first_name} ${selectedBarberData.user.last_name}`
                    : selectedBarberData.user.username}
                </p>
              )}
              {appointmentDate && appointmentTime && (
                <p>
                  Date & Time: {appointmentDate} at {appointmentTime}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !availability?.available || checking}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}
