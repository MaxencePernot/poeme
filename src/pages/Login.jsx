import { useState } from 'react';
import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Seo from '../components/ui/Seo';
import { useToast } from '../components/ui/Toast';

// Connexion ouverte à tous les comptes. Les administrateurs sont redirigés
// vers leur tableau de bord ; les visiteurs vers leur profil.
export default function Login() {
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // Déjà connecté : on redirige selon le rôle.
  if (!loading && user) {
    return <Navigate to={isAdmin ? '/admin' : '/profil'} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    if (error) {
      setBusy(false);
      toast('Identifiants incorrects.', 'error');
      return;
    }
    // On vérifie le statut admin pour choisir la destination.
    const { data: admin } = await supabase.rpc('is_admin');
    setBusy(false);
    toast('Bienvenue.', 'success');
    const dest = admin ? '/admin' : location.state?.from || '/profil';
    navigate(dest, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md px-5 py-24">
      <Seo title="Connexion" path="/connexion" noindex />

      <h1 className="text-center font-display text-3xl text-ink">Connexion</h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Contente de vous revoir.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          type="email" className="field" placeholder="Adresse e-mail"
          value={email} autoComplete="email" required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password" className="field" placeholder="Mot de passe"
          value={password} autoComplete="current-password" required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm text-ink-soft">
        <Link to="/mot-de-passe-oublie" className="link-underline">Mot de passe oublié ?</Link>
        <span>
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="link-underline text-lilac-500">Créer un compte</Link>
        </span>
      </div>
    </div>
  );
}
