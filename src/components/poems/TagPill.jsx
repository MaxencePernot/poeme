import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

export default function TagPill({ tag, to }) {
  const content = (
    <span className="inline-flex items-center gap-1 rounded-full bg-lilac-50 px-3 py-1 text-xs text-lilac-500 transition-colors hover:bg-lilac-100">
      <Icon name="tag" size={12} />
      {tag}
    </span>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}
