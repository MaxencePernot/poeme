import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ── Liste des publications avec filtres, recherche, pagination ──────────
export function usePosts({
  kind = null, // 'poem' | 'photo' | 'both' | null (tous)
  tag = null,
  search = '',
  page = 0,
  pageSize = 9,
  includeUnpublished = false,
} = {}) {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('posts')
      .select('*, post_likes(count)', { count: 'exact' })
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!includeUnpublished) query = query.eq('published', true);
    if (kind) query = query.eq('kind', kind);
    if (tag) query = query.contains('tags', [tag]);
    if (search?.trim()) {
      const s = `%${search.trim()}%`;
      query = query.or(`title.ilike.${s},excerpt.ilike.${s}`);
    }

    const from = page * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, error: err, count } = await query;
    if (err) setError(err.message);
    else {
      // Remplace le compteur dénormalisé par le vrai total issu de la relation.
      const rows = (data || []).map((p) => ({
        ...p,
        likes_count: p.post_likes?.[0]?.count ?? p.likes_count ?? 0,
      }));
      setPosts(rows);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [kind, tag, search, page, pageSize, includeUnpublished]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, total, loading, error, refetch: fetchPosts };
}

// ── Une seule publication par slug ─────────────────────────────────────
export function usePost(slug) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!slug) return;
    setLoading(true);

    supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError(err.message);
        else setPost(data);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return { post, loading, error };
}

// ── Opérations d'écriture réservées à l'administrateur ─────────────────
// (Les RLS refusent ces requêtes si l'utilisateur n'est pas connecté.)
export const postsApi = {
  create: (payload) => supabase.from('posts').insert(payload).select().single(),
  update: (id, payload) =>
    supabase.from('posts').update(payload).eq('id', id).select().single(),
  remove: (id) => supabase.from('posts').delete().eq('id', id),
};

// ── Tous les tags distincts (pour les filtres) ─────────────────────────
export function useAllTags() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    supabase
      .from('posts')
      .select('tags')
      .eq('published', true)
      .then(({ data }) => {
        const set = new Set();
        (data || []).forEach((row) => (row.tags || []).forEach((t) => set.add(t)));
        setTags([...set].sort((a, b) => a.localeCompare(b, 'fr')));
      });
  }, []);

  return tags;
}
