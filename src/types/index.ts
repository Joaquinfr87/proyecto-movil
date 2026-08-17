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
  created_at: string;
}

export interface Sport {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Event {
  id: string;
  escenario_id: string;
  nombre: string;
  fecha: string;
  hora: string;
  descripcion: string;
  created_at: string;
}

export interface Favorite {
  usuario_id: string;
  escenario_id: string;
  fecha: string;
}
