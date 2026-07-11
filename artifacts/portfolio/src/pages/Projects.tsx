import { useListProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Projects() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: allProjects, isLoading } = useListProjects();

  const categories = allProjects ? [...new Set(allProjects.map((p) => p.category))].sort() : [];
  const projects = category ? allProjects?.filter((p) => p.category === category) : allProjects;

  return (
    <div className="w-full pb-32">
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mb-16"
          >
            <p className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-5">Portfolio</p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold tracking-tight mb-5">Work</h1>
            <p className="text-lg md:text-xl text-muted-foreground/70 leading-relaxed">
              A comprehensive view of my technical projects, experiments, and open-source contributions.
            </p>
          </motion.div>

          {/* Filter pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-2 mb-16"
          >
            {[undefined, ...categories].map((c) => {
              const active = category === c;
              return (
                <button
                  key={c ?? "all"}
                  onClick={() => setCategory(c)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.04]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-active"
                      className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative">{c ?? "All Projects"}</span>
                </button>
              );
            })}
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-3xl overflow-hidden border border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="aspect-[4/3] bg-white/5" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-white/5 rounded w-1/4" />
                    <div className="h-5 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 28 } }}
                    className="group"
                  >
                    <Link href={`/projects/${project.id}`} className="block h-full">
                      <div className="h-full rounded-3xl overflow-hidden border border-white/[0.07] shadow-xl shadow-black/30 transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-primary/5 flex flex-col"
                        style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)" }}>
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/20">
                          {project.imageUrl ? (
                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-heading font-bold text-4xl text-muted-foreground/15"
                              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}>
                              {project.title.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1.5 group-hover:translate-y-0"
                            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                            <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                          </div>
                        </div>
                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-mono text-primary uppercase tracking-wider">{project.category}</span>
                          </div>
                          <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-primary transition-colors duration-200 leading-snug">{project.title}</h3>
                          <p className="text-muted-foreground/65 text-sm line-clamp-2 mb-5 leading-relaxed flex-1">{project.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {project.technologies.slice(0, 3).map(tech => (
                              <span key={tech} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-muted-foreground/60">
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-muted-foreground/60">
                                +{project.technologies.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <div className="py-32 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mb-6 text-3xl">🔍</div>
              <h3 className="text-2xl font-heading font-bold mb-2">No projects found</h3>
              <p className="text-muted-foreground/70 max-w-md">Try adjusting your filters or check back later.</p>
              {category && (
                <button onClick={() => setCategory(undefined)}
                  className="mt-8 px-6 py-2.5 rounded-full text-sm font-medium border border-white/[0.08] hover:border-primary/30 hover:text-primary transition-all">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
