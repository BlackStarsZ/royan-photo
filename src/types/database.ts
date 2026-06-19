/**
 * Supabase database type definitions.
 * These mirror the SQL schema exactly for use with the Supabase client.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          code: string;
          name: string;
          host_id: string;
          game_mode: 'daily' | 'surprise';
          challenge_time: string | null;
          start_date: string;
          end_date: string | null;
          status: 'active' | 'ended';
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          host_id: string;
          game_mode: 'daily' | 'surprise';
          challenge_time?: string | null;
          start_date: string;
          end_date?: string | null;
          status?: 'active' | 'ended';
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          host_id?: string;
          game_mode?: 'daily' | 'surprise';
          challenge_time?: string | null;
          start_date?: string;
          end_date?: string | null;
          status?: 'active' | 'ended';
          created_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          game_id: string;
          pseudo: string;
          avatar_color: string;
          is_host: boolean;
          session_token: string;
          total_points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          pseudo: string;
          avatar_color?: string;
          is_host?: boolean;
          session_token?: string;
          total_points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          pseudo?: string;
          avatar_color?: string;
          is_host?: boolean;
          session_token?: string;
          total_points?: number;
          created_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          game_id: string | null;
          text: string;
          has_player_var: boolean;
          has_random_player_var: boolean;
          is_predefined: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id?: string | null;
          text: string;
          has_player_var?: boolean;
          has_random_player_var?: boolean;
          is_predefined?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string | null;
          text?: string;
          has_player_var?: boolean;
          has_random_player_var?: boolean;
          is_predefined?: boolean;
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          game_id: string;
          theme_id: string;
          theme_text: string;
          day_number: number;
          challenge_date: string;
          scheduled_time: string;
          status: 'pending' | 'active' | 'voting' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          theme_id: string;
          theme_text: string;
          day_number: number;
          challenge_date: string;
          scheduled_time: string;
          status?: 'pending' | 'active' | 'voting' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          theme_id?: string;
          theme_text?: string;
          day_number?: number;
          challenge_date?: string;
          scheduled_time?: string;
          status?: 'pending' | 'active' | 'voting' | 'completed';
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          challenge_id: string;
          participant_id: string;
          storage_path: string;
          public_url: string | null;
          votes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          participant_id: string;
          storage_path: string;
          public_url?: string | null;
          votes_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          participant_id?: string;
          storage_path?: string;
          public_url?: string | null;
          votes_count?: number;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          challenge_id: string;
          voter_id: string;
          photo_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          voter_id: string;
          photo_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          voter_id?: string;
          photo_id?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
