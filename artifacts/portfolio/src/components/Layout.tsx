import { Link, useLocation } from "wouter";
import { Show } from "@clerk/react";
import { useTrackPageView } from "@workspace/api-client-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { ChatWidget } from "@/components/ChatWidget";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const trackPageView = useTrackPageView();

  useEffect(() => {
    trackPageView.mutate({
      data: { page: location, referrer: document.referrer || null },
    });
  }, [location]);

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary/30 selection:text-primary">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05]"
        style={{ background: "rgba(var(--background-rgb, 2 2 2) / 0.75)", backdropFilter: "blur(24px) saturate(180%)" }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img src={logo} alt="Perfect Dev" className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-200" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={location === "/"}>Home</NavLink>
            <NavLink href="/projects" active={location.startsWith("/projects")}>Work</NavLink>
            <NavLink href="/timeline" active={location === "/timeline"}>Journey</NavLink>
            <NavLink href="/contact" active={location === "/contact"}>Contact</NavLink>
            <Show when="signed-in">
              <Link href="/admin"
                className="ml-3 text-sm font-medium px-4 py-2 rounded-full border border-primary/25 text-primary hover:bg-primary/10 transition-all duration-200">
                Dashboard
              </Link>
            </Show>
          </nav>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} /></motion.div>
                : <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={22} /></motion.div>
              }
            </AnimatePresence>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 pt-20 md:hidden"
            style={{ background: "rgba(2,2,2,0.96)", backdropFilter: "blur(24px)" }}
          >
            <nav className="flex flex-col gap-1 p-6 pt-8">
              {[
                { href: "/", label: "Home", active: location === "/" },
                { href: "/projects", label: "Work", active: location.startsWith("/projects") },
                { href: "/timeline", label: "Journey", active: location === "/timeline" },
                { href: "/contact", label: "Contact", active: location === "/contact" },
              ].map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.2 }}>
                  <Link href={item.href} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-lg font-heading font-semibold transition-colors ${item.active ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-white/5"}`}>
                    {item.active && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Show when="signed-in">
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <Link href="/admin" className="flex items-center px-4 py-3.5 rounded-2xl text-lg font-heading font-semibold text-primary hover:bg-primary/10 transition-colors mt-4">
                    Dashboard →
                  </Link>
                </motion.div>
              </Show>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-24 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Perfect Dev" className="h-11 w-auto object-contain opacity-90" />
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Perfect|Dev. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {[["Home", "/"], ["Work", "/projects"], ["Journey", "/timeline"], ["Contact", "/contact"]].map(([label, href]) => (
              <Link key={href} href={href} className="text-muted-foreground/60 hover:text-muted-foreground text-sm transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5 group">
      <span className={active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80 transition-colors"}>
        {children}
      </span>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 rounded-full bg-white/[0.06] border border-white/[0.08]"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
    </Link>
  );
}
