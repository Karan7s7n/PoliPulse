// src/models/supabaseTypes.ts

// Policy interface
export interface Policy {
  id: string;
  purchase_date: string;
  client_name: string;
  nominee_name: string;
  policy_no: string;
  policy_type: string;
  company_name: string;
  business_type: string;
  premium: number;
  phone_no: string;
  email: string;
  address: string;
  dob: string;
  client_type: string;
  remarks: string;
  renewal_date: string;
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      policy: {
        Row: Policy;
        Insert: Omit<Policy, 'id'>;
        Update: Partial<Omit<Policy, 'id'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
