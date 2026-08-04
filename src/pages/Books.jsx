import { useBooks } from '../hooks/useBooks';
import Seo from '../components/ui/Seo';
import PageHeader from '../components/ui/PageHeader';
import Reveal from '../components/ui/Reveal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import BookCard from '../components/books/BookCard';

// Section « Livres publiés » : mon livre et ceux que je mets en avant.
export default function Books() {
  const { books, loading } = useBooks();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Seo
        title="Livres publiés"
        path="/livres"
        description="Mon livre et une sélection d'ouvrages à découvrir et à soutenir."
      />

      <PageHeader
        eyebrow="À découvrir"
        title="Livres publiés"
        subtitle="Mon livre et quelques ouvrages que j'ai à cœur de vous faire connaître."
      />

      <div className="mt-12">
        {loading ? (
          <Spinner />
        ) : books.length === 0 ? (
          <EmptyState
            title="Aucun livre pour l'instant"
            hint="Les ouvrages présentés apparaîtront ici."
            icon="📖"
          />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((b, i) => (
              <Reveal key={b.id} delay={(i % 4) * 60}>
                <BookCard book={b} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
