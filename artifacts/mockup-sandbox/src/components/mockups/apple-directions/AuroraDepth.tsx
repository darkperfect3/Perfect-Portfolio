export function AuroraDepth() {
  return (
    <div
      className="min-h-screen w-full overflow-auto relative"
      style={{ background: "#050508", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Aurora blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-5%", width: "55%", height: "55%",
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          filter: "blur(60px)", borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "-10%", width: "50%", height: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          filter: "blur(60px)", borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: "0%", left: "30%", width: "45%", height: "45%",
          background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          filter: "blur(60px)", borderRadius: "50%",
        }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", background: "rgba(5,5,8,0.7)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }} />
            <span className="text-sm font-semibold text-white">alex.moreau</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {["Work", "About", "Contact"].map(l => (
              <a key={l} href="#" className="text-sm font-medium text-white/40 hover:text-white/80 transition-colors">{l}</a>
            ))}
          </div>
          <button className="text-xs px-4 py-2 rounded-xl font-semibold transition-all" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
            Hire me
          </button>
        </nav>

        {/* Hero */}
        <section className="px-8 pt-20 pb-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-7">
            <div className="w-2 h-2 rounded-full" style={{ background: "#10b981" }} />
            <span className="text-xs font-medium tracking-wide" style={{ color: "#6ee7b7" }}>Open to opportunities · Paris</span>
          </div>
          <h1 className="text-[68px] font-bold leading-[1.0] tracking-[-2.5px] mb-7">
            <span className="text-white">I build things</span><br />
            <span style={{ background: "linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              for the web.
            </span>
          </h1>
          <p className="text-base text-white/45 leading-relaxed mb-12 max-w-lg font-normal">
            8 years building elegant, performant products. From architecture to pixel-perfect UI — I ship work that people love using.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-6 py-3 rounded-2xl text-sm font-semibold text-black transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
              See my work
            </button>
            <button className="px-6 py-3 rounded-2xl text-sm font-semibold text-white/60 hover:text-white/80 transition-colors">
              Read about me →
            </button>
          </div>
        </section>

        {/* Skills chips */}
        <section className="px-8 pb-16 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "GraphQL", "AWS", "Rust"].map((s, i) => {
              const colors = ["#10b981","#06b6d4","#8b5cf6","#10b981","#f59e0b","#06b6d4","#ec4899","#8b5cf6"];
              return (
                <span key={s} className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: `${colors[i]}12`, border: `1px solid ${colors[i]}25`, color: colors[i] }}>
                  {s}
                </span>
              );
            })}
          </div>
        </section>

        {/* Projects */}
        <section className="px-8 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Featured Projects</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: "CloudSync", sub: "Dashboard SaaS temps réel", color: "#10b981", icon: "☁️" },
              { title: "FinTrack Pro", sub: "Finance IA personnalisée", color: "#8b5cf6", icon: "📊" },
              { title: "DeepSearch", sub: "Moteur vectoriel sémantique", color: "#06b6d4", icon: "🔍" },
            ].map(p => (
              <div key={p.title} className="group relative p-5 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${p.color}15 0%, transparent 70%)`, filter: "blur(20px)", transform: "translate(30%, -30%)" }} />
                <div className="text-2xl mb-3">{p.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{p.title}</div>
                <div className="text-xs text-white/40 mb-4">{p.sub}</div>
                <div className="flex items-center gap-1.5 text-xs font-semibold transition-colors" style={{ color: p.color }}>
                  Explorer <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin Preview */}
        <section className="px-8 pb-20 max-w-5xl mx-auto">
          <div className="p-6 rounded-3xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #10b981, #06b6d4, #8b5cf6, transparent)" }} />
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white">Admin · Analytics</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/30">Live data</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { v: "12.8K", l: "Vues totales", c: "#10b981" },
                { v: "24", l: "Messages", c: "#06b6d4" },
                { v: "3", l: "Projets actifs", c: "#8b5cf6" },
                { v: "1", l: "Alertes", c: "#f59e0b" },
              ].map(s => (
                <div key={s.l} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-xl font-bold mb-1" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-xs text-white/35">{s.l}</div>
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="h-24 flex items-end gap-1 px-2" style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: "12px 12px 10px" }}>
              {[30,45,38,62,50,75,55,80,65,88,72,95].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm"
                  style={{ height: `${h}%`, background: i >= 9 ? `linear-gradient(to top, #10b981, #06b6d4)` : "rgba(255,255,255,0.07)" }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
