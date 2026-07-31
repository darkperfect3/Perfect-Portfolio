import { useGetProfile, useGetFeaturedProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const spring = { type: "spring" as const, stiffness: 400, damping: 35 };

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: featuredProjects, isLoading: projectsLoading } = useGetFeaturedProjects();

  const featuredProjectsList = Array.isArray(featuredProjects) ? featuredProjects : [];
  const hasFeaturedProjects = featuredProjectsList.length > 0;

  if (profileLoading || projectsLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center pt-16 pb-24 sm:pb-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-25 mix-blend-screen scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10 w-full">
          <motion.div variants={container} initial="hidden" animate="visible" className="flex items-start gap-10">
            <div className="max-w-3xl flex-1">

              {/* Status badge */}
              <motion.div variants={item} className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {profile?.title || "Creative Developer"}
                {profile?.location && (
                  <>
                    <span className="w-px h-3 bg-primary/20" />
                    <MapPin className="w-3 h-3 text-primary/70" />
                    <span className="text-primary/70">{profile.location}</span>
                  </>
                )}
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={item}
                className="text-[2.75rem] sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tighter leading-[1.05] mb-8 break-words"
              >
                {profile?.name ? (
                  <>
                    I'm{" "}
                    <span className="relative">
                      <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--primary)))" }}>
                        {profile.name.split(" ")[0]}.
                      </span>
                    </span>
                    <br />
                    <span className="text-muted-foreground">I build digital experiences.</span>
                  </>
                ) : (
                  <>Crafting digital<br /><span className="text-muted-foreground">experiences.</span></>
                )}
              </motion.h1>

              <motion.p variants={item} className="text-lg md:text-xl text-muted-foreground/80 max-w-xl mb-12 leading-relaxed">
                {profile?.bio || "A multidisciplinary developer focused on creating clean, intuitive, and performant web applications."}
              </motion.p>

              <motion.div variants={item} className="flex flex-wrap items-center gap-4">
                <Link href="/projects">
                  <Button size="lg" className="h-13 px-8 text-sm rounded-full gap-2 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                    View Work <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="h-13 px-8 text-sm rounded-full border-white/10 hover:bg-white/5 hover:border-white/20">
                    Get in Touch
                  </Button>
                </Link>
                <div className="flex items-center gap-2 ml-1">
                  {profile?.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right image frame - place your image at /profile-portrait.jpg in public/ */}
            <motion.div
              variants={item}
              className="hidden lg:flex group flex-shrink-0 w-90 h-100 rounded-[2rem] overflow-hidden border border-white/[0.08] bg-white/[0.03] shadow-[0_28px_80px_rgba(59,130,246,0.14)] transition-transform duration-500 hover:scale-[1.04]"
            >
              <div className="relative w-full h-full">
                <img
                  src="/8E41FECF-6556-4C6E-AB54-AD7EC3F62BEC.jpg"
                  alt={profile?.name || "Profile"}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-primary/25 opacity-90 mix-blend-multiply pointer-events-none" />
                <div className="absolute inset-0 border border-primary/15 rounded-[2rem] pointer-events-none" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Projects ── */}
      {hasFeaturedProjects && (
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-4">Selected Work</p>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4">Projects that matter</h2>
                <p className="text-muted-foreground/70 text-lg max-w-xl">A curated collection of projects that define my approach to design and engineering.</p>
              </motion.div>
              <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-primary/80 hover:text-primary group transition-colors shrink-0">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {featuredProjectsList.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Link href={`/projects/${project.id}`} className="block">
                    <div className="rounded-3xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/40 transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-primary/5"
                      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}>
                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-secondary/30">
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl font-heading font-bold text-muted-foreground/20">
                            {project.title.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                          <ArrowRight className="w-4 h-4 -rotate-45" />
                        </div>
                      </div>
                      {/* Meta */}
                      <div className="p-7">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-mono text-primary uppercase tracking-wider">{project.category}</span>
                          <div className="h-1 w-1 rounded-full bg-white/20" />
                          <span className="text-xs text-muted-foreground">{new Date(project.createdAt).getFullYear()}</span>
                        </div>
                        <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors duration-200">{project.title}</h3>
                        <p className="text-muted-foreground/70 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mt-5">
                          {project.technologies.slice(0, 4).map(tech => (
                            <span key={tech} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.07] text-muted-foreground/70">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Skills ── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-14 md:gap-28 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-5">Technical Stack</p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold tracking-tight mb-6">Technical Arsenal</h2>
              <p className="text-muted-foreground/70 text-lg leading-relaxed mb-10">
                I believe in using the right tool for the job. My stack is constantly evolving, but these are the technologies I reach for most often when building production-grade applications.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="h-12 rounded-full border-white/10 hover:bg-white/5 hover:border-primary/30 gap-2">
                  Discuss a project <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="flex flex-wrap gap-2.5">
              {(profile?.skills && profile.skills.length > 0
                ? profile.skills
                : ["React", "TypeScript", "Node.js", "Tailwind CSS", "Next.js", "PostgreSQL", "Framer Motion", "GraphQL"]
              ).map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.05, transition: { ...spring } }}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-white/[0.08] bg-white/[0.03] hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors duration-200 cursor-default"
                >
                  {skill}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
