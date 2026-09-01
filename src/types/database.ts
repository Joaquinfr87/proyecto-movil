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
          horario: string | null;
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
          horario?: string | null;
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
          horario?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scenarios_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'scenario_sports_scenario_id_fkey';
            columns: ['scenario_id'];
            isOneToOne: false;
            referencedRelation: 'scenarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scenario_sports_sport_id_fkey';
            columns: ['sport_id'];
            isOneToOne: false;
            referencedRelation: 'sports';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'events_scenario_id_fkey';
            columns: ['scenario_id'];
            isOneToOne: false;
            referencedRelation: 'scenarios';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_scenario_id_fkey';
            columns: ['scenario_id'];
            isOneToOne: false;
            referencedRelation: 'scenarios';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'scenario_images_scenario_id_fkey';
            columns: ['scenario_id'];
            isOneToOne: false;
            referencedRelation: 'scenarios';
            referencedColumns: ['id'];
          },
        ];
      };
      scenario_sectors: {
        Row: {
          id: string;
          scenario_id: string;
          nombre: string;
          svg_path: string;
          foto_360_url: string | null;
          color_hex: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          nombre: string;
          svg_path: string;
          foto_360_url?: string | null;
          color_hex?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          nombre?: string;
          svg_path?: string;
          foto_360_url?: string | null;
          color_hex?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scenario_sectors_scenario_id_fkey';
            columns: ['scenario_id'];
            isOneToOne: false;
            referencedRelation: 'scenarios';
            referencedColumns: ['id'];
          },
        ];
      };
      scenario_ratings: {
        Row: {
          id: string;
          scenario_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          user_id: string;
          rating: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scenario_ratings_scenario_id_fkey';
            columns: ['scenario_id'];
            isOneToOne: false;
            referencedRelation: 'scenarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scenario_ratings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      scenario_rating_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          scenario_id: string;
          average: number;
          count: number;
        }[];
      };
    };
    Enums: {
      user_role: 'admin' | 'gestor' | 'asistente';
    };
  };
}
