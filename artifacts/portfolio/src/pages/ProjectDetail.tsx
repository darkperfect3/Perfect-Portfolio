import { useGetProject } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: project, isLoading, error } = useGetProject(id);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-3xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mb-6 text-3xl">🔍</div>
        <h2 className="text-3xl font-heading font-bold mb-4">Project not found</h2>
        <p className="text-muted-foreground/70 mb-8 max-w-sm">The project you're looking for doesn't exist or has been removed.</p>
        <Link href="/projects">
          <Button variant="outline" className="rounded-full gap-2 border-white/10 hover:border-primary/30">
            <ArrowLeft className="w-4 h-4" /> Back to projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="pb-32">
      {/* Hero */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground transition-colors mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to projects
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-wider">
                <Tag className="w-3 h-3" /> {project.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground/50 text-sm">
                <Calendar className="w-4 h-4" /> {new Date(project.createdAt).getFullYear()}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6 break-words">{project.title}</h1>
            <p className="text-xl text-muted-foreground/70 leading-relaxed max-w-2xl">{project.description}</p>
          </motion.div>
        </div>
      </header>

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-6 mb-24"
      >
        <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/40"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          {project.imageUrl ? (
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-heading font-bold text-4xl sm:text-6xl text-muted-foreground/10"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}>
              {project.title.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_280px] gap-16 items-start">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-heading font-bold mb-6">About the project</h2>
            <div className="text-muted-foreground/70 leading-relaxed text-base space-y-4">
              {project.longDescription ? (
                <p className="whitespace-pre-wrap">{project.longDescription}</p>
              ) : (
                <p className="italic text-muted-foreground/40">No detailed description available.</p>
              )}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col gap-8 sticky top-28"
          >
            {(project.demoUrl || project.githubUrl) && (
              <div className="p-5 rounded-2xl border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.025)" }}>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50 mb-4">Links</h3>
                <div className="flex flex-col gap-2.5">
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full justify-between rounded-xl group text-sm h-10">
                        Live Demo <ExternalLink className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full justify-between rounded-xl text-sm h-10 border-white/10 hover:border-primary/30">
                        Source Code <Github className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="p-5 rounded-2xl border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.025)" }}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50 mb-4">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span key={tech} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-muted-foreground/70">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </article>
  );
}
