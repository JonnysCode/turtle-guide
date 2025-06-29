/*
  # Add medication reminders and health tracking tables

  1. New Tables
    - `medications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text)
      - `dosage` (text)
      - `frequency` (text) - daily, twice_daily, weekly, etc.
      - `times` (text array) - specific times like ["08:00", "20:00"]
      - `start_date` (date)
      - `end_date` (date, nullable)
      - `notes` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

    - `medication_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `medication_id` (uuid, references medications)
      - `scheduled_time` (timestamp)
      - `taken_at` (timestamp, nullable)
      - `status` (text) - taken, missed, skipped
      - `notes` (text, nullable)
      - `created_at` (timestamp)

    - `health_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `metric_type` (text) - blood_pressure, heart_rate, weight, temperature
      - `value` (jsonb) - flexible storage for different metric types
      - `unit` (text)
      - `recorded_at` (timestamp)
      - `notes` (text, nullable)
      - `created_at` (timestamp)

    - `symptom_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `symptom_type` (text) - headache, fatigue, dizziness, etc.
      - `severity` (integer, 1-10 scale)
      - `duration_minutes` (integer, nullable)
      - `triggers` (text array, nullable)
      - `notes` (text, nullable)
      - `recorded_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'weekly', 'as_needed')),
  times text[] NOT NULL DEFAULT '{}',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Medication logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time timestamptz NOT NULL,
  taken_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN ('blood_pressure', 'heart_rate', 'weight', 'temperature', 'blood_sugar', 'oxygen_saturation')),
  value jsonb NOT NULL,
  unit text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Symptom logs table
CREATE TABLE IF NOT EXISTS symptom_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  symptom_type text NOT NULL,
  severity integer NOT NULL CHECK (severity >= 1 AND severity <= 10),
  duration_minutes integer,
  triggers text[],
  notes text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;

-- Policies for medications
CREATE POLICY "Users can manage own medications"
  ON medications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for medication_logs
CREATE POLICY "Users can manage own medication logs"
  ON medication_logs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for health_metrics
CREATE POLICY "Users can manage own health metrics"
  ON health_metrics
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for symptom_logs
CREATE POLICY "Users can manage own symptom logs"
  ON symptom_logs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON medication_logs(user_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_type_date ON health_metrics(user_id, metric_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date ON symptom_logs(user_id, recorded_at);