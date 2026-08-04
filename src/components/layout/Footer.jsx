import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import NewsletterSignup from '../newsletter/NewsletterSignup';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-lilac-100 bg-white/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-ink">
            <Icon name="feather" size={18} className="text-lilac-400" />
            <span className="font-display text-lg italic">Rachel entre lignes</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            Un carnet de poèmes, de lectures et de photographies. Lisez lentement,
            respirez, laissez un mot si le cœur vous en dit.
          </p>
        </div>

        <nav className="text-sm">
          <p className="eyebrow mb-3">Explorer</p>
          <ul className="space-y-2 text-ink-soft">
            <li><Link className="link-underline" to="/poemes">Mes poèmes</Link></li>
            <li><Link className="link-underline" to="/galerie">Galerie</Link></li>
            <li><Link className="link-underline" to="/lectures">Mes lectures</Link></li>
            <li><Link className="link-underline" to="/livres">Livres publiés</Link></li>
            <li><Link className="link-underline" to="/les-plumes-invitees">Les Plumes Invitées</Link></li>
            <li><Link className="link-underline" to="/a-propos">À propos</Link></li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="eyebrow mb-3">Restons en lien</p>
          <p className="mb-3 text-ink-soft">
            Recevez de temps à autre des nouvelles, de nouveaux poèmes et lectures.
          </p>
          <NewsletterSignup />
        </div>
      </div>

      <div className="border-t border-lilac-100 py-5 text-center text-xs text-ink-soft/70">
        © {year} Rachel entre lignes — Tous droits réservés.
      </div>
    </footer>
  );
}
