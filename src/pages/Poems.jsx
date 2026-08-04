import { useState } from 'react';
import { usePosts, useAllTags } from '../hooks/usePosts';
import Seo from '../components/ui/Seo';
import PageHeader from '../components/ui/PageHeader';
import Reveal from '../components/ui/Reveal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import PoemCard from '../components/poems/PoemCard';
import Icon from '../components/ui/Icon';

const PAGE_SIZE = 9;

export default function Poems() {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [page, setPage] = useState(0);

  const tags = useAllTags();
  const { posts, total, loading } = usePosts({
    search,
    tag: activeTag,
    page,
    pageSize: PAGE_SIZE,
  });

  // Réinitialise la pagination quand un filtre change.
  const onSearch = (v) => { setSearch(v); setPage(0); };
  const onTag = (t) => { setActiveTag(t); setPage(0); };

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Seo
        title="Mes poèmes"
        path="/poemes"
        description="L'ensemble de mes poèmes, à parcourir, filtrer et savourer."
      />

      <PageHeader
        eyebrow="Le recueil"
        title="Mes poèmes"
        subtitle="Cherchez un mot, suivez un thème, ou laissez-vous porter."
      />

      {/* Barre de recherche + filtres */}
      <div className="mx-auto mt-10 max-w-2xl">
        <div className="relative">
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher un poème…"
            className="field pl-11"
            aria-label="Rechercher un poème"
          />
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onTag(null)}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                !activeTag ? 'bg-ink text-paper' : 'bg-lilac-50 text-lilac-500 hover:bg-lilac-100'
              }`}
            >
              Tous
            </button>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => onTag(t)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  activeTag === t ? 'bg-ink text-paper' : 'bg-lilac-50 text-lilac-500 hover:bg-lilac-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="mt-12">
        {loading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <EmptyState
            title="Aucun poème trouvé"
            hint="Essayez un autre mot-clé ou retirez les filtres."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 90}>
                  <PoemCard post={p} />
                </Reveal>
              ))}
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
