import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

// Empêche l'accès aux pages d'administration sans session valide.
// La véritable protection reste côté serveur (RLS) : ceci n'est qu'une
// commodité d'interface pour rediriger vers la page de connexion.
export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Vérification de la session…" />;
  if (!isAdmin)
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;

  return children;
}
