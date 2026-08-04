import { Link } from 'react-router-dom';
import { useReadings, readingsApi } from '../../hooks/useReadings';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import StarRating from '../../components/ui/StarRating';
import { useToast } from '../../components/ui/Toast';

export default function AdminReadings() {
  const { readings, loading, refetch } = useReadings({ includeUnpublished: true });
  const toast = useToast();

  const remove = async (r) => {
    if (!confirm(`Supprimer la lecture « ${r.title} » ?`)) return;
    const { error } = await readingsApi.remove(r.id);
    if (error) return toast(error.message, 'error');
    toast('Lecture supprimée.', 'success');
    refetch();
  };

  return (
    <AdminShell title="Lectures">
      <Seo title="Lectures" noindex />

      <div className="mb-6 flex justify-end">
        <Link to="/admin/lectures/nouvelle" className="btn-primary">
          <Icon name="plus" size={16} /> Nouvelle lecture
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : readings.length === 0 ? (
        <EmptyState title="Aucune lecture" hint="Ajoutez votre première recommandation." />
      ) : (
        <div className="space-y-2">
          {readings.map((r) => (
            <div key={r.id} className="card flex items-center gap-4 p-4">
              {r.cover_url ? (
                <img src={r.cover_url} alt="" className="h-16 w-12 flex-shrink-0 rounded object-cover" />
              ) : (
                <span className="grid h-16 w-12 flex-shrink-0 place-items-center rounded bg-lilac-50 text-lilac-300">
                  <Icon name="book" size={18} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink">{r.title}</p>
                  {!r.published && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">Brouillon</span>
                  )}
                </div>
                <p className="text-xs text-ink-soft">{r.author}</p>
                <div className="mt-1"><StarRating value={r.rating} size={13} /></div>
              </div>
              <div className="flex items-center gap-1">
                <Link to={`/admin/lectures/${r.id}`} className="btn-ghost !px-2 !py-1.5" title="Modifier">
                  <Icon name="edit" size={16} />
                </Link>
                <button onClick={() => remove(r)} className="btn-ghost !px-2 !py-1.5 text-rose-400 hover:text-rose-500" title="Supprimer">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
