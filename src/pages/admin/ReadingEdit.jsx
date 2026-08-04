import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import ReadingForm from '../../components/admin/ReadingForm';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ReadingEdit() {
  const { id } = useParams();
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('readings').select('*').eq('id', id).maybeSingle()
      .then(({ data }) => { setReading(data); setLoading(false); });
  }, [id]);

  return (
    <AdminShell title="Modifier la lecture">
      <Seo title="Modifier la lecture" noindex />
      {loading ? <Spinner /> : !reading ? <EmptyState title="Lecture introuvable" /> : <ReadingForm initial={reading} />}
    </AdminShell>
  );
}
