import { useState } from 'react';
import Icon from './Icon';

// Note en étoiles sur 5.
// - Lecture seule par défaut (affichage d'une fiche).
// - Interactif si l'on passe onChange (formulaire d'administration).
export default function StarRating({ value = 0, onChange = null, size = 20 }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  const shown = hover || value;

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : 'img'} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= shown;
        const star = (
          <Icon
            name="star"
            size={size}
            filled={active}
            className={active ? 'text-amber-400' : 'text-lilac-200'}
          />
        );
        return interactive ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}
