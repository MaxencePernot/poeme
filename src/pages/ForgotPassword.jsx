import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Seo from '../components/ui/Seo';
import Icon from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

// Demande d'un e-mail de réinitialisation du mot de passe.
export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await requestPasswordReset(email);
    setBusy(false);
    if (error) return toast(error.message, 'error');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <Seo title="Mot de passe oublié" path="/mot-de-passe-oublie" noindex />
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-100 text-sage-500">
          <Icon name="mail" size={24} />
        </span>
        <h1 className="mt-6 font-display text-2xl text-ink">Vérifiez votre boîte mail</h1>
        <p className="mt-3 text-ink-soft">
          Si un compte existe pour cette adresse, vous recevrez un lien pour
          définir un nouveau mot de passe.
        </p>
        <Link to="/connexion" className="btn-primary mt-6">Retour à la connexion</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-24">
      <Seo title="Mot de passe oublié" path="/mot-de-passe-oublie" noindex />
      <h1 className="text-center font-display text-3xl text-ink">Mot de passe oublié</h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Indiquez votre adresse : nous vous enverrons un lien de réinitialisation.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          type="email" className="field" placeholder="Adresse e-mail"
          value={email} autoComplete="email" required
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Envoi…' : 'Envoyer le lien'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/connexion" className="link-underline">Retour à la connexion</Link>
      </p>
    </div>
  );
}
