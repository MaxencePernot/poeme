import Icon from '../ui/Icon';

// Carte d'un livre mis en avant. Bouton « Acheter » si un lien est fourni.
// Les livres épinglés (le vôtre) portent un liseré et un ruban.
export default function BookCard({ book }) {
  return (
    <article
      className={`card card-hover flex h-full flex-col overflow-hidden ${
        book.pinned ? 'ring-1 ring-lilac-200' : ''
      }`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-lilac-50">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={`Couverture de ${book.title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-lilac-300">
            <Icon name="book" size={40} />
          </span>
        )}
        {book.pinned && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-paper/90 px-2.5 py-1 text-xs text-lilac-500 backdrop-blur">
            <Icon name="pin" size={12} /> À l'honneur
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug text-ink">{book.title}</h3>
        {book.author && <p className="mt-0.5 text-sm text-ink-soft">{book.author}</p>}
        {book.summary && (
          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink-soft">
            {book.summary}
          </p>
        )}

        {book.buy_url && (
          <a
            href={book.buy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 w-full !py-2"
          >
            <Icon name="cart" size={16} /> Acheter
          </a>
        )}
      </div>
    </article>
  );
}
