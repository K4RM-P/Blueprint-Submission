// Placeholder until `pnpm db:types` generates the real schema types (Stage 1).
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: "partner" | "staff" | "volunteer" };
        Insert: { id: string; role?: "partner" | "staff" | "volunteer" };
        Update: { role?: "partner" | "staff" | "volunteer" };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
