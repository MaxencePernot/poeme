import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Liste des lectures. includeUnpublished=true réservé à l'administration.
export function useReadings({ includeUnpublished = false } = {}) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('readings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!includeUnpublished) query = query.eq('published', true);
    const { data } = await query;
    setReadings(data || []);
    setLoading(false);
  }, [includeUnpublished]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  return { readings, loading, refetch: fetchReadings };
}

// Écritures réservées à l'admin (les RLS refusent sinon).
export const readingsApi = {
  create: (payload) => supabase.from('readings').insert(payload).select().single(),
  update: (id, payload) =>
    supabase.from('readings').update(payload).eq('id', id).select().single(),
  remove: (id) => supabase.from('readings').delete().eq('id', id),
};
