import { useState } from 'react';
import Icon from '../ui/Icon';
import StarRating from '../ui/StarRating';

// Fiche de lecture : couverture, titre, auteur, note, description, avis,
// et citations dépliables.
export default function ReadingCard({ reading }) {
  const [open, setOpen] = useState(false);
  const quotes = reading.quotes || [];

  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="flex gap-4 p-5">
        {reading.cover_url ? (
          <img
            src={reading.cover_url}
            alt={`Couverture de ${reading.title}`}
            loading="lazy"
            className="h-36 w-24 flex-shrink-0 rounded-lg object-cover shadow-soft"
          />
        ) : (
          <span className="grid h-36 w-24 flex-shrink-0 place-items-center rounded-lg bg-lilac-50 text-lilac-300">
            <Icon name="book" size={28} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-snug text-ink">{reading.title}</h3>
          {reading.author && (
            <p className="mt-0.5 text-sm text-ink-soft">{reading.author}</p>
          )}
          <div className="mt-2">
            <StarRating value={reading.rating} size={16} />
          </div>
          {reading.description && (
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink-soft">
              {reading.description}
            </p>
          )}
        </div>
      </div>

      {(reading.review || quotes.length > 0) && (
        <div className="mt-auto border-t border-lilac-50 px-5 py-4">
          {reading.review && (
            <div>
              <p className="eyebrow mb-1">Mon avis</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/90">
                {reading.review}
              </p>
            </div>
          )}

          {quotes.length > 0 && (
            <div className={reading.review ? 'mt-3' : ''}>
              <button
                onClick={() => setOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 text-sm text-lilac-500 hover:text-lilac-600"
              >
                ❝ {quotes.length} citation{quotes.length > 1 ? 's' : ''}
                <Icon name="arrow" size={14} className={open ? '-rotate-90' : 'rotate-90'} />
              </button>
              {open && (
                <ul className="mt-2 space-y-2">
                  {quotes.map((q, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-lilac-300 pl-3 font-reader text-sm italic text-ink-soft"
                    >
                      « {q} »
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
