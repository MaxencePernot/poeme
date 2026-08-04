import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useSiteContent } from '../hooks/useSiteContent';
import { supabase } from '../lib/supabase';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import Spinner from '../components/ui/Spinner';
import PoemCard from '../components/poems/PoemCard';
import Icon from '../components/ui/Icon';

// ── Bannière ────────────────────────────────────────────────────────────
function Hero({ quote }) {
  return (
    <section className="relative overflow-hidden">
      {/* Voile pastel qui dérive lentement en fond (respecte reduced-motion). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-lilac-200/50 to-sage-200/40 blur-3xl animate-drift-slow"
      />
      <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <Reveal as="p" className="eyebrow mb-5">Poésie & Photographies</Reveal>
        <Reveal
          as="h1"
          delay={100}
          className="font-display text-5xl leading-[1.05] text-ink sm:text-6xl"
        >
          Des mots à lire{' '}
          <em className="text-lilac-500">lentement</em>,<br />
          une lumière qui s'attarde.
        </Reveal>
        <Reveal as="p" delay={220} className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
          Bienvenue dans mon carnet. J'y dépose des poèmes, des images, et le
          silence entre les deux. Prenez le temps.
        </Reveal>

        {quote?.quote && (
          <Reveal delay={320} className="mx-auto mt-10 max-w-md">
            <blockquote className="border-t border-lilac-100 pt-6 font-reader text-xl italic text-ink/80">
              « {quote.quote} »
              {quote.author && quote.author !== '—' && (
                <footer className="mt-2 text-sm not-italic text-ink-soft">
                  {quote.author}
                </footer>
              )}
            </blockquote>
          </Reveal>
        )}

        <Reveal delay={420} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/poemes" className="btn-primary">
            Lire les poèmes <Icon name="arrow" size={16} />
          </Link>
          <Link to="/galerie" className="btn-outline">Parcourir la galerie</Link>
        </Reveal>
      </div>
    </section>
  );
}

// ── Statistiques ────────────────────────────────────────────────────────
function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Récupère quelques compteurs pour donner vie à la page.
    Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
      supabase.from('comments').select('id', { count: 'exact', head: true }).eq('hidden', false),
      supabase.from('post_likes').select('post_id', { count: 'exact', head: true }),
    ]).then(([p, c, l]) => {
      setStats({ poems: p.count || 0, comments: c.count || 0, likes: l.count || 0 });
    });
  }, []);

  const items = [
    { label: 'Publications', value: stats?.poems, icon: 'feather' },
    { label: "Mots d'amis", value: stats?.comments, icon: 'reply' },
    { label: "J'aime", value: stats?.likes, icon: 'heart' },
  ];

  return (
    <section className="mx-auto max-w-4xl px-5 py-6">
      <div className="grid grid-cols-3 gap-4">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 90} className="card p-6 text-center">
            <Icon name={it.icon} size={22} className="mx-auto text-lilac-400" />
            <p className="mt-3 font-display text-3xl text-ink tabular-nums">
              {it.value ?? '—'}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">{it.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Section « derniers contenus » ──────────────────────────────────────
function LatestPoems() {
  const { posts, loading } = usePosts({ pageSize: 3 });
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">Fraîchement écrit</p>
          <h2 className="font-display text-3xl text-ink">Derniers poèmes</h2>
        </div>
        <Link to="/poemes" className="link-underline hidden text-sm text-ink-soft sm:inline-flex sm:items-center sm:gap-1">
          Tout voir <Icon name="arrow" size={15} />
        </Link>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <PoemCard post={p} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function LatestPhotos() {
  const { posts, loading } = usePosts({ kind: 'photo', pageSize: 4 });
  const withImages = posts.filter((p) => p.image_url);
  if (!loading && withImages.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">Instantanés</p>
          <h2 className="font-display text-3xl text-ink">Dernières photos</h2>
        </div>
        <Link to="/galerie" className="link-underline hidden text-sm text-ink-soft sm:inline-flex sm:items-center sm:gap-1">
          La galerie <Icon name="arrow" size={15} />
        </Link>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {withImages.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <Link to={`/poeme/${p.slug}`} className="group block overflow-hidden rounded-2xl">
                <img
                  src={p.image_url}
                  alt={p.image_alt || p.title}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const { value: home } = useSiteContent('home');

  return (
    <>
      <Seo title="" path="/" />
      <Hero quote={home} />
      <Stats />
      <LatestPoems />
      <LatestPhotos />
    </>
  );
}
