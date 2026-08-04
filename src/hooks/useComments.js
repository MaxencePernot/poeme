import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { looksLikeSpam } from '../lib/utils';

// Récupère et structure les commentaires d'une publication sous forme d'arbre
// (commentaires racines + réponses imbriquées).
export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: true });

    if (err) setError(err.message);
    else setComments(buildTree(data || []));
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, refetch: fetchComments };
}

// Construit l'arborescence parent → enfants.
function buildTree(flat) {
  const byId = new Map();
  flat.forEach((c) => byId.set(c.id, { ...c, replies: [] }));
  const roots = [];
  byId.forEach((c) => {
    if (c.parent_id && byId.has(c.parent_id)) {
      byId.get(c.parent_id).replies.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

// ── Actions ────────────────────────────────────────────────────────────
export const commentsApi = {
  // Ajout par un visiteur. Le champ « website » est un piège anti-robot
  // (honeypot) : rempli seulement par les bots, il fait échouer l'envoi.
  add: async ({ postId, parentId = null, authorName, body, honeypot = '' }) => {
    if (honeypot) return { error: { message: 'Envoi refusé.' } };
    if (!authorName?.trim() || !body?.trim())
      return { error: { message: 'Nom et message requis.' } };
    if (looksLikeSpam(body))
      return { error: { message: 'Votre message a été signalé comme indésirable.' } };

    return supabase
      .from('comments')
      .insert({
        post_id: postId,
        parent_id: parentId,
        author_name: authorName.trim().slice(0, 60),
        body: body.trim().slice(0, 2000),
      })
      .select()
      .single();
  },

  // Modération (admin uniquement — appliqué par les RLS).
  update: (id, payload) => supabase.from('comments').update(payload).eq('id', id),
  remove: (id) => supabase.from('comments').delete().eq('id', id),
  toggleHidden: (id, hidden) =>
    supabase.from('comments').update({ hidden }).eq('id', id),
  togglePinned: (id, pinned) =>
    supabase.from('comments').update({ pinned }).eq('id', id),
};
