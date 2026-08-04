import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { newsletterApi } from '../hooks/useNewsletter';
import Seo from '../components/ui/Seo';
import Spinner from '../components/ui/Spinner';
import Icon from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

// Profil simple : nom affiché, préférence newsletter, mot de passe, session.
export default function Profile() {
  const {
    user, profile, isAdmin, loading,
    updateProfile, requestPasswordReset, signOut,
  } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingNews, setSavingNews] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || '');
      setNewsletter(Boolean(profile.subscribed_newsletter));
    }
  }, [profile]);

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/connexion" replace />;

  const saveName = async () => {
    setSavingName(true);
    const { error } = await updateProfile({ display_name: name.trim().slice(0, 60) });
    setSavingName(false);
    toast(error ? error.message : 'Nom mis à jour.', error ? 'error' : 'success');
  };

  const toggleNewsletter = async () => {
    const next = !newsletter;
    setNewsletter(next);
    setSavingNews(true);
    // Met à jour la préférence ET la liste d'adresses.
    await updateProfile({ subscribed_newsletter: next });
    if (next) await newsletterApi.subscribe(user.email);
    else await newsletterApi.unsubscribe(user.email);
    setSavingNews(false);
    toast(next ? 'Inscrit·e à la newsletter.' : 'Désinscrit·e de la newsletter.', 'success');
  };

  const changePassword = async () => {
    const { error } = await requestPasswordReset(user.email);
    toast(
      error ? error.message : 'Un lien de changement de mot de passe vous a été envoyé.',
      error ? 'error' : 'success'
    );
  };

  const logout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <Seo title="Mon compte" path="/profil" noindex />

      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-lilac-100 to-sage-100 font-display text-2xl text-lilac-500">
          {(profile?.display_name || user.email).charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl text-ink">Mon compte</h1>
          <p className="text-sm text-ink-soft">{user.email}</p>
        </div>
      </div>

      {isAdmin && (
        <Link to="/admin" className="btn-outline mt-6 w-full">
          <Icon name="lock" size={16} /> Accéder à l'administration
        </Link>
      )}

      {/* Nom affiché */}
      <div className="card mt-6 space-y-3 p-5">
        <label className="block text-sm font-medium text-ink">Nom affiché</label>
        <div className="flex gap-2">
          <input className="field flex-1" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          <button onClick={saveName} disabled={savingName} className="btn-primary">
            {savingName ? '…' : 'Enregistrer'}
          </button>
        </div>
        <p className="text-xs text-ink-soft">C'est ce nom qui apparaît sur vos commentaires et partages.</p>
      </div>

      {/* Newsletter */}
      <div className="card mt-4 p-5">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-medium text-ink">Newsletter</span>
            <span className="block text-xs text-ink-soft">Recevoir les nouveautés par e-mail.</span>
          </span>
          <input
            type="checkbox"
            checked={newsletter}
            disabled={savingNews}
            onChange={toggleNewsletter}
            className="h-5 w-5 accent-lilac-400"
          />
        </label>
      </div>

      {/* Sécurité / session */}
      <div className="mt-4 flex flex-col gap-2">
        <button onClick={changePassword} className="btn-ghost justify-start !px-3">
          <Icon name="lock" size={16} /> Changer mon mot de passe
        </button>
        <button onClick={logout} className="btn-ghost justify-start !px-3 text-rose-400 hover:text-rose-500">
          <Icon name="logout" size={16} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}
