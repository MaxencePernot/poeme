import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Lit et met à jour une entrée clé/valeur de la table site_content
// (par ex. « about » ou « home »). L'écriture est réservée à l'admin (RLS).
export function useSiteContent(key) {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchValue = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    setValue(data?.value ?? null);
    setLoading(false);
  }, [key]);

  useEffect(() => {
    fetchValue();
  }, [fetchValue]);

  const save = useCallback(
    (newValue) =>
      supabase
        .from('site_content')
        .upsert({ key, value: newValue, updated_at: new Date().toISOString() }),
    [key]
  );

  return { value, loading, save, refetch: fetchValue };
}
