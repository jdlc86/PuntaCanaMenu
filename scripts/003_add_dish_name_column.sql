-- Add dish_name column to order_items table
-- This stores the dish name at the time of order to preserve historical data
-- even if the menu item is later renamed or deleted

DO $$
BEGIN
  -- Add dish_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'dish_name'
  ) THEN
    ALTER TABLE public.order_items 
    ADD COLUMN dish_name TEXT;
    
    RAISE NOTICE 'Added dish_name column to order_items table';
  ELSE
    RAISE NOTICE 'dish_name column already exists in order_items table';
  END IF;
END $$;

-- Add comment to explain the column
COMMENT ON COLUMN public.order_items.dish_name IS 'Name of the dish at the time of order (preserved for historical records)';

-- Optionally backfill existing records with dish names from menu_items
-- This is safe to run multiple times
UPDATE public.order_items oi
SET dish_name = mi.name
FROM public.menu_items mi
WHERE oi.menu_item_id = mi.id 
AND oi.dish_name IS NULL;
