import { useEffect, useState } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useAuth } from '../context/AuthContext';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import Spinner from '../components/ui/Spinner';
import PoemContent from '../components/poems/PoemContent';
import RichTextEditor from '../components/editor/RichTextEditor';
import Icon from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

// Page « À propos ». Le contenu vient de site_content['about'] et n'est
// modifiable que par l'administrateur, directement depuis la page.
export default function About() {
  const { value, loading, save, refetch } = useSiteContent('about');
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (value) {
      setTitle(value.title || 'À propos');
      setHtml(value.html || '');
    }
  }, [value]);

  const persist = async () => {
    const { error } = await save({ title, html });
    if (error) return toast(error.message, 'error');
    setEditing(false);
    toast('Page mise à jour.', 'success');
    refetch();
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-prose px-5 py-16">
      <Seo
        title={value?.title || 'À propos'}
        path="/a-propos"
        description="Mon histoire, mon parcours, ma passion pour l'écriture."
      />

      <Reveal as="p" className="eyebrow mb-3 text-center">L'auteur·e</Reveal>
      <Reveal as="h1" delay={80} className="text-center font-display text-4xl text-ink sm:text-5xl">
        {value?.title || 'À propos'}
      </Reveal>

      {isAdmin && (
        <div className="mt-6 flex justify-center">
          {editing ? (
            <div className="flex gap-2">
              <button onClick={persist} className="btn-primary"><Icon name="check" size={16} /> Enregistrer</button>
              <button onClick={() => setEditing(false)} className="btn-ghost">Annuler</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-outline">
              <Icon name="edit" size={16} /> Modifier cette page
            </button>
          )}
        </div>
      )}

      <div className="mt-10">
        {editing ? (
          <div className="space-y-4">
            <input
              className="field font-display text-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la page"
            />
            <RichTextEditor value={html} onChange={setHtml} placeholder="Racontez votre histoire…" />
          </div>
        ) : (
          <Reveal className="manuscript">
            <PoemContent html={value?.html || '<p>Bientôt, une histoire à raconter…</p>'} />
          </Reveal>
        )}
      </div>
    </div>
  );
}
