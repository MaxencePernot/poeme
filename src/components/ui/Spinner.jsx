export default function Spinner({ label = 'Chargement…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-soft">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-lilac-200 border-t-lilac-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
