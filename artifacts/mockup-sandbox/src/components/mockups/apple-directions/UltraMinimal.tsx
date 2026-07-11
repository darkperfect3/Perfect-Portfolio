export function UltraMinimal() {
  return (
    <div
      className="min-h-screen w-full overflow-auto"
      style={{ background: "#090909", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-white/[0.06]">
        <span className="font-semibold text-white text-sm tracking-tight">Alex Moreau</span>
        <div className="hidden md:flex items-center gap-8">
          {["Projets", "Timeline", "Contact"].map(l => (
            <a key={l} href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors tracking-wide">{l}</a>
          ))}
        </div>
        <button className="text-xs px-4 py-2 rounded-full font-medium tracking-wide transition-all border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70">
          Admin →
        </button>
      </nav>

      {/* Hero */}
      <section className="px-10 pt-24 pb-20 max-w-4xl">
        <p className="text-xs text-white/30 tracking-[0.25em] uppercase mb-8 font-medium">Paris, France · Full Stack</p>
        <h1 className="text-[64px] font-semibold text-white leading-[1.04] tracking-[-2px] mb-8">
          Crafting digital<br />
          experiences that<br />
          <span style={{ color: "#22d3ee" }}>matter.</span>
        </h1>
        <p className="text-base text-white/40 leading-relaxed mb-12 max-w-md">
          I build performant, scalable web applications with a focus on clean architecture and exceptional user experience.
        </p>
        <div className="flex items-center gap-4">
          <button className="px-7 py-3.5 rounded-full text-sm font-medium text-black transition-all hover:opacity-90 active:scale-95" style={{ background: "#22d3ee" }}>
            View Work
          </button>
          <button className="px-7 py-3.5 rounded-full text-sm font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all">
            Get in Touch
          </button>
        </div>
      </section>

      {/* Divider + Stats */}
      <section className="px-10 pb-20 max-w-4xl">
        <div className="h-px w-full bg-white/[0.05] mb-12" />
        <div className="grid grid-cols-3 gap-0 divide-x divide-white/[0.05]">
          {[
            { label: "Projects Shipped", value: "47" },
            { label: "Years Experience", value: "8" },
            { label: "Happy Clients", value: "32" },
          ].map(stat => (
            <div key={stat.label} className="px-8 first:pl-0 last:pr-0">
              <div className="text-4xl font-semibold text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-xs text-white/30 tracking-wide uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="px-10 pb-20 max-w-4xl">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-xl font-semibold text-white tracking-tight">Selected Work</h2>
          <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-wide">All projects →</a>
        </div>
        <div className="flex flex-col divide-y divide-white/[0.05]">
          {[
            { title: "CloudSync Dashboard", desc: "Real-time SaaS platform with live collaboration", tag: "SaaS · React · Go" },
            { title: "FinTrack Pro", desc: "Personal finance platform with AI-powered insights", tag: "FinTech · Next.js" },
            { title: "DeepSearch Engine", desc: "Semantic search engine built on vector databases", tag: "AI/ML · Python · Rust" },
          ].map(p => (
            <div key={p.title} className="group flex items-center justify-between py-6 cursor-pointer">
              <div>
                <div className="text-white font-medium mb-1 group-hover:text-cyan-400 transition-colors">{p.title}</div>
                <div className="text-sm text-white/30">{p.desc}</div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-white/20 font-mono">{p.tag}</span>
                <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyan-400/40 group-hover:bg-cyan-400/5 transition-all">
                  <svg className="w-3 h-3 text-white/30 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin Preview */}
      <section className="px-10 pb-20 max-w-4xl">
        <div className="rounded-3xl overflow-hidden border border-white/[0.06]">
          {/* Title bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]" style={{ background: "#0f0f0f" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-xs text-white/20 font-mono">Admin Dashboard</span>
            <div className="w-16" />
          </div>
          <div className="p-6" style={{ background: "#0c0c0c" }}>
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { l: "Page Views", v: "12,840", up: true },
                { l: "Messages", v: "24", up: true },
                { l: "Projects", v: "3", up: false },
                { l: "Security", v: "1 alert", up: false },
              ].map(s => (
                <div key={s.l} className="p-4 rounded-2xl border border-white/[0.05]" style={{ background: "#111" }}>
                  <div className="text-lg font-semibold text-white mb-1">{s.v}</div>
                  <div className="text-xs text-white/30">{s.l}</div>
                </div>
              ))}
            </div>
            {/* Mini chart */}
            <div className="rounded-2xl p-4 border border-white/[0.05]" style={{ background: "#111" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-white/60">Audience · 30 jours</span>
                <span className="text-xs text-cyan-400">+18.2%</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[30,50,35,70,45,80,60,75,55,90,68,85].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm"
                    style={{ height: `${h}%`, background: i >= 9 ? "#22d3ee" : "rgba(255,255,255,0.08)" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
