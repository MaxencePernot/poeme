import { createClient } from '@supabase/supabase-js';

// Les clés sont lues depuis les variables d'environnement Vite (préfixe VITE_).
// La clé « anon » est publique par conception : la sécurité réelle est
// assurée par les règles Row Level Security définies dans supabase/schema.sql.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'media';

// Indique si l'application est correctement configurée. Permet d'afficher un
// message d'aide plutôt qu'un écran blanc quand le fichier .env est absent.
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('votre-projet')
);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Rachel entre lignes] Supabase n\'est pas configuré. ' +
      'Copiez .env.example en .env et renseignez vos clés.'
  );
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
