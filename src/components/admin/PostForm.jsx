import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../hooks/usePosts';
import { uploadImage } from '../../lib/storage';
import { slugify, htmlToExcerpt } from '../../lib/utils';
import RichTextEditor from '../editor/RichTextEditor';
import Icon from '../ui/Icon';
import { useToast } from '../ui/Toast';

// Formulaire unique pour créer ou modifier une publication (poème/photo/les deux).
export default function PostForm({ initial = null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [title, setTitle] = useState(initial?.title || '');
  const [kind, setKind] = useState(initial?.kind || 'poem');
  const [contentHtml, setContentHtml] = useState(initial?.content_html || '');
  const [imageUrl, setImageUrl] = useState(initial?.image_url || '');
  const [imageAlt, setImageAlt] = useState(initial?.image_alt || '');
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(', '));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [customExcerpt, setCustomExcerpt] = useState(initial?.excerpt || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?.id);

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImageUrl(url);
      toast('Image téléversée.', 'success');
    } catch (err) {
      toast(err.message || 'Échec du téléversement.', 'error');
    }
    setUploading(false);
  };

  const buildPayload = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    const excerpt =
      customExcerpt.trim() || htmlToExcerpt(contentHtml, 160) || (imageUrl ? title : '');

    // Slug : conservé si édition, sinon dérivé du titre + suffixe unique.
    const slug =
      initial?.slug ||
      `${slugify(title) || 'publication'}-${Math.random().toString(36).slice(2, 6)}`;

    return {
      slug,
      title: title.trim(),
      kind,
      content_html: contentHtml,
      excerpt,
      image_url: imageUrl || null,
      image_alt: imageAlt.trim(),
      tags,
      published,
      pinned,
    };
  };

  const save = async () => {
    if (!title.trim()) return toast('Un titre est requis.', 'error');
    if (kind !== 'photo' && !contentHtml.trim())
      return toast('Le contenu du poème est vide.', 'error');
    if (kind !== 'poem' && !imageUrl)
      return toast('Une image est attendue pour ce type.', 'error');

    setSaving(true);
    const payload = buildPayload();
    const { data, error } = isEdit
      ? await postsApi.update(initial.id, payload)
      : await postsApi.create(payload);
    setSaving(false);

    if (error) return toast(error.message, 'error');
    toast(isEdit ? 'Publication mise à jour.' : 'Publication créée.', 'success');
    navigate(`/poeme/${data.slug}`);
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Titre</label>
        <input
          className="field font-display text-lg"
          placeholder="Le titre de votre poème…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Type de publication</label>
        <div className="flex flex-wrap gap-2">
          {[
            { v: 'poem', l: 'Texte seul' },
            { v: 'photo', l: 'Image seule' },
            { v: 'both', l: 'Texte + image' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setKind(opt.v)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                kind === opt.v ? 'bg-ink text-paper' : 'bg-lilac-50 text-lilac-500 hover:bg-lilac-100'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Image */}
      {kind !== 'poem' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Image</label>
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-lilac-100">
              <img src={imageUrl} alt={imageAlt} className="max-h-72 w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-rose-400 shadow-soft hover:text-rose-500"
                title="Retirer l'image"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-lilac-200 bg-white/40 py-10 text-ink-soft transition-colors hover:border-lilac-300 hover:bg-lilac-50"
            >
              <Icon name="image" size={26} className="text-lilac-300" />
              <span className="text-sm">{uploading ? 'Téléversement…' : 'Choisir une image (max 8 Mo)'}</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />

          {imageUrl && (
            <input
              className="field mt-2 text-sm"
              placeholder="Texte alternatif (description de l'image, pour l'accessibilité)"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
            />
          )}
        </div>
      )}

      {/* Contenu riche */}
      {kind !== 'photo' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Contenu</label>
          <RichTextEditor value={contentHtml} onChange={setContentHtml} />
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Tags <span className="font-normal text-ink-soft">(séparés par des virgules)</span>
        </label>
        <input
          className="field"
          placeholder="crépuscule, silence, amour"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>

      {/* Extrait facultatif */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Extrait <span className="font-normal text-ink-soft">(facultatif — généré automatiquement sinon)</span>
        </label>
        <textarea
          className="field min-h-[70px]"
          placeholder="Un court résumé affiché sur les cartes et pour le référencement…"
          value={customExcerpt}
          maxLength={200}
          onChange={(e) => setCustomExcerpt(e.target.value)}
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-6 rounded-xl bg-paper-warm/60 p-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-lilac-400" />
          Visible publiquement
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="h-4 w-4 accent-lilac-400" />
          Épingler en tête
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-lilac-100 pt-5">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Icon name="check" size={16} />
          {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Publier'}
        </button>
        <button onClick={() => navigate(-1)} className="btn-ghost">Annuler</button>
      </div>
    </div>
  );
}
