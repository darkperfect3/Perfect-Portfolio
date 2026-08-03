import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";
import { logSecurityAttempt } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AuthProvider, useAuth, isGoogleAuthConfigured, authConfigErrorMessage, isAdminEmail } from "@/lib/auth";

import { Layout } from "@/components/Layout";
import { AdminLayout } from "@/components/AdminLayout";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Timeline from "@/pages/Timeline";
import Contact from "@/pages/Contact";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProfile from "@/pages/admin/Profile";
import AdminProjects from "@/pages/admin/Projects";
import AdminTimeline from "@/pages/admin/Timeline";
import AdminMessages from "@/pages/admin/Messages";
import AdminAi from "@/pages/admin/Ai";
import AdminSecurityAlerts from "@/pages/admin/SecurityAlerts";
import NotFound from "@/pages/not-found";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function SignInPage() {
  const { user, isLoaded, hasError } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && user) {
      setLocation("/admin");
    }
  }, [user, isLoaded, setLocation]);

  const isGoogleAvailable = typeof window !== "undefined" && Boolean(window.google?.accounts?.id);

  const handleSignIn = useCallback(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="relative z-10 max-w-md w-full text-center p-8 rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Admin Sign In</h1>
          <p className="mt-3 text-sm text-muted-foreground/80">Connectez-vous avec votre compte Google autorisé pour accéder au tableau de bord privé.</p>
        </div>

        {hasError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Impossible de charger Google Auth. {authConfigErrorMessage || "Vérifiez votre configuration"}.
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={!isLoaded}
            className="inline-flex items-center justify-center w-full rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoaded ? "Se connecter avec Google" : "Chargement de l'authentification..."}
          </button>
        )}

        <div className="mt-6 text-xs text-muted-foreground/70">
          {isGoogleAuthConfigured ? (
            "Vous serez redirigé(e) après l'authentification Google."
          ) : (
            "Google OAuth 2.0 n'est pas configuré. Ajoutez VITE_GOOGLE_CLIENT_ID à votre environnement."
          )}
        </div>
      </div>
    </div>
  );
}

function SignUpPage() {
  return <SignInPage />;
}

function SignOutRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/sign-in");
  }, [setLocation]);
  return null;
}

function AccessDeniedPopup({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="bg-card border border-destructive/40 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-destructive/10 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/20">
          <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
          </svg>
        </div>
        <h2 className="text-xl font-heading font-bold text-destructive mb-2">Accès Refusé</h2>
        <p className="text-muted-foreground text-sm mb-1">
          Le compte <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">{email}</span> n'est pas autorisé à accéder à l'interface admin.
        </p>
        <p className="text-xs text-muted-foreground/60 mb-6 mt-2">
          Cette tentative a été enregistrée et signalée à l'administrateur.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function AdminGuard({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoaded, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);
  const loggedRef = useRef(false);

  const handleDeny = useCallback(async (email: string) => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    try {
      await logSecurityAttempt({
        attemptedEmail: email,
        attemptedPassword: "N/A (Google OAuth)",
      });
    } catch {
      // silent
    }
    setDeniedEmail(email);
    signOut();
  }, [signOut]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;
    if (!isAdminEmail(user.email)) {
      handleDeny(user.email);
    }
  }, [user, isLoaded, handleDeny]);

  if (!isLoaded) {
    return <LoadingScreen progress={0} />;
  }

  if (!user) {
    return <SignOutRedirect />;
  }

  if (deniedEmail) {
    return (
      <AccessDeniedPopup
        email={deniedEmail}
        onClose={() => {
          setDeniedEmail(null);
          loggedRef.current = false;
          setLocation("/sign-in");
        }}
      />
    );
  }

  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function RouteLoadingScreen() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    let rafId: number;
    let hideTimeout: ReturnType<typeof setTimeout>;
    const duration = isFirstLoad.current ? 1700 : 950;
    const start = performance.now();

    setIsLoading(true);
    setProgress(0);

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        hideTimeout = setTimeout(() => setIsLoading(false), 220);
        isFirstLoad.current = false;
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(hideTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (!isLoading) return null;
  return <LoadingScreen progress={progress} />;
}

function AppRoutes() {
  if (!isGoogleAuthConfigured) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6">
        <div className="max-w-xl text-center bg-card border border-border rounded-2xl p-8">
          <h2 className="text-lg font-heading font-bold mb-2">Configuration Google OAuth manquante</h2>
          <p className="text-sm text-muted-foreground/70 mb-4">La variable d'environnement <code>VITE_GOOGLE_CLIENT_ID</code> n'est pas configurée pour Google OAuth 2.0.</p>
          <p className="text-xs text-muted-foreground/50">Ajoutez-la à votre environnement de build et rechargez l'application.</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouteLoadingScreen />
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />

        {/* Admin Routes */}
        <Route path="/admin">
          <AdminGuard component={AdminDashboard} />
        </Route>
        <Route path="/admin/profile">
          <AdminGuard component={AdminProfile} />
        </Route>
        <Route path="/admin/projects">
          <AdminGuard component={AdminProjects} />
        </Route>
        <Route path="/admin/timeline">
          <AdminGuard component={AdminTimeline} />
        </Route>
        <Route path="/admin/messages">
          <AdminGuard component={AdminMessages} />
        </Route>
        <Route path="/admin/ai">
          <AdminGuard component={AdminAi} />
        </Route>
        <Route path="/admin/security">
          <AdminGuard component={AdminSecurityAlerts} />
        </Route>

        {/* Public Routes */}
        <Route path="/">
          <Layout>
            <Home />
          </Layout>
        </Route>
        <Route path="/projects">
          <Layout>
            <Projects />
          </Layout>
        </Route>
        <Route path="/projects/:id">
          <Layout>
            <ProjectDetail />
          </Layout>
        </Route>
        <Route path="/timeline">
          <Layout>
            <Timeline />
          </Layout>
        </Route>
        <Route path="/contact">
          <Layout>
            <Contact />
          </Layout>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <WouterRouter base={basePath}>
          <AppRoutes />
        </WouterRouter>
      </AuthProvider>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
