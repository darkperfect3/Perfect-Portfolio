export function FrostedGlass() {
  return (
    <div
      className="min-h-screen w-full overflow-auto"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.15) 0%, transparent 55%), #07071a",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b"
        style={{ background: "rgba(7,7,26,0.6)", backdropFilter: "blur(24px)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">Alex Moreau</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {["Projets", "Timeline", "Contact"].map(l => (
            <a key={l} href="#" className="text-sm text-white/50 hover:text-white/90 transition-colors">{l}</a>
          ))}
        </div>
        <button className="text-sm px-4 py-2 rounded-xl font-medium transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
          Admin
        </button>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-20 pb-16 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-xs font-medium" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Disponible pour de nouveaux projets
        </div>
        <h1 className="text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
          Senior Full Stack<br />
          <span style={{ background: "linear-gradient(90deg, #818cf8, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Developer</span>
        </h1>
        <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-xl">
          Architecte de solutions digitales à Paris. Spécialisé en React, Node.js, et systèmes distribués à grande échelle.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
            Voir mes projets
          </button>
          <button className="px-6 py-3 rounded-2xl text-sm font-semibold transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
            Me contacter
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 pb-16 max-w-5xl mx-auto grid grid-cols-3 gap-4">
        {[
          { label: "Projets livrés", value: "47+" },
          { label: "Années d'exp.", value: "8" },
          { label: "Clients satisfaits", value: "32" },
        ].map(stat => (
          <div key={stat.label} className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-white/40">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="px-8 pb-16 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Projets récents</h2>
          <a href="#" className="text-sm font-medium" style={{ color: "#67e8f9" }}>Voir tout →</a>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[
            { title: "CloudSync Dashboard", tag: "SaaS", color: "#6366f1" },
            { title: "FinTrack Pro", tag: "FinTech", color: "#06b6d4" },
            { title: "DeepSearch Engine", tag: "AI/ML", color: "#8b5cf6" },
          ].map(p => (
            <div key={p.title} className="group p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${p.color}20`, border: `1px solid ${p.color}30` }}>
                <div className="w-4 h-4 rounded-md" style={{ background: p.color }} />
              </div>
              <div className="text-sm font-medium text-white mb-2">{p.title}</div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${p.color}18`, color: p.color }}>{p.tag}</span>
              <div className="mt-4 flex items-center gap-1 text-xs text-white/30 group-hover:text-white/50 transition-colors">
                Voir le projet <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin Preview */}
      <section className="px-8 pb-20 max-w-5xl mx-auto">
        <div className="p-6 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Dashboard Admin</h2>
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(6,182,212,0.1)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.2)" }}>Live</span>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Vues totales", value: "12,840", icon: "👁", delta: "+18%" },
              { label: "Messages", value: "24", icon: "✉️", delta: "+5" },
              { label: "Projets", value: "3", icon: "📁", delta: "actifs" },
              { label: "Alertes", value: "1", icon: "🔒", delta: "sécurité" },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                <div className="text-xs mt-1" style={{ color: "#4ade80" }}>{s.delta}</div>
              </div>
            ))}
          </div>
          <div className="h-28 rounded-2xl flex items-end gap-1.5 px-4 pb-4 pt-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {[45,65,40,80,55,90,70,85,60,95,75,88].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm transition-all"
                style={{ height: `${h}%`, background: i === 11 ? "linear-gradient(to top, #6366f1, #06b6d4)" : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
