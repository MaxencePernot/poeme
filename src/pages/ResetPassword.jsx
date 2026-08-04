import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Seo from '../components/ui/Seo';
import { useToast } from '../components/ui/Toast';

// Page atteinte via le lien reçu par e-mail. Supabase ouvre une session
// temporaire de récupération : on peut alors définir un nouveau mot de passe.
export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // La session de récupération peut déjà être présente, ou arriver via
    // l'événement PASSWORD_RECOVERY juste après le chargement.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8)
      return toast('Le mot de passe doit contenir au moins 8 caractères.', 'error');
    if (password !== confirm)
      return toast('Les deux mots de passe ne correspondent pas.', 'error');
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast('Mot de passe mis à jour.', 'success');
    navigate('/profil', { replace: true });
  };

  return (
    <div className="mx-auto max-w-md px-5 py-24">
      <Seo title="Nouveau mot de passe" path="/reinitialiser-mot-de-passe" noindex />
      <h1 className="text-center font-display text-3xl text-ink">Nouveau mot de passe</h1>

      {!ready ? (
        <p className="mt-6 text-center text-sm text-ink-soft">
          Ouvrez le lien reçu par e-mail pour accéder à cette page. Si vous venez
          de cliquer dessus, patientez un instant…
          <br />
          <Link to="/mot-de-passe-oublie" className="link-underline text-lilac-500">
            Renvoyer un lien
          </Link>
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input
            type="password" className="field" placeholder="Nouveau mot de passe"
            value={password} autoComplete="new-password" required
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password" className="field" placeholder="Confirmer le mot de passe"
            value={confirm} autoComplete="new-password" required
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Enregistrement…' : 'Définir le mot de passe'}
          </button>
        </form>
      )}
    </div>
  );
}
