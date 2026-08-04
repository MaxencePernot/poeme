export default function EmptyState({ title, hint, icon = '✽' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-lilac-200 bg-white/40 py-16 text-center">
      <span className="text-2xl text-lilac-300" aria-hidden>{icon}</span>
      <p className="font-display text-lg text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}
