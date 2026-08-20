// Tipos generados desde la base de datos de Supabase
// Ejecutar: pnpm db:types para regenerar

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'gestor' | 'asistente';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: 'admin' | 'gestor' | 'asistente';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'gestor' | 'asistente';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scenarios: {
        Row: {
          id: string;
          nombre: string;
          tipo: string;
          descripcion: string;
          capacidad: number;
          direccion: string;
          latitud: number;
          longitud: number;
          estado: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          tipo: string;
          descripcion?: string;
          capacidad?: number;
          direccion?: string;
          latitud?: number;
          longitud?: number;
          estado?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          tipo?: string;
          descripcion?: string;
          capacidad?: number;
          direccion?: string;
          latitud?: number;
          longitud?: number;
          estado?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sports: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string;
        };
        Relationships: [];
      };
      scenario_sports: {
        Row: {
          scenario_id: string;
          sport_id: string;
        };
        Insert: {
          scenario_id: string;
          sport_id: string;
        };
        Update: {
          scenario_id?: string;
          sport_id?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          scenario_id: string;
          nombre: string;
          fecha: string;
          hora: string;
          descripcion: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          nombre: string;
          fecha: string;
          hora?: string;
          descripcion?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          nombre?: string;
          fecha?: string;
          hora?: string;
          descripcion?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          user_id: string;
          scenario_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          scenario_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          scenario_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      scenario_images: {
        Row: {
          id: string;
          scenario_id: string;
          storage_path: string;
          url: string;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          storage_path: string;
          url: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          storage_path?: string;
          url?: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'admin' | 'gestor' | 'asistente';
    };
  };
}
