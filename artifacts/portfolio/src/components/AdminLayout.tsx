import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, User, FolderGit2, CalendarRange, Inbox, Bot, LogOut, ChevronLeft, Menu, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListSecurityAlerts, useGetAiDashboardSummary, getGetAiDashboardSummaryQueryKey, getListSecurityAlertsQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logo from "@/assets/logo.png";

const SUMMARY_SESSION_KEY = "admin-ai-summary-shown";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut, user, isLoaded } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: securityAlerts } = useListSecurityAlerts({ query: { enabled: isLoaded && Boolean(user), queryKey: getListSecurityAlertsQueryKey() } });
  const alertCount = securityAlerts?.length ?? 0;

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { data: aiSummary, isLoading: isSummaryLoading, refetch: fetchSummary } = useGetAiDashboardSummary({ query: { enabled: false, queryKey: getGetAiDashboardSummaryQueryKey() } });

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (sessionStorage.getItem(SUMMARY_SESSION_KEY)) return;
    sessionStorage.setItem(SUMMARY_SESSION_KEY, "1");
    setIsSummaryOpen(true);
    fetchSummary();
  }, [isLoaded, user, fetchSummary]);

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/profile", label: "Profile", icon: User },
    { href: "/admin/projects", label: "Projects", icon: FolderGit2 },
    { href: "/admin/timeline", label: "Timeline", icon: CalendarRange },
    { href: "/admin/messages", label: "Messages", icon: Inbox },
    { href: "/admin/ai", label: "AI Assistant", icon: Bot },
    { href: "/admin/security", label: "Messages & Urgences", icon: ShieldAlert, badge: alertCount > 0 ? alertCount : undefined },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 border-b border-white/[0.05] flex items-center justify-between px-4"
        style={{ background: "rgba(2,2,2,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Perfect Dev" className="h-11 w-auto object-contain" />
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-60 flex flex-col transition-all duration-300 border-r border-white/[0.05]
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `} style={{ background: "rgba(2,2,2,0.95)", backdropFilter: "blur(24px)" }}>
        {/* Logo */}
        <div className="h-16 hidden md:flex items-center px-5 border-b border-white/[0.05]">
          <img src={logo} alt="Perfect Dev" className="h-12 w-auto object-contain" />
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-0.5">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href} className="w-full" onClick={() => setIsSidebarOpen(false)}>
                <span className={`
                  relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium overflow-hidden
                  ${isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }
                `}>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "rgba(var(--primary-rgb, 178 213 229) / 0.12)", border: "1px solid rgba(var(--primary-rgb, 178 213 229) / 0.2)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <link.icon size={16} className={`relative z-10 ${isActive ? "text-primary" : ""}`} />
                  <span className="flex-1 relative z-10">{link.label}</span>
                  {"badge" in link && link.badge !== undefined && (
                    <span className="relative z-10 ml-auto bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User + actions */}
        <div className="p-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            {user?.picture ? (
              <img src={user.picture} alt={user.name || "User"} className="w-7 h-7 rounded-full ring-1 ring-primary/30" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {user?.name?.[0] ?? user?.email?.[0] ?? "A"}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold leading-none truncate">{user?.name ?? user?.email}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 truncate">{user?.email}</span>
            </div>
          </div>
          <Link href="/" className="w-full" onClick={() => setIsSidebarOpen(false)}>
            <span className="flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04]">
              <ChevronLeft size={15} />Back to Site
            </span>
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors text-sm font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/[0.06]"
          >
            <LogOut size={15} />Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-14 md:pt-0">
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="max-w-lg border-white/[0.08]" style={{ background: "rgba(12,12,15,0.95)", backdropFilter: "blur(24px)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Résumé IA de votre tableau de bord
            </DialogTitle>
            <DialogDescription>Analyse automatique de l'activité récente de votre site.</DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            {isSummaryLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground/60 py-6">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours...
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">{aiSummary?.reply}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
