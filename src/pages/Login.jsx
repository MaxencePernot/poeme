import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Seo from '../components/ui/Seo';
import Icon from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

// Connexion réservée à l'administrateur. Les inscriptions publiques doivent
// être désactivées dans Supabase (voir README) pour rester seul admin.
export default function Login() {
  const { signIn, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // Déjà connecté : on redirige vers le tableau de bord.
  if (!loading && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      toast('Identifiants incorrects.', 'error');
      return;
    }
    toast('Bienvenue.', 'success');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24">
      <Seo title="Connexion" path="/connexion" noindex />

      <span className="grid h-14 w-14 place-items-center rounded-full bg-lilac-100 text-lilac-500">
        <Icon name="lock" size={24} />
      </span>
      <h1 className="mt-6 font-display text-3xl text-ink">Espace administrateur</h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Cet espace est réservé à l'auteur·e du site.
      </p>

      <form onSubmit={submit} className="mt-8 w-full space-y-3">
        <input
          type="email"
          className="field"
          placeholder="Adresse e-mail"
          value={email}
          autoComplete="email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="field"
          placeholder="Mot de passe"
          value={password}
          autoComplete="current-password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
