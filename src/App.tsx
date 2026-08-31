import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AppBackground } from './components/AppBackground';
import { Loader2, Lock, ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

// Pages
import { Home } from './pages/Home';
import { StoriesPage } from './pages/StoriesPage';
import { GenresPage } from './pages/GenresPage';
import { TopReadsPage } from './pages/TopReadsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { UploadStoryPage } from './pages/UploadStoryPage';
import { StoryReaderPage } from './pages/StoryReaderPage';
import { PdfReaderPage } from './pages/PdfReaderPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  navigate: (route: string) => void;
  requiredRole?: 'admin' | 'author' | 'reader';
  redirectRoute?: string;
  fallbackMessage?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  navigate,
  requiredRole,
  redirectRoute = 'home',
  fallbackMessage,
}) => {
  const { currentUser, authReady, setShowAuthModal, setAuthModalMode, addToast } = useApp();

  useEffect(() => {
    if (!authReady) return;

    if (!currentUser) {
      addToast(
        fallbackMessage || 'Please sign in to access this page.',
        'warning'
      );
      setAuthModalMode('login');
      setShowAuthModal(true);
      navigate(redirectRoute);
      return;
    }

    if (requiredRole === 'admin' && currentUser.role !== 'admin') {
      addToast('Administrator privileges required to access this area.', 'error');
      navigate(redirectRoute);
      return;
    }
  }, [authReady, currentUser, requiredRole, navigate, redirectRoute, fallbackMessage, setShowAuthModal, setAuthModalMode, addToast]);

  // While checking initial auth state
  if (!authReady) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Verifying authentication session...</p>
      </div>
    );
  }

  // If not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#070b14]">
        <div className="max-w-md w-full bg-[#0b111e] border border-slate-800/80 rounded-2xl p-8 text-center space-y-5 shadow-2xl shadow-black/40">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif-heading text-slate-100 mb-1.5">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {fallbackMessage || 'You need to be signed in to access this section of StoryNest.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setShowAuthModal(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Continue
            </button>
            <button
              onClick={() => navigate(redirectRoute)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If role check fails
  if (requiredRole === 'admin' && currentUser.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#070b14]">
        <div className="max-w-md w-full bg-[#0b111e] border border-rose-500/30 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif-heading text-slate-100 mb-1.5">
              Admin Privileges Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account ({currentUser.email}) does not have administrative clearance for the moderation desk.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={() => navigate(redirectRoute)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  // Sync with browser URL hash if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash) {
        setCurrentRoute(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Dispatcher
  const renderCurrentPage = () => {
    // 1. Reader Route: 'read:storyId' or 'read:storyId:chapterId'
    if (currentRoute.startsWith('read:')) {
      const parts = currentRoute.split(':');
      const storyId = parts[1];
      const chapterId = parts[2];
      return (
        <StoryReaderPage
          storyId={storyId}
          initialChapterId={chapterId}
          navigate={navigate}
        />
      );
    }

    // 1b. PDF E-Reader Route: 'pdf-reader:storyId' or 'pdf-reader/storyId'
    if (currentRoute.startsWith('pdf-reader:') || currentRoute.startsWith('pdf-reader/')) {
      const separator = currentRoute.includes(':') ? ':' : '/';
      const parts = currentRoute.split(separator);
      const storyId = parts[1];
      return (
        <PdfReaderPage
          storyId={storyId}
          navigate={navigate}
        />
      );
    }

    // 2. Stories with initial genre: 'stories:Romance'
    if (currentRoute.startsWith('stories:')) {
      const genre = currentRoute.split(':')[1];
      return <StoriesPage navigate={navigate} initialGenre={genre} />;
    }

    // 3. Profile Routes: 'profile:username', 'profile:my-stories', 'user:userId', etc.
    if (currentRoute.startsWith('profile:') || currentRoute.startsWith('profile/') || currentRoute.startsWith('user:')) {
      const separator = currentRoute.includes(':') ? ':' : '/';
      const subroute = currentRoute.split(separator)[1];
      return <ProfilePage navigate={navigate} subroute={subroute} />;
    }

    // Standard Routes
    switch (currentRoute) {
      case 'home':
        return (
          <Home
            navigate={navigate}
            onOpenHowItWorks={() => setShowHowItWorks(true)}
          />
        );
      case 'stories':
        return <StoriesPage navigate={navigate} />;
      case 'genres':
        return <GenresPage navigate={navigate} />;
      case 'top-reads':
        return <TopReadsPage navigate={navigate} />;
      case 'about':
        return <AboutPage navigate={navigate} />;
      case 'contact':
        return <ContactPage navigate={navigate} />;
      case 'upload':
        return (
          <ProtectedRoute
            navigate={navigate}
            fallbackMessage="Please sign in to upload stories and publish your PDF manuscripts."
          >
            <UploadStoryPage navigate={navigate} />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute
            navigate={navigate}
            fallbackMessage="Please sign in to view your personal profile, bookmarks, and reading library."
          >
            <ProfilePage navigate={navigate} />
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute
            navigate={navigate}
            requiredRole="admin"
            fallbackMessage="Please sign in with administrator credentials to access the moderation console."
          >
            <AdminPage navigate={navigate} />
          </ProtectedRoute>
        );
      default:
        return (
          <Home
            navigate={navigate}
            onOpenHowItWorks={() => setShowHowItWorks(true)}
          />
        );
    }
  };

  // Check if we are on the reading page to adjust layout padding and footer
  const isReadingPage = currentRoute.startsWith('read:') || currentRoute.startsWith('pdf-reader:') || currentRoute.startsWith('pdf-reader/');

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans-ui selection:bg-amber-500/30 selection:text-amber-200">
      {/* Immersive Sunset & Lantern Reading Atmosphere Background */}
      <AppBackground isReadingPage={isReadingPage} />

      {/* Global Navigation Bar */}
      <div className="relative z-30">
        <Navbar currentRoute={currentRoute} navigate={navigate} />
      </div>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 w-full">{renderCurrentPage()}</main>

      {/* Global Footer (shown on all pages except reading room for immersive reading) */}
      {!isReadingPage && (
        <div className="relative z-20">
          <Footer navigate={navigate} />
        </div>
      )}

      {/* Toast Notifications */}
      <div className="relative z-50">
        <ToastContainer />
      </div>

      {/* Authentication Modal */}
      <AuthModal />

      {/* How It Works Walkthrough Modal */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        onExplore={() => navigate('stories')}
        onUpload={() => navigate('upload')}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
