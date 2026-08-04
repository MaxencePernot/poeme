import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import PostForm from '../../components/admin/PostForm';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

// Charge la publication par son id puis affiche le formulaire pré-rempli.
export default function PostEdit() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <AdminShell title="Modifier la publication">
      <Seo title="Modifier" noindex />
      {loading ? (
        <Spinner />
      ) : !post ? (
        <EmptyState title="Publication introuvable" />
      ) : (
        <PostForm initial={post} />
      )}
    </AdminShell>
  );
}
