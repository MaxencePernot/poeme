import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import BookForm from '../../components/admin/BookForm';

export default function BookNew() {
  return (
    <AdminShell title="Nouveau livre">
      <Seo title="Nouveau livre" noindex />
      <BookForm />
    </AdminShell>
  );
}
