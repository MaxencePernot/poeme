import { useParams, Link } from 'react-router-dom';
import { usePost } from '../hooks/usePosts';
import { usePostLike } from '../hooks/useLikes';
import { formatDate, htmlToExcerpt } from '../lib/utils';
import Seo from '../components/ui/Seo';
import Spinner from '../components/ui/Spinner';
import Reveal from '../components/ui/Reveal';
import Icon from '../components/ui/Icon';
import LikeButton from '../components/ui/LikeButton';
import PoemContent from '../components/poems/PoemContent';
import TagPill from '../components/poems/TagPill';
import ShareButtons from '../components/poems/ShareButtons';
import CommentList from '../components/comments/CommentList';

export default function PoemDetail() {
  const { slug } = useParams();
  const { post, loading, error } = usePost(slug);
  const { liked, count, toggle } = usePostLike(post);

  if (loading) return <Spinner label="Ouverture du poème…" />;

  if (error || !post) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">Poème introuvable</h1>
        <p className="mt-3 text-ink-soft">
          Ce texte a peut-être été retiré, ou l'adresse est incorrecte.
        </p>
        <Link to="/poemes" className="btn-primary mt-6">Retour au recueil</Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-prose px-5 py-16">
      <Seo
        title={post.title}
        path={`/poeme/${post.slug}`}
        description={post.excerpt || htmlToExcerpt(post.content_html)}
        image={post.image_url || '/og-image.svg'}
        type="article"
      />

      {/* Fil d'Ariane */}
      <Reveal as="nav" className="mb-8 flex items-center gap-2 text-sm text-ink-soft">
        <Link to="/poemes" className="link-underline inline-flex items-center gap-1">
          <Icon name="arrow" size={14} className="rotate-180" /> Le recueil
        </Link>
      </Reveal>

      {/* En-tête */}
      <header className="mb-8">
        <Reveal as="p" className="text-sm text-ink-soft">
          <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
        </Reveal>
        <Reveal as="h1" delay={80} className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
          {post.title}
        </Reveal>
        {(post.tags?.length ?? 0) > 0 && (
          <Reveal delay={140} className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <TagPill key={t} tag={t} to={`/poemes?tag=${encodeURIComponent(t)}`} />
            ))}
          </Reveal>
        )}
      </header>

      {/* Image en médaillon si présente */}
      {post.image_url && (
        <Reveal className="mb-10">
          <img
            src={post.image_url}
            alt={post.image_alt || post.title}
            className="w-full rounded-2xl shadow-soft"
          />
        </Reveal>
      )}

      {/* Corps du poème */}
      <Reveal delay={120} className="manuscript">
        <PoemContent html={post.content_html} />
      </Reveal>

      {/* Actions : like + partage */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y border-lilac-100 py-5">
        <LikeButton liked={liked} count={count} onToggle={toggle} size={22} />
        <ShareButtons title={post.title} />
      </div>

      {/* Commentaires */}
      <CommentList postId={post.id} />
    </article>
  );
}
