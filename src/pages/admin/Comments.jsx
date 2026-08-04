import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { commentsApi } from '../../hooks/useComments';
import { formatRelative } from '../../lib/utils';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import { useToast } from '../../components/ui/Toast';

// Modération transversale : tous les commentaires du site, filtrables.
export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | visible | hidden
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
      supabase.from('posts').select('id, slug, title'),
    ]);
    setComments(c || []);
    setPosts(Object.fromEntries((p || []).map((x) => [x.id, x])));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (fn, msg) => {
    const { error } = await fn();
    if (error) return toast(error.message, 'error');
    toast(msg, 'success');
    load();
  };

  const filtered = comments.filter((c) =>
    filter === 'all' ? true : filter === 'hidden' ? c.hidden : !c.hidden
  );

  return (
    <AdminShell title="Commentaires">
      <Seo title="Commentaires" noindex />

      <div className="mb-6 flex gap-2">
        {[
          { v: 'all', l: 'Tous' },
          { v: 'visible', l: 'Visibles' },
          { v: 'hidden', l: 'Masqués' },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              filter === f.v ? 'bg-ink text-paper' : 'bg-lilac-50 text-lilac-500 hover:bg-lilac-100'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun commentaire" />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const post = posts[c.post_id];
            return (
              <div
                key={c.id}
                className={`card p-4 ${c.hidden ? 'opacity-60 ring-1 ring-rose-200' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {c.author_name}
                      <span className="ml-2 text-xs font-normal text-ink-soft">
                        {formatRelative(c.created_at)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-ink/90">{c.body}</p>
                    {post && (
                      <Link
                        to={`/poeme/${post.slug}`}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs text-lilac-400 hover:text-lilac-500"
                      >
                        sur « {post.title} » <Icon name="arrow" size={12} />
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      onClick={() => act(() => commentsApi.togglePinned(c.id, !c.pinned), c.pinned ? 'Désépinglé.' : 'Épinglé.')}
                      className="btn-ghost !px-2 !py-1.5"
                      title={c.pinned ? 'Désépingler' : 'Épingler'}
                    >
                      <Icon name="pin" size={15} className={c.pinned ? 'text-lilac-400' : ''} />
                    </button>
                    <button
                      onClick={() => act(() => commentsApi.toggleHidden(c.id, !c.hidden), c.hidden ? 'Affiché.' : 'Masqué.')}
                      className="btn-ghost !px-2 !py-1.5"
                      title={c.hidden ? 'Afficher' : 'Masquer'}
                    >
                      <Icon name={c.hidden ? 'eye' : 'eye-off'} size={15} />
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer ce commentaire ?')) act(() => commentsApi.remove(c.id), 'Supprimé.'); }}
                      className="btn-ghost !px-2 !py-1.5 text-rose-400 hover:text-rose-500"
                      title="Supprimer"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
