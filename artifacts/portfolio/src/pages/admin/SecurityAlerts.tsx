import { useListSecurityAlerts, getListSecurityAlertsQueryKey } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { format, parseISO } from "date-fns";
import { ShieldAlert, ShieldX, ShieldCheck, Monitor, Mail, KeyRound, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSecurityAlerts() {
  const { user, isLoaded } = useUser();
  const { data: alerts, isLoading } = useListSecurityAlerts({ query: { enabled: isLoaded && Boolean(user), queryKey: getListSecurityAlertsQueryKey() } });

  return (
    <div className="space-y-8 pb-10 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Messages & Urgences</h1>
          </div>
          <p className="text-sm text-muted-foreground/60 ml-[52px]">Tentatives d'accès non autorisées à l'interface admin.</p>
        </div>

        {alerts && alerts.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 self-start">
            <ShieldX className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-rose-400">{alerts.length} tentative{alerts.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)" }} />
          ))}
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-rose-500/20 overflow-hidden shadow-xl shadow-black/20"
              style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(16px)" }}
            >
              {/* Header stripe */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-rose-500/15"
                style={{ background: "rgba(244,63,94,0.06)" }}>
                <ShieldX className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="text-xs font-mono text-rose-400 font-semibold uppercase tracking-wider flex-1">
                  Accès refusé — Tentative #{alert.id}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50 font-mono">
                  <Clock className="w-3 h-3" />
                  {format(parseISO(alert.createdAt), "dd/MM/yyyy · HH:mm:ss")}
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/40 uppercase tracking-wider mb-2">
                    <Mail className="w-3.5 h-3.5" /> Email utilisé
                  </div>
                  <div className="font-mono text-sm px-3 py-2.5 rounded-xl border border-white/[0.07] text-foreground/80 break-all"
                    style={{ background: "rgba(255,255,255,0.04)" }}>
                    {alert.attemptedEmail}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/40 uppercase tracking-wider mb-2">
                    <KeyRound className="w-3.5 h-3.5" /> Méthode
                  </div>
                  <div className="font-mono text-sm px-3 py-2.5 rounded-xl border border-rose-500/15 text-rose-300/70 break-all"
                    style={{ background: "rgba(244,63,94,0.05)" }}>
                    {alert.attemptedPassword}
                  </div>
                </div>

                {(alert.ipAddress || alert.userAgent) && (
                  <div className="md:col-span-2 pt-4 border-t border-white/[0.05] space-y-2">
                    {alert.ipAddress && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground/40 font-mono w-6">IP</span>
                        <span className="font-mono text-foreground/60 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">{alert.ipAddress}</span>
                      </div>
                    )}
                    {alert.userAgent && (
                      <div className="flex items-start gap-2 text-xs">
                        <Monitor className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                        <span className="font-mono text-muted-foreground/40 break-all leading-relaxed">{alert.userAgent}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center rounded-3xl border border-dashed border-white/[0.07] flex flex-col items-center">
          <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-heading font-bold mb-2">Tout est calme</h3>
          <p className="text-sm text-muted-foreground/50">Aucun accès non autorisé détecté.</p>
        </div>
      )}
    </div>
  );
}
