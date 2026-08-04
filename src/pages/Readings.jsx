import { useReadings } from '../hooks/useReadings';
import Seo from '../components/ui/Seo';
import PageHeader from '../components/ui/PageHeader';
import Reveal from '../components/ui/Reveal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ReadingCard from '../components/readings/ReadingCard';

// Section « Lectures » : les livres lus et recommandés.
export default function Readings() {
  const { readings, loading } = useReadings();

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <Seo
        title="Lectures"
        path="/lectures"
        description="Les livres que j'ai lus, aimés et que je vous recommande."
      />

      <PageHeader
        eyebrow="Bibliothèque"
        title="Lectures"
        subtitle="Les livres qui m'ont marquée, avec mes impressions et quelques passages choisis."
      />

      <div className="mt-12">
        {loading ? (
          <Spinner />
        ) : readings.length === 0 ? (
          <EmptyState
            title="Aucune lecture pour l'instant"
            hint="Les prochaines recommandations apparaîtront ici."
            icon="❦"
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {readings.map((r, i) => (
              <Reveal key={r.id} delay={(i % 4) * 70}>
                <ReadingCard reading={r} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
