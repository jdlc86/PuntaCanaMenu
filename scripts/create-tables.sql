-- Create tables table if it doesn't exist
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 4,
  status VARCHAR(20) DEFAULT 'Disponible',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tables_status_check CHECK (status IN ('Disponible', 'Ocupada', 'Reservada', 'Mantenimiento'))
);

-- Insert sample tables (1-20)
INSERT INTO tables (number, capacity, status) 
VALUES 
  (1, 4, 'Disponible'),
  (2, 4, 'Disponible'),
  (3, 2, 'Disponible'),
  (4, 6, 'Disponible'),
  (5, 4, 'Disponible'),
  (6, 4, 'Disponible'),
  (7, 2, 'Disponible'),
  (8, 8, 'Disponible'),
  (9, 4, 'Disponible'),
  (10, 4, 'Disponible'),
  (11, 2, 'Disponible'),
  (12, 6, 'Disponible'),
  (13, 4, 'Disponible'),
  (14, 4, 'Disponible'),
  (15, 2, 'Disponible'),
  (16, 4, 'Disponible'),
  (17, 4, 'Disponible'),
  (18, 6, 'Disponible'),
  (19, 4, 'Disponible'),
  (20, 8, 'Disponible')
ON CONFLICT (number) DO NOTHING;
