import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbfxdxvdmcountguehde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnhkeHZkbXRvdW50Z3VlaGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTg1NjEsImV4cCI6MjA5MDM5NDU2MX0.drMp5JfV4RSprVW8VUf9Jl7pOabcch49dtwb9WUme8o';

// On exporte l'instance pour l'utiliser partout dans tes composants
export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;