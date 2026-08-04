import { useMemo } from 'react';
import { sanitizeHtml } from '../../lib/sanitize';

// Affiche le HTML riche d'un poème après assainissement (protection XSS).
export default function PoemContent({ html, className = '' }) {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  return (
    <div
      className={`poem-prose ${className}`}
      // Sûr : le contenu est passé par DOMPurify juste au-dessus.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
