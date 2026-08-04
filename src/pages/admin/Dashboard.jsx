import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatRelative } from '../../lib/utils';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import Icon from '../../components/ui/Icon';
import Spinner from '../../components/ui/Spinner';

// Tableau de bord : chiffres clés + derniers commentaires reçus.
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', false),
      supabase.from('comments').select('id', { count: 'exact', head: true }),
      supabase.from('guestbook').select('id', { count: 'exact', head: true }),
      supabase.from('post_likes').select('post_id', { count: 'exact', head: true }),
      supabase.from('readings').select('id', { count: 'exact', head: true }),
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      supabase
        .from('comments')
        .select('id, author_name, body, created_at, hidden, post_id')
        .order('created_at', { ascending: false })
        .limit(6),
    ]).then(([posts, drafts, comments, guestbook, likes, readings, books, subs, latest]) => {
      setStats({
        posts: posts.count || 0,
        drafts: drafts.count || 0,
        comments: comments.count || 0,
        guestbook: guestbook.count || 0,
        likes: likes.count || 0,
        readings: readings.count || 0,
        books: books.count || 0,
        subscribers: subs.count || 0,
      });
      setRecent(latest.data || []);
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Publications', value: stats?.posts, icon: 'feather', to: '/admin/publications' },
    { label: 'Brouillons', value: stats?.drafts, icon: 'edit', to: '/admin/publications' },
    { label: 'Lectures', value: stats?.readings, icon: 'book', to: '/admin/lectures' },
    { label: 'Livres', value: stats?.books, icon: 'cart', to: '/admin/livres' },
    { label: 'Commentaires', value: stats?.comments, icon: 'reply', to: '/admin/commentaires' },
    { label: 'Les Plumes', value: stats?.guestbook, icon: 'image', to: '/les-plumes-invitees' },
    { label: 'Abonnés', value: stats?.subscribers, icon: 'mail', to: '/admin/abonnes' },
    { label: "J'aime", value: stats?.likes, icon: 'heart', to: '/admin/publications' },
  ];

  return (
    <AdminShell title="Tableau de bord">
      <Seo title="Tableau de bord" noindex />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cards.map((c) => (
              <Link key={c.label} to={c.to} className="card card-hover p-5">
                <Icon name={c.icon} size={20} className="text-lilac-400" />
                <p className="mt-3 font-display text-2xl text-ink tabular-nums">{c.value}</p>
                <p className="text-xs text-ink-soft">{c.label}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/admin/publications/nouvelle" className="btn-primary">
              <Icon name="plus" size={16} /> Écrire une publication
            </Link>
            <Link to="/admin/commentaires" className="btn-outline">
              Modérer les commentaires
            </Link>
          </div>

          <section className="mt-10">
            <h2 className="mb-4 font-display text-xl text-ink">Derniers commentaires</h2>
            {recent.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucun commentaire pour l'instant.</p>
            ) : (
              <div className="space-y-2">
                {recent.map((c) => (
                  <div key={c.id} className="card flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {c.author_name}
                        {c.hidden && (
                          <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-500">
                            masqué
                          </span>
                        )}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{c.body}</p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-ink-soft">
                      {formatRelative(c.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
