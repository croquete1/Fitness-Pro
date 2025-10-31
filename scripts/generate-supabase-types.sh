-- Create a table to store generated files
CREATE TABLE IF NOT EXISTS generated_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  contents text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION update_generated_files_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_generated_files_updated_at ON generated_files;
CREATE TRIGGER trg_update_generated_files_updated_at
BEFORE UPDATE ON generated_files
FOR EACH ROW EXECUTE FUNCTION update_generated_files_updated_at();
