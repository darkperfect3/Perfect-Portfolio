import { useListTimeline } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Trophy, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

const typeConfig = {
  work: { icon: Briefcase, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  education: { icon: GraduationCap, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  achievement: { icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  default: { icon: Calendar, color: "text-muted-foreground", bg: "bg-secondary/50 border-border" },
};

export default function Timeline() {
  const { data: timeline, isLoading } = useListTimeline();

  return (
    <div className="w-full pb-32">
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20"
          >
            <p className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-5">Experience</p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold tracking-tight mb-5">Journey</h1>
            <p className="text-lg md:text-xl text-muted-foreground/70 leading-relaxed max-w-2xl">
              The path that led me here — professional milestones, education, and achievements.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2"
              style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 10%, rgba(255,255,255,0.08) 90%, transparent)" }} />

            {isLoading ? (
              <div className="space-y-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-8 w-full animate-pulse">
                    <div className="hidden md:block w-1/2" />
                    <div className="h-32 rounded-3xl w-full md:w-1/2" style={{ background: "rgba(255,255,255,0.03)" }} />
                  </div>
                ))}
              </div>
            ) : timeline && timeline.length > 0 ? (
              <div className="space-y-10">
                {timeline.map((entry, index) => {
                  const isEven = index % 2 === 0;
                  const dateStr = entry.endDate
                    ? `${format(parseISO(entry.startDate), "MMM yyyy")} — ${format(parseISO(entry.endDate), "MMM yyyy")}`
                    : `${format(parseISO(entry.startDate), "MMM yyyy")} — Present`;

                  const cfg = typeConfig[entry.type as keyof typeof typeConfig] ?? typeConfig.default;
                  const Icon = cfg.icon;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className={`relative flex flex-col md:flex-row gap-0 md:gap-12 w-full items-start ${isEven ? "md:flex-row-reverse" : ""}`}
                    >
                      {/* Dot */}
                      <div className={`absolute left-6 md:left-1/2 top-7 w-12 h-12 rounded-2xl border flex items-center justify-center transform -translate-x-1/2 z-10 shadow-lg ${cfg.bg}`}
                        style={{ backdropFilter: "blur(12px)" }}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>

                      <div className="hidden md:block w-1/2 flex-shrink-0" />

                      {/* Card */}
                      <div className={`w-full pl-16 md:pl-0 md:w-1/2 flex-shrink-0 ${isEven ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          className="group p-6 md:p-7 rounded-3xl border border-white/[0.07] transition-all duration-300 hover:border-primary/20 shadow-xl shadow-black/20"
                          style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)" }}
                        >
                          <div className={`flex items-center gap-2 mb-3 ${isEven ? "md:justify-end" : ""}`}>
                            <span className={`inline-block text-xs font-mono uppercase tracking-wider ${cfg.color}`}>{dateStr}</span>
                          </div>
                          <h3 className="text-xl font-heading font-bold mb-1 group-hover:text-primary transition-colors duration-200">{entry.title}</h3>
                          <h4 className="text-sm font-medium text-foreground/60 mb-4">{entry.organization}</h4>
                          <p className="text-muted-foreground/70 leading-relaxed whitespace-pre-wrap text-sm">{entry.description}</p>
                          {entry.current && (
                            <div className={`flex items-center gap-1.5 mt-4 ${isEven ? "md:justify-end" : ""}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-xs text-primary font-medium">Current</span>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center relative z-10">
                <p className="text-muted-foreground/60">No timeline entries found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
