// src/types/supabase.ts
// Tipos gerados/ajustados manualmente para refletir as tabelas usadas no Supabase.
// Mantém-nos sincronizados com a estrutura SQL (scripts em /scripts).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      anthropometry: {
        Row: {
          id: string;
          user_id: string | null;
          measured_at: string | null;
          weight_kg: number | null;
          height_cm: number | null;
          body_fat_pct: number | null;
          bmi: number | null;
          chest_cm: number | null;
          waist_cm: number | null;
          hip_cm: number | null;
          thigh_cm: number | null;
          arm_cm: number | null;
          calf_cm: number | null;
          shoulders_cm: number | null;
          neck_cm: number | null;
          notes: string | null;
          created_by_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          measured_at?: string | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          body_fat_pct?: number | null;
          bmi?: number | null;
          chest_cm?: number | null;
          waist_cm?: number | null;
          hip_cm?: number | null;
          thigh_cm?: number | null;
          arm_cm?: number | null;
          calf_cm?: number | null;
          shoulders_cm?: number | null;
          neck_cm?: number | null;
          notes?: string | null;
          created_by_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          measured_at?: string | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          body_fat_pct?: number | null;
          bmi?: number | null;
          chest_cm?: number | null;
          waist_cm?: number | null;
          hip_cm?: number | null;
          thigh_cm?: number | null;
          arm_cm?: number | null;
          calf_cm?: number | null;
          shoulders_cm?: number | null;
          neck_cm?: number | null;
          notes?: string | null;
          created_by_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      audit_log: {
        Row: {
          id: string;
          created_at: string | null;
          kind: string | null;
          category: string | null;
          action: string | null;
          target_type: string | null;
          target_id: string | null;
          actor_id: string | null;
          actor: string | null;
          note: string | null;
          details: Json | null;
          meta: Json | null;
          payload: Json | null;
          target: string | null;
          ip: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          kind?: string | null;
          category?: string | null;
          action?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          actor_id?: string | null;
          actor?: string | null;
          note?: string | null;
          details?: Json | null;
          meta?: Json | null;
          payload?: Json | null;
          target?: string | null;
          ip?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          kind?: string | null;
          category?: string | null;
          action?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          actor_id?: string | null;
          actor?: string | null;
          note?: string | null;
          details?: Json | null;
          meta?: Json | null;
          payload?: Json | null;
          target?: string | null;
          ip?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };

      auth_local_users: {
        Row: {
          id: string;
          user_id: string | null;
          email: string | null;
          encrypted_password: string | null;
          raw_app_meta_data: Json | null;
          raw_user_meta_data: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          encrypted_password?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          encrypted_password?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      client_wallet: {
        Row: {
          user_id: string;
          balance: number | null;
          currency: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          balance?: number | null;
          currency?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          balance?: number | null;
          currency?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      client_wallet_entries: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          desc: string | null;
          created_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          desc?: string | null;
          created_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          desc?: string | null;
          created_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };

      fitness_questionnaire: {
        Row: {
          id: string;
          user_id: string;
          wellbeing_0_to_5: number | null;
          objective: string | null;
          job: string | null;
          active: boolean | null;
          sport: string | null;
          sport_time: string | null;
          pathologies: string | null;
          schedule: Json | null;
          metrics: Json | null;
          status: 'draft' | 'submitted' | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          wellbeing_0_to_5?: number | null;
          objective?: string | null;
          job?: string | null;
          active?: boolean | null;
          sport?: string | null;
          sport_time?: string | null;
          pathologies?: string | null;
          schedule?: Json | null;
          metrics?: Json | null;
          status?: 'draft' | 'submitted' | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          wellbeing_0_to_5?: number | null;
          objective?: string | null;
          job?: string | null;
          active?: boolean | null;
          sport?: string | null;
          sport_time?: string | null;
          pathologies?: string | null;
          schedule?: Json | null;
          metrics?: Json | null;
          status?: 'draft' | 'submitted' | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      fitness_questionnaire_notes: {
        Row: {
          id: string;
          questionnaire_id: string;
          author_id: string;
          visibility: 'private' | 'shared';
          body: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          questionnaire_id: string;
          author_id: string;
          visibility?: 'private' | 'shared';
          body?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          questionnaire_id?: string;
          author_id?: string;
          visibility?: 'private' | 'shared';
          body?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      motivation_phrases: {
        Row: {
          id: string;
          text: string;
          author: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          text: string;
          author?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          text?: string;
          author?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      notification_reads: {
        Row: {
          notification_id: string;
          user_id: string;
          read_at: string | null;
          created_at: string | null;
        };
        Insert: {
          notification_id: string;
          user_id: string;
          read_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          notification_id?: string;
          user_id?: string;
          read_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      onboarding_forms: {
        Row: {
          id: string;
          user_id: string;
          status: 'draft' | 'submitted' | null;
          goals: Json | null;
          injuries: Json | null;
          medical: Json | null;
          activity_level: string | null;
          experience: string | null;
          availability: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'draft' | 'submitted' | null;
          goals?: Json | null;
          injuries?: Json | null;
          medical?: Json | null;
          activity_level?: string | null;
          experience?: string | null;
          availability?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'draft' | 'submitted' | null;
          goals?: Json | null;
          injuries?: Json | null;
          medical?: Json | null;
          activity_level?: string | null;
          experience?: string | null;
          availability?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      onboarding_notes: {
        Row: {
          id: string;
          onboarding_id: string;
          author_id: string;
          visibility: 'private' | 'shared';
          content: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          onboarding_id: string;
          author_id: string;
          visibility?: 'private' | 'shared';
          content?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          onboarding_id?: string;
          author_id?: string;
          visibility?: 'private' | 'shared';
          content?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      plan_blocks: {
        Row: {
          id: string;
          plan_id: string;
          day_id: string | null;
          title: string | null;
          order_index: number | null;
          content: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          day_id?: string | null;
          title?: string | null;
          order_index?: number | null;
          content?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          plan_id?: string;
          day_id?: string | null;
          title?: string | null;
          order_index?: number | null;
          content?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      plan_change_logs: {
        Row: {
          id: string;
          created_at: string | null;
          plan_id: string | null;
          action: string | null;
          actor_id: string | null;
          actor_email: string | null;
          details: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          plan_id?: string | null;
          action?: string | null;
          actor_id?: string | null;
          actor_email?: string | null;
          details?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          plan_id?: string | null;
          action?: string | null;
          actor_id?: string | null;
          actor_email?: string | null;
          details?: Json | null;
        };
        Relationships: [];
      };

      plan_days: {
        Row: {
          id: string;
          plan_id: string;
          day_index: number;
          title: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          day_index: number;
          title?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          plan_id?: string;
          day_index?: number;
          title?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      plan_exercises: {
        Row: {
          id: string;
          day_id: string;
          order_index: number;
          title: string;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          day_id: string;
          order_index: number;
          title: string;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          day_id?: string;
          order_index?: number;
          title?: string;
          notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          name: string | null;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          birthdate: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          rejection_reason: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          birthdate?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          rejection_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          birthdate?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          rejection_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      profile_private: {
        Row: {
          user_id: string;
          phone: string | null;
          settings: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          phone?: string | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          phone?: string | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      pt_days_off: {
        Row: {
          id: string;
          trainer_id: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      pt_sessions: {
        Row: {
          id: string;
          trainer_id: string;
          client_id: string;
          starts_at: string | null;
          ends_at: string | null;
          duration_min: number | null;
          location: string | null;
          status: string | null;
          notes: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          client_id: string;
          starts_at?: string | null;
          ends_at?: string | null;
          duration_min?: number | null;
          location?: string | null;
          status?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          client_id?: string;
          starts_at?: string | null;
          ends_at?: string | null;
          duration_min?: number | null;
          location?: string | null;
          status?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string | null;
          auth: string | null;
          user_agent: string | null;
          device: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh?: string | null;
          auth?: string | null;
          user_agent?: string | null;
          device?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string | null;
          auth?: string | null;
          user_agent?: string | null;
          device?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      register_requests: {
        Row: {
          id: string;
          name: string | null;
          username: string | null;
          email: string;
          role: string | null;
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | null;
          created_at: string | null;
          updated_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          username?: string | null;
          email: string;
          role?: string | null;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | null;
          created_at?: string | null;
          updated_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          username?: string | null;
          email?: string;
          role?: string | null;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | null;
          created_at?: string | null;
          updated_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };

      sessions: {
        Row: {
          id: string;
          trainer_id: string;
          client_id: string;
          scheduled_at: string;
          duration_min: number;
          location: string | null;
          notes: string | null;
          created_at: string | null;
          client_attendance_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;
          client_attendance_at: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          client_id: string;
          scheduled_at: string;
          duration_min: number;
          location?: string | null;
          notes?: string | null;
          created_at?: string | null;
          client_attendance_status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;
          client_attendance_at?: string | null;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          client_id?: string;
          scheduled_at?: string;
          duration_min?: number;
          location?: string | null;
          notes?: string | null;
          created_at?: string | null;
          client_attendance_status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;
          client_attendance_at?: string | null;
        };
        Relationships: [];
      };

      trainer_blocks: {
        Row: {
          id: string;
          trainer_id: string;
          starts_at: string;
          ends_at: string;
          title: string | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          starts_at: string;
          ends_at: string;
          title?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          starts_at?: string;
          ends_at?: string;
          title?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      trainer_locations: {
        Row: {
          id: string;
          trainer_id: string;
          label: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          label: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          label?: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      training_days: {
        Row: {
          id: string;
          plan_id: string;
          title: string | null;
          order_index: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          title?: string | null;
          order_index?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          plan_id?: string;
          title?: string | null;
          order_index?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      training_plan_blocks: {
        Row: {
          id: string;
          plan_id: string;
          title: string | null;
          order_index: number | null;
          payload: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          title?: string | null;
          order_index?: number | null;
          payload?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          plan_id?: string;
          title?: string | null;
          order_index?: number | null;
          payload?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      training_plan_changes: {
        Row: {
          id: string;
          plan_id: string;
          actor_id: string | null;
          change_type: string;
          diff: Json | null;
          snapshot: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          actor_id?: string | null;
          change_type: string;
          diff?: Json | null;
          snapshot?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          plan_id?: string;
          actor_id?: string | null;
          change_type?: string;
          diff?: Json | null;
          snapshot?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      training_plans: {
        Row: {
          id: string;
          title: string | null;
          status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED' | null;
          client_id: string | null;
          trainer_id: string | null;
          notes: string | null;
          exercises: Json | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED' | null;
          client_id?: string | null;
          trainer_id?: string | null;
          notes?: string | null;
          exercises?: Json | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED' | null;
          client_id?: string | null;
          trainer_id?: string | null;
          notes?: string | null;
          exercises?: Json | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          username: string | null;
          role: 'ADMIN' | 'TRAINER' | 'CLIENT' | null;
          status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | null;
          approved: boolean | null;
          active: boolean | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_sign_in_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          username?: string | null;
          role?: 'ADMIN' | 'TRAINER' | 'CLIENT' | null;
          status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | null;
          approved?: boolean | null;
          active?: boolean | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_sign_in_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          username?: string | null;
          role?: 'ADMIN' | 'TRAINER' | 'CLIENT' | null;
          status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | null;
          approved?: boolean | null;
          active?: boolean | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_sign_in_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
    };

    Views: {
      onboarding_forms_with_user: {
        Row: {
          id: string | null;
          user_id: string | null;
          status: 'draft' | 'submitted' | null;
          goals: Json | null;
          injuries: Json | null;
          medical: Json | null;
          activity_level: string | null;
          experience: string | null;
          availability: Json | null;
          created_at: string | null;
          updated_at: string | null;
          profile_name: string | null;
          user_email: string | null;
          user_role: string | null;
        };
        Relationships: [];
      };
    };

    Functions: Record<string, never>;

    Enums: {
      UserStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
      TrainingPlanStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED';
      OnboardingVisibility: 'private' | 'shared';
      OnboardingStatus: 'draft' | 'submitted';
    };

    CompositeTypes: Record<string, never>;
  };
};

export type PublicSchema = Database['public'];
