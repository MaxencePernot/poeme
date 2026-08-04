import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Validation minimale d'une adresse e-mail.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const newsletterApi = {
  // Inscription publique : on n'enregistre que l'e-mail.
  subscribe: async (email) => {
    const clean = (email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(clean))
      return { error: { message: 'Adresse e-mail invalide.' } };
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: clean });
    // Déjà inscrit : on considère que c'est un succès silencieux.
    if (error && error.code === '23505') return { error: null, already: true };
    return { error };
  },
  remove: (id) => supabase.from('newsletter_subscribers').delete().eq('id', id),
};

// Liste des abonnés — réservée à l'administration (RLS).
export function useSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    setSubscribers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  return { subscribers, loading, refetch: fetchSubscribers };
}
