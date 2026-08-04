import { useRef } from 'react';
import { uploadImage } from '../../lib/storage';
import { useToast } from '../ui/Toast';
import Icon from '../ui/Icon';

const FONTS = [
  { label: 'Par défaut', value: '' },
  { label: 'Serif littéraire', value: 'Fraunces, serif' },
  { label: 'Lecture', value: 'Newsreader, serif' },
  { label: 'Sans-serif', value: 'Inter, sans-serif' },
];

const COLORS = ['#2B2733', '#8B6FB0', '#68A583', '#A98FD1', '#C77DA6', '#5B5468'];
const SIZES = [
  { label: 'Petit', value: '0.85em' },
  { label: 'Normal', value: '' },
  { label: 'Grand', value: '1.35em' },
  { label: 'Très grand', value: '1.7em' },
];
const EMOJIS = ['✨', '🌙', '🌿', '💜', '🕊️', '🍂', '🌸', '☕', '📖', '✍️'];

// Un bouton de la barre d'outils.
function Tool({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // garde le focus dans l'éditeur
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-sm transition-colors ${
        active ? 'bg-lilac-100 text-lilac-500' : 'text-ink-soft hover:bg-lilac-50 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-lilac-100" />;
}

export default function MenuBar({ editor }) {
  const fileRef = useRef(null);
  const toast = useToast();

  if (!editor) return null;

  const addLink = () => {
    const previous = editor.getAttributes('link').href;
    const url = window.prompt('Adresse du lien (laisser vide pour retirer) :', previous || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      toast('Téléversement de l\'image…');
      const { url } = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast('Image insérée.', 'success');
    } catch (err) {
      toast(err.message || "Échec du téléversement.", 'error');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-lilac-100 bg-paper-warm/60 px-2 py-2">
      {/* Styles de base */}
      <Tool active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras">
        <span className="font-bold">G</span>
      </Tool>
      <Tool active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique">
        <span className="italic font-serif">I</span>
      </Tool>
      <Tool active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligné">
        <span className="underline">S</span>
      </Tool>
      <Tool active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barré">
        <span className="line-through">B</span>
      </Tool>

      <Divider />

      {/* Titres */}
      <Tool active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Titre 1">H1</Tool>
      <Tool active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre 2">H2</Tool>
      <Tool active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titre 3">H3</Tool>

      <Divider />

      {/* Taille */}
      <select
        className="h-8 rounded-lg border border-lilac-100 bg-white px-2 text-xs text-ink-soft focus:outline-none"
        title="Taille du texte"
        onChange={(e) => {
          const v = e.target.value;
          if (v) editor.chain().focus().setMark('textStyle', { fontSize: v }).run();
          else editor.chain().focus().setMark('textStyle', { fontSize: null }).run();
        }}
        defaultValue=""
      >
        {SIZES.map((s) => (
          <option key={s.label} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Police */}
      <select
        className="h-8 rounded-lg border border-lilac-100 bg-white px-2 text-xs text-ink-soft focus:outline-none"
        title="Police"
        onChange={(e) => {
          const v = e.target.value;
          if (v) editor.chain().focus().setMark('textStyle', { fontFamily: v }).run();
          else editor.chain().focus().setMark('textStyle', { fontFamily: null }).run();
        }}
        defaultValue=""
      >
        {FONTS.map((f) => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>

      <Divider />

      {/* Couleurs */}
      <div className="flex items-center gap-1">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={`Couleur ${c}`}
            aria-label={`Couleur ${c}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setColor(c).run()}
            className="h-5 w-5 rounded-full ring-1 ring-black/5 transition-transform hover:scale-110"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <Divider />

      {/* Alignement */}
      <Tool active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Aligner à gauche">⇤</Tool>
      <Tool active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centrer">≡</Tool>
      <Tool active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Aligner à droite">⇥</Tool>

      <Divider />

      {/* Blocs */}
      <Tool active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation">❝</Tool>
      <Tool active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces">•</Tool>
      <Tool active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">1.</Tool>
      <Tool active={editor.isActive('link')} onClick={addLink} title="Lien"><Icon name="arrow" size={15} /></Tool>
      <Tool onClick={() => fileRef.current?.click()} title="Insérer une image"><Icon name="image" size={15} /></Tool>

      <Divider />

      {/* Emojis */}
      <div className="flex items-center gap-0.5">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={() => editor.chain().focus().insertContent(e).run()}
            className="grid h-8 w-8 place-items-center rounded-lg text-base hover:bg-lilac-50"
            title={`Insérer ${e}`}
          >
            {e}
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
    </div>
  );
}
