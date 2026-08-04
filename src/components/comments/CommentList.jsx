import { useComments } from '../../hooks/useComments';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';
import Icon from '../ui/Icon';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

// Section « commentaires » d'une publication.
export default function CommentList({ postId }) {
  const { comments, loading, refetch } = useComments(postId);
  const totalVisible = countVisible(comments);

  return (
    <section className="mt-14">
      <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
        <Icon name="reply" size={20} className="text-lilac-400" />
        Commentaires
        {totalVisible > 0 && (
          <span className="text-base font-normal text-ink-soft">({totalVisible})</span>
        )}
      </h2>

      <div className="mt-5 card p-5">
        <CommentForm postId={postId} onDone={refetch} />
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <Spinner label="Chargement des commentaires…" />
        ) : comments.length === 0 ? (
          <EmptyState
            title="Aucun commentaire pour l'instant"
            hint="Soyez la première personne à laisser un mot."
            icon="✎"
          />
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} postId={postId} onChange={refetch} />
          ))
        )}
      </div>
    </section>
  );
}

// Compte les commentaires visibles (non masqués) en profondeur.
function countVisible(list) {
  return list.reduce((n, c) => {
    const self = c.hidden ? 0 : 1;
    return n + self + countVisible(c.replies || []);
  }, 0);
}
