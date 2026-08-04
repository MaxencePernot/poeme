import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getVisitorId } from '../lib/visitor';

// Gère l'état « aimé / non aimé » d'une publication pour le visiteur courant,
// ainsi que le compteur affiché. Bascule optimiste pour une animation fluide.
export function usePostLike(post) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post?.likes_count ?? 0);
  const [pending, setPending] = useState(false);
  const visitorId = getVisitorId();

  useEffect(() => {
    setCount(post?.likes_count ?? 0);
  }, [post?.likes_count]);

  useEffect(() => {
    let active = true;
    if (!post?.id) return;
    supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', post.id)
      .eq('visitor_id', visitorId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setLiked(Boolean(data));
      });
    return () => {
      active = false;
    };
  }, [post?.id, visitorId]);

  const toggle = useCallback(async () => {
    if (!post?.id || pending) return;
    setPending(true);

    // Mise à jour optimiste de l'interface.
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));

    const op = next
      ? supabase.from('post_likes').insert({ post_id: post.id, visitor_id: visitorId })
      : supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('visitor_id', visitorId);

    const { error } = await op;
    if (error) {
      // Annulation en cas d'échec.
      setLiked(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
    }
    setPending(false);
  }, [post?.id, liked, pending, visitorId]);

  return { liked, count, toggle, pending };
}

// Version pour les commentaires.
export function useCommentLike(comment) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(comment?.likes_count ?? 0);
  const visitorId = getVisitorId();

  useEffect(() => {
    let active = true;
    if (!comment?.id) return;
    supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('comment_id', comment.id)
      .eq('visitor_id', visitorId)
      .maybeSingle()
      .then(({ data }) => active && setLiked(Boolean(data)));
    return () => {
      active = false;
    };
  }, [comment?.id, visitorId]);

  const toggle = useCallback(async () => {
    if (!comment?.id) return;
    const next = !liked;
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));

    const op = next
      ? supabase
          .from('comment_likes')
          .insert({ comment_id: comment.id, visitor_id: visitorId })
      : supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('visitor_id', visitorId);

    const { error } = await op;
    if (error) {
      setLiked(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
    }
  }, [comment?.id, liked, visitorId]);

  return { liked, count, toggle };
}
