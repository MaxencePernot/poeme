import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePosts, postsApi } from '../../hooks/usePosts';
import { formatDate } from '../../lib/utils';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Icon from '../../components/ui/Icon';
import { useToast } from '../../components/ui/Toast';

const PAGE_SIZE = 12;

// Liste administrable de toutes les publications (y compris non publiées).
export default function AdminPosts() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const { posts, total, loading, refetch } = usePosts({
    page,
    pageSize: PAGE_SIZE,
    search,
    includeUnpublished: true,
  });

  const remove = async (post) => {
    if (!confirm(`Supprimer définitivement « ${post.title} » ?`)) return;
    const { error } = await postsApi.remove(post.id);
    if (error) return toast(error.message, 'error');
    toast('Publication supprimée.', 'success');
    refetch();
  };

  const togglePublish = async (post) => {
    const { error } = await postsApi.update(post.id, { published: !post.published });
    if (error) return toast(error.message, 'error');
    toast(post.published ? 'Passée en brouillon.' : 'Publiée.', 'success');
    refetch();
  };

  return (
    <AdminShell title="Publications">
      <Seo title="Publications" noindex />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input
            className="field pl-11"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <Link to="/admin/publications/nouvelle" className="btn-primary">
          <Icon name="plus" size={16} /> Nouvelle
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <EmptyState title="Aucune publication" hint="Créez votre première publication." />
      ) : (
        <>
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="card flex items-center gap-4 p-4">
                {post.image_url ? (
                  <img src={post.image_url} alt="" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-lg bg-lilac-50 text-lilac-300">
                    <Icon name="feather" size={20} />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">{post.title}</p>
                    {post.pinned && <Icon name="pin" size={13} className="text-lilac-400" />}
                    {!post.published && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                        Brouillon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-soft">
                    {formatDate(post.created_at)} · {post.likes_count} j'aime
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Link to={`/poeme/${post.slug}`} className="btn-ghost !px-2 !py-1.5" title="Voir">
                    <Icon name="eye" size={16} />
                  </Link>
                  <button onClick={() => togglePublish(post)} className="btn-ghost !px-2 !py-1.5" title={post.published ? 'Dépublier' : 'Publier'}>
                    <Icon name={post.published ? 'eye-off' : 'check'} size={16} />
                  </button>
                  <Link to={`/admin/publications/${post.id}`} className="btn-ghost !px-2 !py-1.5" title="Modifier">
                    <Icon name="edit" size={16} />
                  </Link>
                  <button onClick={() => remove(post)} className="btn-ghost !px-2 !py-1.5 text-rose-400 hover:text-rose-500" title="Supprimer">
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
        </>
      )}
    </AdminShell>
  );
}
