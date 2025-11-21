export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserProfile {
  id: number;
  user: User;
  role: 'client' | 'barber' | 'admin';
  phone_number: string;
  created_at: string;
  active: boolean;
  average_rating?: number;
  total_ratings?: number;
}

export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: string;
  description: string;
  active: boolean;
}

export interface BarberSchedule {
  id: number;
  barber: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
}

export interface Appointment {
  id: number;
  client: User;
  barber: User;
  appointment_datetime: string;
  duration_minutes: number;
  status: 'booked' | 'completed' | 'canceled';
  notes: string;
  created_at: string;
  active: boolean;
}

export interface Rating {
  id: number;
  appointment: number;
  user: User;
  score: number;
  comment: string;
  created_at: string;
}

export interface Payment {
  id: number;
  appointment: number;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'refunded';
  paid_at: string | null;
  provider: string;
}

export interface AvailabilityCheck {
  available: boolean;
  reason?: string;
  barber_id: number;
  datetime: string;
  conflict_time?: string;
}
