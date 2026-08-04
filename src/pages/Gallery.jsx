import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import Seo from '../components/ui/Seo';
import PageHeader from '../components/ui/PageHeader';
import Reveal from '../components/ui/Reveal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Lightbox from '../components/gallery/Lightbox';
import Icon from '../components/ui/Icon';

// Récupère toutes les publications comportant une image.
function useGalleryItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, slug, title, excerpt, image_url, image_alt, likes_count, created_at')
      .eq('published', true)
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  return { items, loading };
}

export default function Gallery() {
  const { items, loading } = useGalleryItems();
  const [openIndex, setOpenIndex] = useState(null);

  // Répartition en colonnes pour un effet « maçonnerie » léger.
  const columns = useMemo(() => {
    const cols = [[], [], []];
    items.forEach((item, i) => cols[i % 3].push(item));
    return cols;
  }, [items]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Seo
        title="Galerie"
        path="/galerie"
        description="Une collection de photographies, à agrandir et à contempler."
      />

      <PageHeader
        eyebrow="Instantanés"
        title="Galerie"
        subtitle="Cliquez sur une image pour l'agrandir."
      />

      <div className="mt-12">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="La galerie est encore vide"
            hint="Les prochaines photographies apparaîtront ici."
            icon="◍"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-4">
                {col.map((item) => {
                  const globalIndex = items.findIndex((x) => x.id === item.id);
                  return (
                    <Reveal key={item.id} delay={(globalIndex % 6) * 70}>
                      <button
                        onClick={() => setOpenIndex(globalIndex)}
                        className="group relative block w-full overflow-hidden rounded-2xl shadow-soft"
                        aria-label={`Agrandir : ${item.title}`}
                      >
                        <img
                          src={item.image_url}
                          alt={item.image_alt || item.title}
                          loading="lazy"
                          className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="p-4 text-left text-paper">
                            <p className="font-display text-lg italic">{item.title}</p>
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-paper/80">
                              <Icon name="heart" size={13} /> {item.likes_count}
                            </span>
                          </div>
                        </div>
                      </button>
                    </Reveal>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </div>
  );
}
