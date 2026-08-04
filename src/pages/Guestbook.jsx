import { useState } from 'react';
import { useGuestbook, guestbookApi } from '../hooks/useGuestbook';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';
import Seo from '../components/ui/Seo';
import PageHeader from '../components/ui/PageHeader';
import Reveal from '../components/ui/Reveal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

// Carte d'une contribution (Les Plumes Invitées), avec modération admin.
function Entry({ entry, isAdmin, onChange }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.body);

  if (entry.hidden && !isAdmin) return null;

  const save = async () => {
    const { error } = await guestbookApi.update(entry.id, { body: draft.trim() });
    if (error) return toast(error.message, 'error');
    setEditing(false);
    toast('Message corrigé.', 'success');
    onChange?.();
  };

  const act = async (fn, msg) => {
    const { error } = await fn();
    if (error) return toast(error.message, 'error');
    toast(msg, 'success');
    onChange?.();
  };

  return (
    <div
      className={`card p-6 ${entry.hidden ? 'opacity-50 ring-1 ring-rose-200' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sage-100 to-lilac-100 font-display text-lilac-500">
            {entry.author_name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-ink">{entry.author_name}</p>
            <p className="text-xs text-ink-soft">{formatDate(entry.created_at)}</p>
          </div>
        </div>
        {entry.hidden && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-500">Masqué</span>
        )}
      </div>

      {editing ? (
        <div className="mt-4 space-y-2">
          <textarea className="field min-h-[100px]" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary !py-1.5">Enregistrer</button>
            <button onClick={() => setEditing(false)} className="btn-ghost !py-1.5">Annuler</button>
          </div>
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-line font-reader text-ink/90">{entry.body}</p>
      )}

      {isAdmin && !editing && (
        <div className="mt-4 flex items-center gap-1 border-t border-lilac-50 pt-3">
          <button onClick={() => { setDraft(entry.body); setEditing(true); }} className="btn-ghost !px-2 !py-1.5" title="Corriger">
            <Icon name="edit" size={15} />
          </button>
          <button
            onClick={() => act(() => guestbookApi.toggleHidden(entry.id, !entry.hidden), entry.hidden ? 'Affiché.' : 'Masqué.')}
            className="btn-ghost !px-2 !py-1.5"
            title={entry.hidden ? 'Afficher' : 'Masquer'}
          >
            <Icon name={entry.hidden ? 'eye' : 'eye-off'} size={15} />
          </button>
          <button
            onClick={() => { if (confirm('Supprimer ce message ?')) act(() => guestbookApi.remove(entry.id), 'Supprimé.'); }}
            className="btn-ghost !px-2 !py-1.5 text-rose-400 hover:text-rose-500"
            title="Supprimer"
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// Formulaire de contribution (avec honeypot anti-spam).
function GuestbookForm({ onDone }) {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    const { error } = await guestbookApi.add({ authorName: name, body, honeypot: website });
    setSending(false);
    if (error) return toast(error.message, 'error');
    setName(''); setBody('');
    toast('Merci pour votre message !', 'success');
    onDone?.();
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-6">
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off"
        value={website} onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0" aria-hidden="true"
      />
      <input
        className="field" placeholder="Votre nom" value={name} maxLength={60} required
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="field min-h-[120px] resize-y"
        placeholder="Partagez un poème, un texte, une réflexion, une inspiration…"
        value={body} maxLength={3000} required
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-soft/60">{body.length}/3000</span>
        <button type="submit" disabled={sending} className="btn-primary">
          <Icon name="feather" size={16} />
          {sending ? 'Envoi…' : 'Partager mon écrit'}
        </button>
      </div>
    </form>
  );
}

export default function Guestbook() {
  const { entries, loading, refetch } = useGuestbook();
  const { isAdmin } = useAuth();
  const visibleCount = entries.filter((e) => !e.hidden).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Seo
        title="Les Plumes Invitées"
        path="/les-plumes-invitees"
        description="Un espace ouvert où les visiteurs partagent leurs poèmes, textes et inspirations."
      />

      <PageHeader
        eyebrow="À vos plumes"
        title="Les Plumes Invitées"
        subtitle="Un espace ouvert : partagez vos poèmes, vos textes, vos réflexions et vos inspirations."
      />

      <div className="mt-10">
        <GuestbookForm onDone={refetch} />
      </div>

      <div className="mt-10 space-y-4">
        {loading ? (
          <Spinner />
        ) : visibleCount === 0 && !isAdmin ? (
          <EmptyState
            title="Les Plumes Invitées attendent leur premier écrit"
            hint="Vous pourriez être la première personne à y écrire."
            icon="✎"
          />
        ) : (
          entries.map((e, i) => (
            <Reveal key={e.id} delay={(i % 4) * 70}>
              <Entry entry={e} isAdmin={isAdmin} onChange={refetch} />
            </Reveal>
          ))
        )}
      </div>
    </div>
  );
}
