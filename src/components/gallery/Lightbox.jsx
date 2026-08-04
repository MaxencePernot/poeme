import { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

// Visionneuse plein écran : agrandissement d'une photo, navigation ← →,
// fermeture par Échap ou clic sur le fond.
export default function Lightbox({ items, index, onClose, onNavigate }) {
  const item = items[index];

  const prev = useCallback(
    () => onNavigate((index - 1 + items.length) % items.length),
    [index, items.length, onNavigate]
  );
  const next = useCallback(
    () => onNavigate((index + 1) % items.length),
    [index, items.length, onNavigate]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title || 'Photographie'}
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-paper hover:bg-white/20"
        aria-label="Fermer"
      >
        <Icon name="close" />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-paper hover:bg-white/20"
            aria-label="Précédente"
          >
            <Icon name="arrow" className="rotate-180" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-paper hover:bg-white/20"
            aria-label="Suivante"
          >
            <Icon name="arrow" />
          </button>
        </>
      )}

      <figure
        className="max-h-[85vh] max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.image_url}
          alt={item.image_alt || item.title}
          className="mx-auto max-h-[75vh] rounded-lg object-contain shadow-lift"
        />
        <figcaption className="mt-4 text-center text-paper">
          <p className="font-display text-lg italic">{item.title}</p>
          {item.excerpt && (
            <p className="mt-1 text-sm text-paper/70">{item.excerpt}</p>
          )}
          <Link
            to={`/poeme/${item.slug}`}
            onClick={onClose}
            className="mt-3 inline-flex items-center gap-1 text-sm text-lilac-200 hover:text-paper"
          >
            Voir la publication <Icon name="arrow" size={14} />
          </Link>
        </figcaption>
      </figure>
    </div>
  );
}
