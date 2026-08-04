import DOMPurify from 'dompurify';

// Assainit le HTML riche des poèmes avant affichage : protège contre les
// injections XSS tout en autorisant la mise en forme produite par l'éditeur.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
  'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li',
  'a', 'img', 'span', 'mark', 'hr', 'code', 'pre',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'title',
  'style', 'class', 'data-text-align',
];

export function sanitizeHtml(dirty) {
  if (!dirty) return '';
  // DOMPurify bloque déjà par défaut les URI dangereuses (javascript:, etc.).
  // On se contente de restreindre les balises et attributs autorisés.
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR });
}

// Ajoute automatiquement rel="noopener" aux liens externes après nettoyage.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});
