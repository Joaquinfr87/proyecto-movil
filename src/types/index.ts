export type { Database } from './database';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'gestor' | 'asistente';
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  capacidad: number;
  direccion: string;
  latitud: number;
  longitud: number;
  estado: string;
  horario: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Event {
  id: string;
  scenario_id: string;
  nombre: string;
  fecha: string;
  hora: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  user_id: string;
  scenario_id: string;
  created_at: string;
}

export interface ScenarioImage {
  id: string;
  scenario_id: string;
  storage_path: string;
  url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface ScenarioSector {
  id: string;
  scenario_id: string;
  nombre: string;
  svg_path: string;
  foto_360_url: string | null;
  color_hex: string;
  display_order: number;
  created_at?: string;
}

// ── Reservas de Canchas Deportivas ───────────────────────────────────────────

export type BookingStatus = 'confirmada' | 'completada' | 'cancelada';
export type BookingActivity = 'amistoso' | 'entrenamiento' | 'torneo' | 'recreativo';

export interface ScenarioBooking {
  id: string;
  booking_code: string;
  scenario_id: string;
  sector_id: string | null;
  user_id: string;
  booking_date: string;   // YYYY-MM-DD
  start_time: string;     // HH:mm
  end_time: string;       // HH:mm
  activity_type: BookingActivity;
  participants_count: number;
  contact_phone: string;
  notes: string | null;
  status: BookingStatus;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  scenarios?: Pick<Scenario, 'id' | 'nombre' | 'tipo' | 'direccion'>;
}

export interface CreateBookingPayload {
  scenario_id: string;
  sector_id?: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  activity_type: BookingActivity;
  participants_count: number;
  contact_phone: string;
  notes?: string;
}

export interface UpdateBookingPayload {
  id: string;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  participants_count?: number;
  contact_phone?: string;
  notes?: string;
  status?: BookingStatus;
  cancellation_reason?: string;
}
