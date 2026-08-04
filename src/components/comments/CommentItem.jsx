import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCommentLike } from '../../hooks/useLikes';
import { commentsApi } from '../../hooks/useComments';
import { formatRelative } from '../../lib/utils';
import { useToast } from '../ui/Toast';
import Icon from '../ui/Icon';
import LikeButton from '../ui/LikeButton';
import CommentForm from './CommentForm';

// Affiche un commentaire et ses réponses (récursif). L'administrateur dispose
// des actions de modération : modifier, masquer, épingler, supprimer.
export default function CommentItem({ comment, postId, depth = 0, onChange }) {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { liked, count, toggle } = useCommentLike(comment);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);

  // Masqué : invisible pour le public, grisé et signalé pour l'admin.
  if (comment.hidden && !isAdmin) return null;

  const saveEdit = async () => {
    const { error } = await commentsApi.update(comment.id, { body: draft.trim() });
    if (error) return toast(error.message, 'error');
    setEditing(false);
    toast('Commentaire modifié.', 'success');
    onChange?.();
  };

  const act = async (fn, msg) => {
    const { error } = await fn();
    if (error) return toast(error.message, 'error');
    toast(msg, 'success');
    onChange?.();
  };

  return (
    <div className={depth > 0 ? 'ml-5 border-l border-lilac-100 pl-5' : ''}>
      <div
        className={`rounded-2xl p-4 transition-colors ${
          comment.pinned ? 'bg-lilac-50/70' : 'bg-white/50'
        } ${comment.hidden ? 'opacity-50 ring-1 ring-rose-200' : ''}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-lilac-100 to-sage-100 text-sm font-medium text-lilac-500">
              {comment.author_name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{comment.author_name}</p>
              <p className="text-xs text-ink-soft">{formatRelative(comment.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {comment.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-lilac-100 px-2 py-0.5 text-xs text-lilac-500">
                <Icon name="pin" size={11} /> Épinglé
              </span>
            )}
            {comment.hidden && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-500">
                Masqué
              </span>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-3 space-y-2">
            <textarea
              className="field min-h-[80px]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={saveEdit} className="btn-primary !py-1.5">
                Enregistrer
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost !py-1.5">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/90">
            {comment.body}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1">
          <LikeButton liked={liked} count={count} onToggle={toggle} size={15} />
          {depth < 3 && (
            <button
              onClick={() => setReplying((r) => !r)}
              className="btn-ghost !px-3 !py-1.5 text-xs"
            >
              <Icon name="reply" size={14} /> Répondre
            </button>
          )}

          {/* Outils de modération (admin) */}
          {isAdmin && (
            <div className="ml-auto flex items-center gap-1">
              <button
                title="Modifier"
                onClick={() => { setDraft(comment.body); setEditing(true); }}
                className="btn-ghost !px-2 !py-1.5"
              >
                <Icon name="edit" size={15} />
              </button>
              <button
                title={comment.pinned ? 'Désépingler' : 'Épingler'}
                onClick={() =>
                  act(() => commentsApi.togglePinned(comment.id, !comment.pinned),
                      comment.pinned ? 'Désépinglé.' : 'Épinglé.')}
                className="btn-ghost !px-2 !py-1.5"
              >
                <Icon name="pin" size={15} />
              </button>
              <button
                title={comment.hidden ? 'Afficher' : 'Masquer'}
                onClick={() =>
                  act(() => commentsApi.toggleHidden(comment.id, !comment.hidden),
                      comment.hidden ? 'Affiché.' : 'Masqué.')}
                className="btn-ghost !px-2 !py-1.5"
              >
                <Icon name={comment.hidden ? 'eye' : 'eye-off'} size={15} />
              </button>
              <button
                title="Supprimer"
                onClick={() => {
                  if (confirm('Supprimer définitivement ce commentaire ?'))
                    act(() => commentsApi.remove(comment.id), 'Supprimé.');
                }}
                className="btn-ghost !px-2 !py-1.5 text-rose-400 hover:text-rose-500"
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          )}
        </div>

        {replying && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              compact
              onDone={() => { setReplying(false); onChange?.(); }}
            />
          </div>
        )}
      </div>

      {/* Réponses imbriquées */}
      {comment.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
