import { motion, AnimatePresence } from "framer-motion";
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiNodedotjs,
  SiExpress,
  SiTailwindcss,
  SiBootstrap,
  SiPhp,
  SiPython,
  SiAngular,
  SiReact,
  SiGithub,
  SiOpenai,
} from "react-icons/si";
import logo from "@/assets/logo.png";

const ICONS: { Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; label: string }[] = [
  { Icon: SiHtml5, color: "#E34F26", label: "HTML5" },
  { Icon: SiCss, color: "#1572B6", label: "CSS3" },
  { Icon: SiJavascript, color: "#F7DF1E", label: "JavaScript" },
  { Icon: SiReact, color: "#61DAFB", label: "React" },
  { Icon: SiNodedotjs, color: "#3C873A", label: "Node.js" },
  { Icon: SiExpress, color: "#ffffff", label: "Express" },
  { Icon: SiTailwindcss, color: "#38BDF8", label: "Tailwind" },
  { Icon: SiBootstrap, color: "#7952B3", label: "Bootstrap" },
  { Icon: SiPhp, color: "#777BB4", label: "PHP" },
  { Icon: SiPython, color: "#3776AB", label: "Python" },
  { Icon: SiAngular, color: "#DD0031", label: "Angular" },
  { Icon: SiOpenai, color: "#b2d5e5", label: "IA" },
  { Icon: SiGithub, color: "#ffffff", label: "GitHub" },
];

export function LoadingScreen({ progress }: { progress: number }) {
  const radius = 120;
  const count = ICONS.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#020202" }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(178,213,229,0.12), transparent 60%)",
          }}
        />

        <div
          className="relative flex items-center justify-center scale-[0.62] sm:scale-90 md:scale-100"
          style={{ width: radius * 2 + 80, height: radius * 2 + 80 }}
        >
          <motion.div
            className="absolute rounded-full border border-white/[0.06]"
            style={{ width: radius * 2, height: radius * 2 }}
          />

          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          >
            {ICONS.map(({ Icon, color, label }, i) => {
              const angle = (i / count) * 2 * Math.PI;
              const cx = radius * Math.cos(angle);
              const cy = radius * Math.sin(angle);
              return (
                <motion.div
                  key={label}
                  className="absolute flex items-center justify-center rounded-2xl"
                  style={{
                    width: 44,
                    height: 44,
                    left: "50%",
                    top: "50%",
                    marginLeft: cx - 22,
                    marginTop: cy - 22,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.18, 1], opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center rounded-3xl"
            style={{
              width: 96,
              height: 96,
              background: "rgba(178,213,229,0.06)",
              border: "1px solid rgba(178,213,229,0.18)",
              boxShadow: "0 0 40px rgba(178,213,229,0.15)",
            }}
          >
            <img src={logo} alt="Perfect Dev" className="w-16 h-16 object-contain" />
          </motion.div>
        </div>

        <div className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 w-[min(320px,80vw)] flex flex-col items-center gap-3">
          <div className="w-full h-1 rounded-full overflow-hidden bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(190 90% 50% / 0.6), hsl(190 90% 60%))" }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: "easeOut", duration: 0.25 }}
            />
          </div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/50 font-medium">
            Chargement {Math.min(Math.round(progress), 100)}%
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
