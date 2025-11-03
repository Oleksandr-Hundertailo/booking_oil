/*
  # Express Car Oil Change Booking System

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `phone_number` (text, required) - Customer phone number
      - `booking_date` (date, required) - Appointment date
      - `booking_time` (text, required) - Appointment time slot
      - `car_vin` (text, optional) - Vehicle identification number
      - `car_plate` (text, required) - Car registration plate
      - `service_type` (text, required) - Type of oil change service
      - `price` (numeric, required) - Calculated price
      - `status` (text, required) - Booking status: pending, approved, declined
      - `customer_notes` (text, optional) - Additional customer notes
      - `admin_notes` (text, optional) - Notes from admin
      - `created_at` (timestamptz) - Timestamp of booking creation
      - `updated_at` (timestamptz) - Timestamp of last update
    
    - `service_types`
      - `id` (uuid, primary key)
      - `name_key` (text, required) - Translation key for service name
      - `base_price` (numeric, required) - Base price for the service
      - `duration_minutes` (integer, required) - Service duration
      - `active` (boolean) - Whether service is available
      - `created_at` (timestamptz)
    
    - `time_slots`
      - `id` (uuid, primary key)
      - `time_slot` (text, required) - Time slot (e.g., "09:00")
      - `active` (boolean) - Whether slot is available
      - `order_index` (integer) - Display order

  2. Security
    - Enable RLS on all tables
    - Public users can insert bookings (customer-facing form)
    - Public users can read service types and time slots
    - Only authenticated admins can read/update bookings
    - Only authenticated admins can manage service types and time slots
*/

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  car_vin text,
  car_plate text NOT NULL,
  service_type text NOT NULL,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  customer_notes text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service types table
CREATE TABLE IF NOT EXISTS service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_key text NOT NULL UNIQUE,
  base_price numeric NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create time slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot text NOT NULL UNIQUE,
  active boolean DEFAULT true,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admins can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service types policies
CREATE POLICY "Anyone can view active service types"
  ON service_types FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Authenticated admins can manage service types"
  ON service_types FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Time slots policies
CREATE POLICY "Anyone can view active time slots"
  ON time_slots FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Authenticated admins can manage time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default service types
INSERT INTO service_types (name_key, base_price, duration_minutes) VALUES
  ('service_basic', 150.00, 30),
  ('service_synthetic', 250.00, 45),
  ('service_premium', 350.00, 60),
  ('service_full', 450.00, 90)
ON CONFLICT (name_key) DO NOTHING;

-- Insert default time slots
INSERT INTO time_slots (time_slot, order_index) VALUES
  ('09:00', 1),
  ('10:00', 2),
  ('11:00', 3),
  ('12:00', 4),
  ('13:00', 5),
  ('14:00', 6),
  ('15:00', 7),
  ('16:00', 8),
  ('17:00', 9)
ON CONFLICT (time_slot) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time);