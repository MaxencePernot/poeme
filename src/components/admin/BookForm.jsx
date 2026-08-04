import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksApi } from '../../hooks/useBooks';
import { uploadImage } from '../../lib/storage';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';

// Créer ou modifier un livre mis en avant.
export default function BookForm({ initial = null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [title, setTitle] = useState(initial?.title || '');
  const [author, setAuthor] = useState(initial?.author || '');
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url || '');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [buyUrl, setBuyUrl] = useState(initial?.buy_url || '');
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?.id);

  const onPickCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setCoverUrl(url);
      toast('Couverture téléversée.', 'success');
    } catch (err) {
      toast(err.message || 'Échec du téléversement.', 'error');
    }
    setUploading(false);
  };

  const save = async () => {
    if (!title.trim()) return toast('Le titre est requis.', 'error');
    if (buyUrl && !/^https?:\/\//i.test(buyUrl.trim()))
      return toast("Le lien d'achat doit commencer par http:// ou https://", 'error');
    setSaving(true);
    const payload = {
      title: title.trim(),
      author: author.trim(),
      cover_url: coverUrl || null,
      summary: summary.trim(),
      buy_url: buyUrl.trim() || null,
      pinned,
      published,
    };
    const { error } = isEdit
      ? await booksApi.update(initial.id, payload)
      : await booksApi.create(payload);
    setSaving(false);
    if (error) return toast(error.message, 'error');
    toast(isEdit ? 'Livre mis à jour.' : 'Livre ajouté.', 'success');
    navigate('/admin/livres');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Titre</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du livre" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Auteur</label>
          <input className="field" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nom de l'auteur" />
        </div>
      </div>

      {/* Couverture */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Couverture</label>
        {coverUrl ? (
          <div className="relative inline-block">
            <img src={coverUrl} alt="" className="h-44 w-32 rounded-lg object-cover shadow-soft" />
            <button
              type="button"
              onClick={() => setCoverUrl('')}
              className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-paper text-rose-400 shadow-soft hover:text-rose-500"
              title="Retirer"
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-44 w-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-lilac-200 bg-white/40 text-ink-soft hover:border-lilac-300"
          >
            <Icon name="image" size={22} className="text-lilac-300" />
            <span className="text-xs">{uploading ? '…' : 'Ajouter'}</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickCover} />
      </div>

      {/* Résumé */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Résumé</label>
        <textarea className="field min-h-[110px]" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Le résumé du livre…" />
      </div>

      {/* Lien d'achat */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Lien vers l'achat</label>
        <input className="field" value={buyUrl} onChange={(e) => setBuyUrl(e.target.value)} placeholder="https://…" />
        <p className="mt-1 text-xs text-ink-soft">Le bouton « Acheter » n'apparaît que si un lien est renseigné.</p>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-6 rounded-xl bg-paper-warm/60 p-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="h-4 w-4 accent-lilac-400" />
          Mettre à l'honneur (en tête)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-lilac-400" />
          Visible publiquement
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-lilac-100 pt-5">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Icon name="check" size={16} /> {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Ajouter'}
        </button>
        <button onClick={() => navigate(-1)} className="btn-ghost">Annuler</button>
      </div>
    </div>
  );
}
