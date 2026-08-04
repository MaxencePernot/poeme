import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import MenuBar from './MenuBar';

// Extension maison : ajoute l'attribut « fontSize » et « fontFamily » au
// mark textStyle, pour gérer tailles et polices depuis la barre d'outils.
const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize || null,
        renderHTML: (attrs) =>
          attrs.fontSize ? { style: `font-size:${attrs.fontSize}` } : {},
      },
      fontFamily: {
        default: null,
        parseHTML: (el) => el.style.fontFamily || null,
        renderHTML: (attrs) =>
          attrs.fontFamily ? { style: `font-family:${attrs.fontFamily}` } : {},
      },
    };
  },
});

// Éditeur WYSIWYG complet, façon Word / Notion.
export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      CustomTextStyle,
      Color,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder || 'Laissez couler les mots…',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
  });

  // Synchronise le contenu si « value » change de l'extérieur (ex. édition).
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-lilac-200 bg-white/70">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
