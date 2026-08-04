import { useReveal } from '../../hooks/useReveal';

// Enveloppe un contenu qui apparaît en fondu ascendant à l'entrée dans l'écran.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
