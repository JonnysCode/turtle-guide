/*
  # Emergency Contacts System

  1. New Tables
    - `emergency_contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text, contact name)
      - `relationship` (text, relationship to user)
      - `phone_number` (text, primary phone)
      - `phone_number_2` (text, secondary phone, optional)
      - `email` (text, optional)
      - `address` (text, optional)
      - `is_primary` (boolean, primary emergency contact)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on emergency_contacts table
    - Add policies for authenticated users to manage their own contacts
*/

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  phone_number text NOT NULL,
  phone_number_2 text,
  email text,
  address text,
  is_primary boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for emergency_contacts
CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_primary ON emergency_contacts(user_id, is_primary);

-- Function to ensure only one primary contact per user
CREATE OR REPLACE FUNCTION ensure_single_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this contact as primary, unset all other primary contacts for this user
  IF NEW.is_primary = true THEN
    UPDATE emergency_contacts 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one primary contact
CREATE TRIGGER trigger_ensure_single_primary_contact
  BEFORE INSERT OR UPDATE ON emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_contact();