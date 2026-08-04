import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/utils';
import Icon from '../ui/Icon';
import TagPill from './TagPill';

// Carte d'aperçu d'une publication. Rendu « page pressée » : marge de
// manuscrit à gauche, image en médaillon si présente.
export default function PoemCard({ post }) {
  const hasImage = Boolean(post.image_url);

  return (
    <article className="card card-hover group h-full overflow-hidden">
      <Link to={`/poeme/${post.slug}`} className="flex h-full flex-col">
        {hasImage && (
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={post.image_url}
              alt={post.image_alt || post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {post.pinned && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-paper/90 px-2.5 py-1 text-xs text-lilac-500 backdrop-blur">
                <Icon name="pin" size={12} /> Épinglé
              </span>
            )}
          </div>
        )}

        <div className="manuscript flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-center gap-2 text-xs text-ink-soft">
            <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            {!hasImage && post.pinned && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1 text-lilac-400">
                  <Icon name="pin" size={12} /> Épinglé
                </span>
              </>
            )}
          </div>

          <h3 className="font-display text-xl leading-snug text-ink transition-colors group-hover:text-lilac-500">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex flex-wrap gap-1.5">
              {(post.tags || []).slice(0, 2).map((t) => (
                <TagPill key={t} tag={t} />
              ))}
            </div>
            <span className="flex items-center gap-3 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1">
                <Icon name="heart" size={13} /> {post.likes_count}
              </span>
              <span className="inline-flex items-center gap-1 text-lilac-400 opacity-0 transition-opacity group-hover:opacity-100">
                Lire <Icon name="arrow" size={13} />
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
