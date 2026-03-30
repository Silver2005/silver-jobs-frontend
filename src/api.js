import { createClient } from '@supabase/supabase-js';

// On récupère les variables d'environnement (configurées sur Netlify ou dans ton .env local)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://jbfxdxvdmcountguehde.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnhkeHZkbXRvdW50Z3VlaGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTg1NjEsImV4cCI6MjA5MDM5NDU2MX0.drMp5JfV4RSprVW8VUf9Jl7pOabcch49dtwb9WUme8o';

// On crée l'instance Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;