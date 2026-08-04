import Reveal from './Reveal';

// En-tête de section : eyebrow + titre serif + sous-titre.
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <Reveal as="p" className="eyebrow mb-3">{eyebrow}</Reveal>
      )}
      <Reveal as="h1" delay={80} className="font-display text-4xl leading-tight text-ink sm:text-5xl">
        {title}
      </Reveal>
      {subtitle && (
        <Reveal as="p" delay={160} className="mt-4 text-lg text-ink-soft">
          {subtitle}
        </Reveal>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
