// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          phone: string | null
          birthdate: string | null // YYYY-MM-DD
          height_cm: number | null
          created_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          birthdate?: string | null
          height_cm?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          birthdate?: string | null
          height_cm?: number | null
          created_at?: string | null
        }
        Relationships: []
      }

      anthropometry: {
        Row: {
          id: string
          user_id: string
          measured_at: string // timestamptz
          weight_kg: number | null
          body_fat_pct: number | null
          waist_cm: number | null
          hip_cm: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          measured_at: string
          weight_kg?: number | null
          body_fat_pct?: number | null
          waist_cm?: number | null
          hip_cm?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          measured_at?: string
          weight_kg?: number | null
          body_fat_pct?: number | null
          waist_cm?: number | null
          hip_cm?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }

      training_plans: {
        Row: {
          id: string
          title: string | null
          status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null
          client_id: string | null
          trainer_id: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title?: string | null
          status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null
          client_id?: string | null
          trainer_id?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null
          client_id?: string | null
          trainer_id?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }

      plan_days: {
        Row: {
          id: string
          plan_id: string
          day_index: number // 0..6
          title: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          day_index: number
          title?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          day_index?: number
          title?: string | null
          created_at?: string | null
        }
        Relationships: []
      }

      plan_exercises: {
        Row: {
          id: string
          day_id: string
          order_index: number
          title: string
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          day_id: string
          order_index: number
          title: string
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          day_id?: string
          order_index?: number
          title?: string
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }

      pt_days_off: {
        Row: {
          id: string
          trainer_id: string
          date: string // YYYY-MM-DD
          start_time: string | null // HH:MM
          end_time: string | null   // HH:MM
          reason: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          trainer_id: string
          date: string
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          trainer_id?: string
          date?: string
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          created_at?: string | null
        }
        Relationships: []
      }

      // ✅ acrescentado para evitar erros de tipagem nos endpoints de sessões
      sessions: {
        Row: {
          id: string
          trainer_id: string
          client_id: string
          scheduled_at: string // timestamptz
          duration_min: number
          location: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          trainer_id: string
          client_id: string
          scheduled_at: string
          duration_min: number
          location?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          trainer_id?: string
          client_id?: string
          scheduled_at?: string
          duration_min?: number
          location?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
