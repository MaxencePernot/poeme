import { useState } from 'react';
import { Link } from 'react-router-dom';
import { commentsApi } from '../../hooks/useComments';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import Icon from '../ui/Icon';

// Nom affiché : celui du profil, sinon la partie locale de l'e-mail.
function displayNameOf(user, profile) {
  return (
    profile?.display_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Lecteur·rice'
  );
}

// Formulaire d'ajout de commentaire (ou de réponse).
// Réservé aux personnes connectées : réduit le spam et responsabilise.
export default function CommentForm({ postId, parentId = null, onDone, compact = false }) {
  const { user, profile } = useAuth();
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [sending, setSending] = useState(false);
  const toast = useToast();

  // Invite à se connecter si l'utilisateur n'a pas de compte.
  if (!user) {
    return (
      <div className="rounded-2xl border border-lilac-100 bg-white/50 p-5 text-center">
        <p className="text-sm text-ink-soft">
          Pour laisser un commentaire, connectez-vous ou créez un compte.
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <Link to="/connexion" className="btn-primary !py-2">Se connecter</Link>
          <Link to="/inscription" className="btn-outline !py-2">Créer un compte</Link>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    const { error } = await commentsApi.add({
      postId,
      parentId,
      userId: user.id,
      authorName: displayNameOf(user, profile),
      body,
      honeypot: website,
    });

    setSending(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    setBody('');
    toast('Merci, votre commentaire est publié.', 'success');
    onDone?.();
  };

  return (
    <form onSubmit={submit} className={compact ? 'space-y-2' : 'space-y-3'}>
      {/* Piège anti-robot */}
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off"
        value={website} onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0" aria-hidden="true"
      />

      <p className="text-xs text-ink-soft">
        Vous commentez en tant que <span className="font-medium text-ink">{displayNameOf(user, profile)}</span>.
      </p>
      <textarea
        className="field min-h-[90px] resize-y"
        placeholder={parentId ? 'Votre réponse…' : 'Laissez un mot, une pensée…'}
        value={body}
        maxLength={2000}
        required
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-soft/60">{body.length}/2000</span>
        <div className="flex gap-2">
          {onDone && parentId && (
            <button type="button" onClick={onDone} className="btn-ghost">Annuler</button>
          )}
          <button type="submit" disabled={sending} className="btn-primary">
            <Icon name="feather" size={16} />
            {sending ? 'Envoi…' : parentId ? 'Répondre' : 'Publier'}
          </button>
        </div>
      </div>
    </form>
  );
}
