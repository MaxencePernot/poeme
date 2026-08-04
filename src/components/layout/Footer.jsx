import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-lilac-100 bg-white/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-ink">
            <Icon name="feather" size={18} className="text-lilac-400" />
            <span className="font-display text-lg italic">Encre & Lumière</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            Un carnet de poèmes et de photographies. Lisez lentement,
            respirez, laissez un mot si le cœur vous en dit.
          </p>
        </div>

        <nav className="text-sm">
          <p className="eyebrow mb-3">Explorer</p>
          <ul className="space-y-2 text-ink-soft">
            <li><Link className="link-underline" to="/poemes">Mes poèmes</Link></li>
            <li><Link className="link-underline" to="/galerie">Galerie</Link></li>
            <li><Link className="link-underline" to="/livre-d-or">Livre d'or</Link></li>
            <li><Link className="link-underline" to="/a-propos">À propos</Link></li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="eyebrow mb-3">Un mot doux</p>
          <p className="text-ink-soft">
            « Écrire, c'est une façon de parler sans être interrompu. »
          </p>
        </div>
      </div>

      <div className="border-t border-lilac-100 py-5 text-center text-xs text-ink-soft/70">
        © {year} Encre & Lumière — Tous droits réservés.
      </div>
    </footer>
  );
}
