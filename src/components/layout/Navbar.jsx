import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/poemes', label: 'Mes poèmes' },
  { to: '/galerie', label: 'Galerie' },
  { to: '/livre-d-or', label: "Livre d'or" },
  { to: '/a-propos', label: 'À propos' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Fond de la barre plus opaque une fois la page défilée.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ferme le menu mobile à chaque changement de page.
  useEffect(() => setOpen(false), [location.pathname]);

  const navClass = ({ isActive }) =>
    `link-underline px-1 py-2 text-sm ${
      isActive ? 'text-lilac-500' : 'text-ink-soft'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-lilac-100 bg-paper/85 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        {/* Logotype */}
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-lilac-100 to-sage-100 text-lilac-500 transition-transform group-hover:rotate-6">
            <Icon name="feather" size={18} />
          </span>
          <span className="font-display text-lg italic tracking-tight text-ink">
            Encre&nbsp;&amp;&nbsp;Lumière
          </span>
        </Link>

        {/* Liens — bureau */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
              {l.label}
            </NavLink>
          ))}
          {/* Accès administrateur, très discret */}
          <Link
            to={isAdmin ? '/admin' : '/connexion'}
            title={isAdmin ? 'Tableau de bord' : 'Espace administrateur'}
            className="text-ink-soft/40 transition-colors hover:text-lilac-400"
          >
            <Icon name={isAdmin ? 'edit' : 'lock'} size={16} />
          </Link>
        </div>

        {/* Bouton menu — mobile */}
        <button
          type="button"
          className="btn-ghost md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </nav>

      {/* Menu déroulant — mobile */}
      {open && (
        <div className="animate-fade-up border-t border-lilac-100 bg-paper/95 px-5 py-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 ${
                    isActive ? 'bg-lilac-50 text-lilac-500' : 'text-ink-soft'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to={isAdmin ? '/admin' : '/connexion'}
              className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-soft"
            >
              <Icon name="lock" size={16} />
              {isAdmin ? 'Tableau de bord' : 'Espace administrateur'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
