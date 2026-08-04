// ── Formatage de date en français ──────────────────────────────
export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function formatRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return formatDate(iso);
}

// ── Génère un slug propre à partir d'un titre ──────────────────
export function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

// ── Extrait de texte à partir d'un contenu HTML ────────────────
export function htmlToExcerpt(html, max = 160) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  const text = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// ── Détection basique de spam (côté client, complément aux RLS) ─
const SPAM_PATTERNS = [
  /\b(?:viagra|casino|loan|crypto\s?pump|porn)\b/i,
  /https?:\/\/\S+.*https?:\/\/\S+/i, // deux liens ou plus
];

export function looksLikeSpam(text) {
  if (!text) return false;
  if (text.length > 3000) return true;
  return SPAM_PATTERNS.some((re) => re.test(text));
}
