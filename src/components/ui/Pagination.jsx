import Icon from './Icon';

export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        className="btn-outline !px-3"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        aria-label="Page précédente"
      >
        <Icon name="arrow" className="rotate-180" size={16} />
      </button>

      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          aria-current={i === page ? 'page' : undefined}
          className={`h-9 w-9 rounded-full text-sm transition-colors ${
            i === page
              ? 'bg-ink text-paper'
              : 'text-ink-soft hover:bg-lilac-50 hover:text-ink'
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="btn-outline !px-3"
        disabled={page >= pages - 1}
        onClick={() => onChange(page + 1)}
        aria-label="Page suivante"
      >
        <Icon name="arrow" size={16} />
      </button>
    </nav>
  );
}
