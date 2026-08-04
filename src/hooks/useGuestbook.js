import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { looksLikeSpam } from '../lib/utils';

export function useGuestbook() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, refetch: fetchEntries };
}

export const guestbookApi = {
  add: async ({ authorName, body, honeypot = '' }) => {
    if (honeypot) return { error: { message: 'Envoi refusé.' } };
    if (!authorName?.trim() || !body?.trim())
      return { error: { message: 'Nom et message requis.' } };
    if (looksLikeSpam(body))
      return { error: { message: 'Message signalé comme indésirable.' } };
    return supabase.from('guestbook').insert({
      author_name: authorName.trim().slice(0, 60),
      body: body.trim().slice(0, 3000),
    });
  },
  update: (id, payload) => supabase.from('guestbook').update(payload).eq('id', id),
  remove: (id) => supabase.from('guestbook').delete().eq('id', id),
  toggleHidden: (id, hidden) =>
    supabase.from('guestbook').update({ hidden }).eq('id', id),
};
