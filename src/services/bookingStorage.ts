/**
 * bookingStorage.ts
 * Servicio de persistencia local para el módulo de Reservas de Canchas Deportivas.
 * Utiliza AsyncStorage para garantizar acceso offline a los comprobantes de turno.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScenarioBooking, CreateBookingPayload } from '../types';

// Claves de almacenamiento
const KEYS = {
  ACTIVE_BOOKINGS: '@bookings_active_cache',
  DRAFT: '@bookings_form_draft',
  PREFERENCES: '@bookings_user_preferences',
} as const;

// ── Comprobantes de Reservas Activas ─────────────────────────────────────────

/**
 * Guarda localmente la lista de reservas activas del usuario.
 * Permite ver los comprobantes sin conexión (útil en predios con poca señal).
 */
export async function cacheActiveBookings(bookings: ScenarioBooking[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ACTIVE_BOOKINGS, JSON.stringify(bookings));
  } catch {
    // Silenciar errores de storage; los datos vendrán de Supabase si hay conexión
  }
}

/** Devuelve las reservas activas del caché local. */
export async function getCachedActiveBookings(): Promise<ScenarioBooking[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ACTIVE_BOOKINGS);
    if (!raw) return [];
    return JSON.parse(raw) as ScenarioBooking[];
  } catch {
    return [];
  }
}

/** Limpia el caché de reservas (ej. al cerrar sesión). */
export async function clearBookingsCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.ACTIVE_BOOKINGS);
  } catch {
    // Ignorar
  }
}

// ── Borrador de Formulario ────────────────────────────────────────────────────

/**
 * Guarda un borrador parcial del formulario de reserva.
 * Se recupera automáticamente cuando el usuario vuelve a la pantalla de reserva.
 */
export async function saveBookingDraft(draft: Partial<CreateBookingPayload> & { scenario_nombre?: string }): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.DRAFT, JSON.stringify(draft));
  } catch {
    // Silenciar
  }
}

/** Obtiene el borrador guardado, o null si no existe. */
export async function getBookingDraft(): Promise<(Partial<CreateBookingPayload> & { scenario_nombre?: string }) | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DRAFT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Elimina el borrador guardado (tras guardar exitosamente). */
export async function clearBookingDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.DRAFT);
  } catch {
    // Ignorar
  }
}

// ── Preferencias del Usuario ─────────────────────────────────────────────────

export interface BookingUserPreferences {
  contact_phone?: string;
  preferred_activity?: string;
}

/**
 * Guarda el teléfono de contacto habitual y deporte favorito.
 * Permite autocompletar el formulario en reservas futuras.
 */
export async function saveBookingPreferences(prefs: BookingUserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch {
    // Silenciar
  }
}

/** Recupera las preferencias del usuario, o un objeto vacío si no existen. */
export async function getBookingPreferences(): Promise<BookingUserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
    if (!raw) return {};
    return JSON.parse(raw) as BookingUserPreferences;
  } catch {
    return {};
  }
}
