import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import ReadingForm from '../../components/admin/ReadingForm';

export default function ReadingNew() {
  return (
    <AdminShell title="Nouvelle lecture">
      <Seo title="Nouvelle lecture" noindex />
      <ReadingForm />
    </AdminShell>
  );
}
