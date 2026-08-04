import { Link } from 'react-router-dom';
import { useBooks, booksApi } from '../../hooks/useBooks';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import { useToast } from '../../components/ui/Toast';

export default function AdminBooks() {
  const { books, loading, refetch } = useBooks({ includeUnpublished: true });
  const toast = useToast();

  const remove = async (b) => {
    if (!confirm(`Supprimer le livre « ${b.title} » ?`)) return;
    const { error } = await booksApi.remove(b.id);
    if (error) return toast(error.message, 'error');
    toast('Livre supprimé.', 'success');
    refetch();
  };

  const togglePin = async (b) => {
    const { error } = await booksApi.update(b.id, { pinned: !b.pinned });
    if (error) return toast(error.message, 'error');
    toast(b.pinned ? 'Retiré de la une.' : 'Mis à l\'honneur.', 'success');
    refetch();
  };

  return (
    <AdminShell title="Livres publiés">
      <Seo title="Livres publiés" noindex />

      <div className="mb-6 flex justify-end">
        <Link to="/admin/livres/nouveau" className="btn-primary">
          <Icon name="plus" size={16} /> Nouveau livre
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : books.length === 0 ? (
        <EmptyState title="Aucun livre" hint="Ajoutez votre livre ou une recommandation." />
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <div key={b.id} className="card flex items-center gap-4 p-4">
              {b.cover_url ? (
                <img src={b.cover_url} alt="" className="h-16 w-12 flex-shrink-0 rounded object-cover" />
              ) : (
                <span className="grid h-16 w-12 flex-shrink-0 place-items-center rounded bg-lilac-50 text-lilac-300">
                  <Icon name="book" size={18} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink">{b.title}</p>
                  {b.pinned && <Icon name="pin" size={13} className="text-lilac-400" />}
                  {!b.published && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">Brouillon</span>
                  )}
                </div>
                <p className="text-xs text-ink-soft">{b.author}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => togglePin(b)} className="btn-ghost !px-2 !py-1.5" title={b.pinned ? 'Retirer de la une' : 'Mettre à l\'honneur'}>
                  <Icon name="pin" size={16} className={b.pinned ? 'text-lilac-400' : ''} />
                </button>
                <Link to={`/admin/livres/${b.id}`} className="btn-ghost !px-2 !py-1.5" title="Modifier">
                  <Icon name="edit" size={16} />
                </Link>
                <button onClick={() => remove(b)} className="btn-ghost !px-2 !py-1.5 text-rose-400 hover:text-rose-500" title="Supprimer">
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
