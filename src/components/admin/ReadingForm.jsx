import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readingsApi } from '../../hooks/useReadings';
import { uploadImage } from '../../lib/storage';
import Icon from '../ui/Icon';
import StarRating from '../ui/StarRating';
import { useToast } from '../ui/Toast';

// Créer ou modifier une fiche de lecture.
export default function ReadingForm({ initial = null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [title, setTitle] = useState(initial?.title || '');
  const [author, setAuthor] = useState(initial?.author || '');
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [review, setReview] = useState(initial?.review || '');
  const [rating, setRating] = useState(initial?.rating || 0);
  const [quotes, setQuotes] = useState(initial?.quotes?.length ? initial.quotes : ['']);
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

  const setQuote = (i, val) => setQuotes((qs) => qs.map((q, j) => (j === i ? val : q)));
  const addQuote = () => setQuotes((qs) => [...qs, '']);
  const removeQuote = (i) => setQuotes((qs) => qs.filter((_, j) => j !== i));

  const save = async () => {
    if (!title.trim()) return toast('Le titre est requis.', 'error');
    setSaving(true);
    const payload = {
      title: title.trim(),
      author: author.trim(),
      cover_url: coverUrl || null,
      description: description.trim(),
      review: review.trim(),
      rating,
      quotes: quotes.map((q) => q.trim()).filter(Boolean).slice(0, 12),
      published,
    };
    const { error } = isEdit
      ? await readingsApi.update(initial.id, payload)
      : await readingsApi.create(payload);
    setSaving(false);
    if (error) return toast(error.message, 'error');
    toast(isEdit ? 'Lecture mise à jour.' : 'Lecture ajoutée.', 'success');
    navigate('/admin/lectures');
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

      {/* Note */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Note</label>
        <StarRating value={rating} onChange={setRating} size={26} />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Description du livre</label>
        <textarea className="field min-h-[90px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="De quoi parle ce livre ?" />
      </div>

      {/* Avis */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Mon avis</label>
        <textarea className="field min-h-[90px]" value={review} onChange={(e) => setReview(e.target.value)} placeholder="Ce que j'en ai pensé…" />
      </div>

      {/* Citations */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Citations <span className="font-normal text-ink-soft">(facultatif)</span></label>
        <div className="space-y-2">
          {quotes.map((q, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="field flex-1"
                value={q}
                onChange={(e) => setQuote(i, e.target.value)}
                placeholder="Un passage qui vous a marquée…"
              />
              {quotes.length > 1 && (
                <button type="button" onClick={() => removeQuote(i)} className="btn-ghost !px-2 text-rose-400 hover:text-rose-500" title="Retirer">
                  <Icon name="trash" size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addQuote} className="btn-ghost mt-2 !px-2 text-sm">
          <Icon name="plus" size={15} /> Ajouter une citation
        </button>
      </div>

      {/* Publication */}
      <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-paper-warm/60 p-4 text-sm text-ink">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-lilac-400" />
        Visible publiquement
      </label>

      <div className="flex items-center gap-3 border-t border-lilac-100 pt-5">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Icon name="check" size={16} /> {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Ajouter'}
        </button>
        <button onClick={() => navigate(-1)} className="btn-ghost">Annuler</button>
      </div>
    </div>
  );
}
