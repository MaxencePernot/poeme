import { useSubscribers, newsletterApi } from '../../hooks/useNewsletter';
import { formatDate } from '../../lib/utils';
import Seo from '../../components/ui/Seo';
import AdminShell from '../../components/admin/AdminShell';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import { useToast } from '../../components/ui/Toast';

export default function AdminSubscribers() {
  const { subscribers, loading, refetch } = useSubscribers();
  const toast = useToast();

  // Génère un fichier CSV téléchargeable (ouvrable dans Excel) avec les e-mails.
  const exportCsv = () => {
    const header = 'email,inscrit_le\n';
    const rows = subscribers
      .map((s) => `${s.email},${new Date(s.created_at).toISOString()}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abonnes-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(', '));
      toast('Toutes les adresses ont été copiées.', 'success');
    } catch {
      toast('Impossible de copier.', 'error');
    }
  };

  const remove = async (s) => {
    if (!confirm(`Retirer ${s.email} de la liste ?`)) return;
    const { error } = await newsletterApi.remove(s.id);
    if (error) return toast(error.message, 'error');
    toast('Abonné retiré.', 'success');
    refetch();
  };

  return (
    <AdminShell title="Abonnés à la newsletter">
      <Seo title="Abonnés" noindex />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {subscribers.length} adresse{subscribers.length > 1 ? 's' : ''} collectée{subscribers.length > 1 ? 's' : ''}.
          Vous gérez l'envoi de votre côté, avec l'outil de votre choix.
        </p>
        {subscribers.length > 0 && (
          <div className="flex gap-2">
            <button onClick={copyAll} className="btn-outline !py-1.5 text-sm">Copier les e-mails</button>
            <button onClick={exportCsv} className="btn-primary !py-1.5 text-sm">
              <Icon name="download" size={15} /> Exporter (CSV)
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : subscribers.length === 0 ? (
        <EmptyState title="Aucun abonné pour l'instant" hint="Les inscriptions apparaîtront ici." icon="✉" />
      ) : (
        <div className="card divide-y divide-lilac-50">
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{s.email}</p>
                <p className="text-xs text-ink-soft">Inscrit le {formatDate(s.created_at)}</p>
              </div>
              <button onClick={() => remove(s)} className="btn-ghost !px-2 !py-1.5 text-rose-400 hover:text-rose-500" title="Retirer">
                <Icon name="trash" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
