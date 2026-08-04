import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import PostForm from '../../components/admin/PostForm';

export default function PostNew() {
  return (
    <AdminShell title="Nouvelle publication">
      <Seo title="Nouvelle publication" noindex />
      <PostForm />
    </AdminShell>
  );
}
