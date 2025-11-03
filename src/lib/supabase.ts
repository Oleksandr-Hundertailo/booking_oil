import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Booking = {
  id: string;
  phone_number: string;
  booking_date: string;
  booking_time: string;
  car_vin?: string;
  car_plate: string;
  service_type: string;
  price: number;
  status: 'pending' | 'approved' | 'declined';
  customer_notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
};

export type ServiceType = {
  id: string;
  name_key: string;
  base_price: number;
  duration_minutes: number;
  active: boolean;
  created_at: string;
};

export type TimeSlot = {
  id: string;
  time_slot: string;
  active: boolean;
  order_index: number;
  created_at: string;
};
