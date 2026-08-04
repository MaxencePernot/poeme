import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Liste des livres publiés. Les épinglés remontent en tête (votre livre).
export function useBooks({ includeUnpublished = false } = {}) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('books')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (!includeUnpublished) query = query.eq('published', true);
    const { data } = await query;
    setBooks(data || []);
    setLoading(false);
  }, [includeUnpublished]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, loading, refetch: fetchBooks };
}

export const booksApi = {
  create: (payload) => supabase.from('books').insert(payload).select().single(),
  update: (id, payload) =>
    supabase.from('books').update(payload).eq('id', id).select().single(),
  remove: (id) => supabase.from('books').delete().eq('id', id),
};
