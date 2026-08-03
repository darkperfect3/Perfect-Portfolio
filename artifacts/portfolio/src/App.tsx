import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { dark } from "@clerk/themes";
import { useEffect, useRef, useState, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { logSecurityAttempt } from "@workspace/api-client-react";
import { LoadingScreen } from "@/components/LoadingScreen";

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

const ADMIN_EMAIL = "officialperfectdev@gmail.com";

const clerkPubKey = (
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
  import.meta.env.CLERK_PUBLISHABLE_KEY
)?.trim();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// Clerk will be loaded from the CDN by default; proxy support removed.

const clerkKeyIsDev =
  clerkPubKey?.startsWith("pk_test_") || clerkPubKey?.startsWith("pk_local_");

// Do not throw here - prefer a graceful runtime fallback so the site can
// render an actionable error UI instead of crashing the whole bundle.
const missingClerkKey = !clerkPubKey;
/*
// TODO: réactiver cette vérification une fois la clé pk_live_ configurée en production
if (import.meta.env.PROD && clerkKeyIsDev) {
  console.error(
    "Clerk is configured with a development publishable key in production. " +
      "Set VITE_CLERK_PUBLISHABLE_KEY or CLERK_PUBLISHABLE_KEY to a production/live Clerk key (pk_live_...) in your hosting environment.",
  );
}
*/

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(190 90% 50%)",
    colorForeground: "hsl(210 20% 98%)",
    colorMutedForeground: "hsl(210 20% 60%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(220 20% 4%)",
    colorInput: "hsl(220 20% 10%)",
    colorInputForeground: "hsl(210 20% 98%)",
    colorNeutral: "hsl(220 20% 10%)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden border border-border shadow-2xl shadow-primary/10",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-heading text-2xl font-bold tracking-tight text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:text-primary/80 transition-colors font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/80 transition-colors",
    formFieldSuccessText: "text-green-500",
    alertText: "text-foreground",
    logoBox: "justify-center mb-4",
    logoImage: "w-12 h-12",
    socialButtonsBlockButton: "border-border bg-background hover:bg-secondary/50 transition-colors",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold",
    formFieldInput: "bg-input border-border text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
    footerAction: "pt-6 pb-2",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive text-destructive-foreground",
    otpCodeFieldInput: "bg-input border-border text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
    formFieldRow: "mb-4",
    main: "flex flex-col gap-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="relative z-10">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="relative z-10">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
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
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
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
    await signOut();
  }, [signOut]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      handleDeny(email);
    }
  }, [user, isLoaded, handleDeny]);

  if (!isLoaded) {
    return <LoadingScreen />;
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

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  if (missingClerkKey) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6">
        <div className="max-w-xl text-center bg-card border border-border rounded-2xl p-8">
          <h2 className="text-lg font-heading font-bold mb-2">Clerk configuration manquante</h2>
          <p className="text-sm text-muted-foreground/70 mb-4">La clé publique Clerk n'est pas définie lors de la compilation. Définissez `CLERK_PUBLISHABLE_KEY` ou `VITE_CLERK_PUBLISHABLE_KEY` dans les variables d'environnement de votre service (Netlify / Render) puis rebuild le site.</p>
          <p className="text-xs text-muted-foreground/50">Si vous êtes en environnement de production, utilisez une clé publique de production commençant par <span className="font-mono">pk_live_</span>.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Studio Access",
            subtitle: "Enter your credentials to continue",
          },
        },
        signUp: {
          start: {
            title: "Join Studio",
            subtitle: "Create your creator account",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
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
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
