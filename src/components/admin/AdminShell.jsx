import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

const nav = [
  { to: '/admin', label: 'Tableau de bord', icon: 'feather', end: true },
  { to: '/admin/publications', label: 'Publications', icon: 'edit' },
  { to: '/admin/publications/nouvelle', label: 'Nouvelle publication', icon: 'plus' },
  { to: '/admin/commentaires', label: 'Commentaires', icon: 'reply' },
  { to: '/livre-d-or', label: "Livre d'or", icon: 'image' },
  { to: '/a-propos', label: 'Page À propos', icon: 'tag' },
];

// Cadre commun à toutes les pages d'administration : barre latérale de
// navigation + zone de contenu. Responsive (barre en haut sur mobile).
export default function AdminShell({ title, children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[240px_1fr]">
      {/* Navigation */}
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-lilac-100 to-sage-100 text-lilac-500">
            <Icon name="feather" size={18} />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">Administration</p>
            <p className="truncate text-xs text-ink-soft">{user?.email}</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-lilac-50 hover:text-ink'
                }`
              }
            >
              <Icon name={n.icon} size={16} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 flex flex-col gap-2 border-t border-lilac-100 pt-4">
          <Link to="/" className="btn-ghost justify-start !px-3">
            <Icon name="arrow" size={16} className="rotate-180" /> Voir le site
          </Link>
          <button onClick={logout} className="btn-ghost justify-start !px-3 text-rose-400 hover:text-rose-500">
            <Icon name="logout" size={16} /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <section>
        {title && <h1 className="mb-6 font-display text-3xl text-ink">{title}</h1>}
        {children}
      </section>
    </div>
  );
}
