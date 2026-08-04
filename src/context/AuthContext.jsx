import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Fournit l'état d'authentification à toute l'application.
// - « utilisateur » : toute personne connectée (visiteur inscrit).
// - « admin » : déterminé côté serveur par la fonction sécurisée is_admin()
//   (et NON plus « toute personne connectée »).
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Récupère le profil + le statut admin de l'utilisateur courant.
  const loadUserExtras = useCallback(async (currentSession) => {
    if (!currentSession?.user) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const [{ data: prof }, { data: admin }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', currentSession.user.id).maybeSingle(),
      supabase.rpc('is_admin'),
    ]);
    setProfile(prof ?? null);
    setIsAdmin(Boolean(admin));
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      await loadUserExtras(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
      loadUserExtras(next ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadUserExtras]);

  const refreshProfile = useCallback(async () => {
    await loadUserExtras(session);
  }, [loadUserExtras, session]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isAdmin,
      loading,

      // Inscription : e-mail + mot de passe, nom affiché et choix newsletter
      // passés en métadonnées (repris par le trigger pour créer le profil).
      signUp: (email, password, displayName, newsletter) =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || '',
              subscribed_newsletter: Boolean(newsletter),
            },
          },
        }),

      signIn: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),

      signOut: () => supabase.auth.signOut(),

      // Demande d'e-mail de réinitialisation (lien vers la page dédiée).
      requestPasswordReset: (email) =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
        }),

      // Définit un nouveau mot de passe (après clic sur le lien de reset).
      updatePassword: (password) => supabase.auth.updateUser({ password }),

      // Met à jour le profil (nom affiché, préférence newsletter).
      updateProfile: async (patch) => {
        if (!session?.user) return { error: { message: 'Non connecté.' } };
        const res = await supabase
          .from('profiles')
          .update(patch)
          .eq('id', session.user.id);
        if (!res.error) await loadUserExtras(session);
        return res;
      },

      refreshProfile,
    }),
    [session, profile, isAdmin, loading, loadUserExtras, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
