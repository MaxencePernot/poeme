import { useState } from 'react';
import { commentsApi } from '../../hooks/useComments';
import { useToast } from '../ui/Toast';
import Icon from '../ui/Icon';

// Formulaire d'ajout de commentaire (ou de réponse).
// Sécurité : champ « website » invisible servant de piège à robots (honeypot),
// validation de longueur, détection de spam côté client + RLS côté serveur.
export default function CommentForm({ postId, parentId = null, onDone, compact = false }) {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    const { error } = await commentsApi.add({
      postId,
      parentId,
      authorName: name,
      body,
      honeypot: website,
    });

    setSending(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    setName('');
    setBody('');
    toast('Merci, votre commentaire est publié.', 'success');
    onDone?.();
  };

  return (
    <form onSubmit={submit} className={compact ? 'space-y-2' : 'space-y-3'}>
      {/* Piège anti-robot : caché aux humains, ignoré par les lecteurs d'écran. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <input
        type="text"
        className="field"
        placeholder="Votre nom"
        value={name}
        maxLength={60}
        required
        onChange={(e) => setName(e.target.value)}
      />
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
            <button type="button" onClick={onDone} className="btn-ghost">
              Annuler
            </button>
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
