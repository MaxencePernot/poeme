import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import BookForm from '../../components/admin/BookForm';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function BookEdit() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('books').select('*').eq('id', id).maybeSingle()
      .then(({ data }) => { setBook(data); setLoading(false); });
  }, [id]);

  return (
    <AdminShell title="Modifier le livre">
      <Seo title="Modifier le livre" noindex />
      {loading ? <Spinner /> : !book ? <EmptyState title="Livre introuvable" /> : <BookForm initial={book} />}
    </AdminShell>
  );
}
