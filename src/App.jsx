import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { isSupabaseConfigured } from './lib/supabase';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import Spinner from './components/ui/Spinner';
import SetupNotice from './components/ui/SetupNotice';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Pages publiques : chargées immédiatement (cœur de l'expérience).
import Home from './pages/Home';
import Poems from './pages/Poems';
import PoemDetail from './pages/PoemDetail';
import Gallery from './pages/Gallery';
import Guestbook from './pages/Guestbook';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// « À propos » et l'administration sont chargées à la demande : elles
// embarquent l'éditeur riche, qu'on garde hors du chargement initial.
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminPosts = lazy(() => import('./pages/admin/Posts'));
const PostNew = lazy(() => import('./pages/admin/PostNew'));
const PostEdit = lazy(() => import('./pages/admin/PostEdit'));
const AdminComments = lazy(() => import('./pages/admin/Comments'));

export default function App() {
  // Si le fichier .env n'est pas configuré, on guide plutôt que d'afficher
  // un écran blanc et des erreurs réseau.
  if (!isSupabaseConfigured) {
    return (
      <Layout>
        <SetupNotice />
      </Layout>
    );
  }

  return (
    <ToastProvider>
      <Layout>
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/poemes" element={<Poems />} />
            <Route path="/poeme/:slug" element={<PoemDetail />} />
            <Route path="/galerie" element={<Gallery />} />
            <Route path="/livre-d-or" element={<Guestbook />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/connexion" element={<Login />} />

            {/* Administration (protégée) */}
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/publications" element={<ProtectedRoute><AdminPosts /></ProtectedRoute>} />
            <Route path="/admin/publications/nouvelle" element={<ProtectedRoute><PostNew /></ProtectedRoute>} />
            <Route path="/admin/publications/:id" element={<ProtectedRoute><PostEdit /></ProtectedRoute>} />
            <Route path="/admin/commentaires" element={<ProtectedRoute><AdminComments /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </ToastProvider>
  );
}
