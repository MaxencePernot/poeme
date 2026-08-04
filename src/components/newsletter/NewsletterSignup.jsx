import { useState } from 'react';
import { newsletterApi } from '../../hooks/useNewsletter';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';

// Inscription à la newsletter : on ne collecte que l'adresse e-mail.
// L'envoi des lettres se fait ensuite avec l'outil de votre choix.
export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await newsletterApi.subscribe(email);
    setBusy(false);
    if (error) return toast(error.message, 'error');
    setDone(true);
    setEmail('');
    toast('Merci ! Vous êtes bien inscrit·e.', 'success');
  };

  if (done) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-sage-500">
        <Icon name="check" size={16} /> Inscription enregistrée, merci !
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-sm gap-2">
      <input
        type="email"
        className="field !py-2 text-sm"
        placeholder="Votre adresse e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <button type="submit" disabled={busy} className="btn-primary !py-2 whitespace-nowrap">
        <Icon name="mail" size={15} /> {busy ? '…' : "S'inscrire"}
      </button>
    </form>
  );
}
