-- Insert sample tables for the restaurant
-- Using the format "Mesa: X" to match the JWT validation logic

INSERT INTO tables (table_number, is_active) VALUES
  ('Mesa: 1', true),
  ('Mesa: 2', true),
  ('Mesa: 3', true),
  ('Mesa: 4', true),
  ('Mesa: 5', true),
  ('Mesa: 6', true),
  ('Mesa: 7', true),
  ('Mesa: 8', true),
  ('Mesa: 9', true),
  ('Mesa: 10', true),
  ('Mesa: 11', true),
  ('Mesa: 12', true),
  ('Mesa: 13', true),
  ('Mesa: 14', true),
  ('Mesa: 15', true),
  ('Mesa: 16', true),
  ('Mesa: 17', true),
  ('Mesa: 18', true),
  ('Mesa: 19', true),
  ('Mesa: 20', true)
ON CONFLICT (table_number) DO NOTHING;
