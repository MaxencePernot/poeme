import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo';
import Icon from '../components/ui/Icon';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-28 text-center">
      <Seo title="Page introuvable" noindex />
      <p className="font-display text-6xl text-lilac-300">404</p>
      <h1 className="mt-4 font-display text-2xl text-ink">Cette page s'est envolée</h1>
      <p className="mt-3 text-ink-soft">
        Le vers que vous cherchiez n'existe pas, ou plus.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <Icon name="arrow" size={16} className="rotate-180" /> Revenir à l'accueil
      </Link>
    </div>
  );
}
