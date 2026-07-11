import { useGetAnalyticsDashboard } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Eye, Users, Inbox, FolderGit2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

const statConfig = [
  { label: "Total Views", icon: Eye, gradient: "from-primary/20 to-primary/5", border: "border-primary/20", iconColor: "text-primary" },
  { label: "Unique Visitors", icon: Users, gradient: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20", iconColor: "text-violet-400" },
  { label: "Unread Messages", icon: Inbox, gradient: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/20", iconColor: "text-rose-400" },
  { label: "Total Projects", icon: FolderGit2, gradient: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20", iconColor: "text-amber-400" },
];

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAnalyticsDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse pt-6">
        <div className="h-7 bg-white/5 rounded-xl w-1/4 mb-1" />
        <div className="h-4 bg-white/5 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="h-[340px] bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!dashboard) return null;

  const stats = [
    { ...statConfig[0], value: dashboard.totalViews },
    { ...statConfig[1], value: dashboard.uniqueVisitors },
    { ...statConfig[2], value: dashboard.unreadMessages },
    { ...statConfig[3], value: dashboard.totalProjects },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 pt-6 pb-10">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-heading font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground/60">Overview of your portfolio's performance.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 28 } }}
            className={`relative rounded-3xl p-5 border overflow-hidden ${stat.border}`}
            style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(16px)" }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
            <div className="relative">
              <div className={`w-9 h-9 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-4 ${stat.iconColor}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold tracking-tight mb-0.5">{stat.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground/50">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + top pages */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-[2fr_1fr] gap-5">
        {/* Chart */}
        <div className="rounded-3xl border border-white/[0.07] p-6 shadow-xl shadow-black/20"
          style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-heading font-semibold">Views over time</h2>
              <p className="text-xs text-muted-foreground/50 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> Analytics
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.viewsByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,15,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, backdropFilter: "blur(12px)" }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: 4, fontSize: 11 }}
                  itemStyle={{ color: "hsl(var(--primary))", fontSize: 13 }}
                  labelFormatter={(v) => new Date(v).toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric" })}
                />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2}
                  fillOpacity={1} fill="url(#colorViews)" dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top pages */}
        <div className="rounded-3xl border border-white/[0.07] p-6 shadow-xl shadow-black/20 flex flex-col"
          style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(16px)" }}>
          <h2 className="text-base font-heading font-semibold mb-6">Top Pages</h2>
          <div className="flex flex-col gap-3 flex-1">
            {dashboard.topPages.length > 0 ? dashboard.topPages.map((page, i) => {
              const maxViews = Math.max(...dashboard.topPages.map(p => p.views));
              const pct = maxViews > 0 ? (page.views / maxViews) * 100 : 0;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate pr-4 max-w-[70%] text-foreground/80" title={page.page}>{page.page}</span>
                    <span className="text-xs text-muted-foreground/50 font-mono whitespace-nowrap">{page.views.toLocaleString()}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground/40">No page views yet</div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
