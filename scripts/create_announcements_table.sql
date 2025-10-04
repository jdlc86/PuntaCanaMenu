-- Create announcements table for restaurant notifications
CREATE TABLE IF NOT EXISTS public.announcements (
    id SERIAL PRIMARY KEY,
    content_translations JSONB NOT NULL DEFAULT '{}',
    priority INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a view for currently visible announcements
CREATE OR REPLACE VIEW public.announcements_visible_now AS
SELECT 
    content_translations,
    priority,
    updated_at
FROM public.announcements
WHERE 
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
ORDER BY priority DESC, updated_at DESC;

-- Insert some sample announcements
INSERT INTO public.announcements (content_translations, priority, is_active) VALUES
(
    '{
        "es": "¡Bienvenidos a nuestro restaurante! Disfruten de nuestra especialidad: Paella Valenciana.",
        "en": "Welcome to our restaurant! Enjoy our specialty: Paella Valenciana.",
        "ca": "Benvinguts al nostre restaurant! Gaudiu de la nostra especialitat: Paella Valenciana."
    }',
    1,
    true
),
(
    '{
        "es": "Nuevo menú de temporada disponible. ¡Prueben nuestros platos de primavera!",
        "en": "New seasonal menu available. Try our spring dishes!",
        "ca": "Nou menú de temporada disponible. Proveu els nostres plats de primavera!"
    }',
    2,
    true
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow public read access" ON public.announcements
    FOR SELECT USING (true);

-- Create policy to allow insert/update/delete for authenticated users only
CREATE POLICY "Allow authenticated users to manage announcements" ON public.announcements
    FOR ALL USING (auth.role() = 'authenticated');
