import { useState } from 'react';
import Icon from './Icon';

// Bouton « J'aime » : cœur qui se remplit + petite animation au clic.
export default function LikeButton({ liked, count, onToggle, size = 20, label = true }) {
  const [burst, setBurst] = useState(false);

  const handle = () => {
    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }
    onToggle?.();
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={liked}
      aria-label={liked ? "Je n'aime plus" : "J'aime"}
      className={`group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
        liked ? 'text-lilac-500' : 'text-ink-soft hover:text-lilac-400'
      }`}
    >
      <Icon
        name="heart"
        size={size}
        filled={liked}
        className={burst ? 'animate-pop' : 'transition-transform group-hover:scale-110'}
      />
      {label && <span className="tabular-nums">{count}</span>}
    </button>
  );
}
