import { useToast } from '../ui/Toast';
import Icon from '../ui/Icon';

// Partage d'une publication : réseaux + copie du lien.
export default function ShareButtons({ title, url }) {
  const toast = useToast();
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const text = encodeURIComponent(title || '');
  const enc = encodeURIComponent(shareUrl);

  const targets = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${enc}&text=${text}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${enc}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast('Lien copié dans le presse-papiers.', 'success');
    } catch {
      toast('Impossible de copier le lien.', 'error');
    }
  };

  // Utilise l'API de partage native du système quand elle existe (mobile).
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        /* partage annulé */
      }
    } else {
      copy();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-ink-soft">Partager</span>
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline !px-3 !py-1.5 text-xs"
        >
          {t.label}
        </a>
      ))}
      <button type="button" onClick={nativeShare} className="btn-ghost !px-3 !py-1.5">
        <Icon name="share" size={16} />
      </button>
    </div>
  );
}
