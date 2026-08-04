import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { newsletterApi } from '../hooks/useNewsletter';
import Seo from '../components/ui/Seo';
import Icon from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

// Création d'un compte visiteur (nécessaire pour commenter et partager).
export default function Register() {
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  if (!loading && user) return <Navigate to="/profil" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8)
      return toast('Le mot de passe doit contenir au moins 8 caractères.', 'error');
    if (password !== confirm)
      return toast('Les deux mots de passe ne correspondent pas.', 'error');

    setBusy(true);
    const { data, error } = await signUp(email, password, name, newsletter);
    if (error) {
      setBusy(false);
      return toast(error.message || "L'inscription a échoué.", 'error');
    }
    // Enregistre aussi l'adresse dans la liste newsletter si demandé.
    if (newsletter) await newsletterApi.subscribe(email);
    setBusy(false);

    // Si la confirmation d'e-mail est activée, aucune session n'est ouverte.
    if (!data?.session) {
      setCheckEmail(true);
      return;
    }
    toast('Bienvenue ! Votre compte est créé.', 'success');
    navigate('/profil', { replace: true });
  };

  if (checkEmail) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <Seo title="Vérifiez votre e-mail" path="/inscription" noindex />
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-100 text-sage-500">
          <Icon name="mail" size={24} />
        </span>
        <h1 className="mt-6 font-display text-2xl text-ink">Vérifiez votre boîte mail</h1>
        <p className="mt-3 text-ink-soft">
          Un lien de confirmation vient de vous être envoyé. Cliquez dessus pour
          activer votre compte, puis connectez-vous.
        </p>
        <Link to="/connexion" className="btn-primary mt-6">Aller à la connexion</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <Seo title="Créer un compte" path="/inscription" noindex />

      <h1 className="text-center font-display text-3xl text-ink">Créer un compte</h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Pour commenter, répondre et partager vos écrits.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <input className="field" placeholder="Votre nom (ou pseudonyme)" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
        <input type="email" className="field" placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        <input type="password" className="field" placeholder="Mot de passe (8 caractères min.)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
        <input type="password" className="field" placeholder="Confirmer le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />

        <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-paper-warm/60 p-3 text-sm text-ink">
          <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-0.5 h-4 w-4 accent-lilac-400" />
          Je souhaite recevoir la newsletter (nouveaux poèmes, lectures, nouvelles).
        </label>

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Déjà un compte ?{' '}
        <Link to="/connexion" className="link-underline text-lilac-500">Se connecter</Link>
      </p>
    </div>
  );
}
