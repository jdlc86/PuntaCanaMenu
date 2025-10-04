-- Add personalizacion and variants columns to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS personalizacion JSONB,
ADD COLUMN IF NOT EXISTS variants TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN order_items.personalizacion IS 'JSON array of personalizations: [{"name": "Extra cheese", "price": 1.5, "free": false}]';
COMMENT ON COLUMN order_items.variants IS 'Selected variant name (e.g., "Grande", "Con patatas")';

-- Create index for better query performance on personalizacion
CREATE INDEX IF NOT EXISTS idx_order_items_personalizacion ON order_items USING GIN (personalizacion);
