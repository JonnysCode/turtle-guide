/*
  # Add patient name to user profiles

  1. Changes
    - Add `patient_name` column to `user_profiles` table
    - Set default value to empty string for consistency
    - Update existing records to have empty string instead of null

  2. Security
    - No changes to RLS policies needed as this follows existing patterns
*/

-- Add patient_name column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'patient_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN patient_name text DEFAULT '' NOT NULL;
  END IF;
END $$;