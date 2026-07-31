import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { useSendChatMessage, useGetChatHistory } from "@workspace/api-client-react";
import logo from "@/assets/logo.png";
import { getVisitorId } from "@/lib/visitor";

type ChatMessage = { role: "user" | "assistant"; content: string };

const POSITION_KEY = "perfectdev_chat_button_pos";
const BUTTON_SIZE = 60;
const MARGIN = 14;

function getDefaultPosition() {
  return {
    x: window.innerWidth - BUTTON_SIZE - MARGIN,
    y: window.innerHeight - BUTTON_SIZE - MARGIN - 16,
  };
}

function getStoredPosition() {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return getDefaultPosition();
    const parsed = JSON.parse(raw) as { x: number; y: number };
    return {
      x: Math.min(Math.max(parsed.x, MARGIN), window.innerWidth - BUTTON_SIZE - MARGIN),
      y: Math.min(Math.max(parsed.y, MARGIN), window.innerHeight - BUTTON_SIZE - MARGIN),
    };
  } catch {
    return getDefaultPosition();
  }
}

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Salut ! 👋 Je suis l'assistant de Perfect|Dev. Je peux te guider sur le site (Accueil, Projets, Parcours, Contact) ou répondre à tes questions. Comment puis-je t'aider ?",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorId] = useState(getVisitorId);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [panelSide, setPanelSide] = useState<"left" | "right">("right");
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasLoadedHistory = useRef(false);
  const dragMoved = useRef(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const pos = getStoredPosition();
    x.set(pos.x);
    y.set(pos.y);
    setPanelSide(pos.x > window.innerWidth / 2 ? "right" : "left");

    const handleResize = () => {
      const clampedX = Math.min(Math.max(x.get(), MARGIN), window.innerWidth - BUTTON_SIZE - MARGIN);
      const clampedY = Math.min(Math.max(y.get(), MARGIN), window.innerHeight - BUTTON_SIZE - MARGIN);
      x.set(clampedX);
      y.set(clampedY);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: history } = useGetChatHistory(visitorId, {
    query: { enabled: isOpen, queryKey: ["chatHistory", visitorId] },
  });
  const sendMessage = useSendChatMessage();

  useEffect(() => {
      if (history && history.length > 0 && !hasLoadedHistory.current) {
      hasLoadedHistory.current = true;
      setMessages([
        GREETING,
        ...history.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })),
      ]);
    }
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const send = (text: string) => {
    if (!text.trim() || sendMessage.isPending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    sendMessage.mutate(
      { data: { visitorId, message: text } },
      {
        onSuccess: (data) => setMessages([...next, { role: "assistant", content: data.reply }]),
        onError: () => setMessages([...next, { role: "assistant", content: "Désolé, je rencontre un problème technique. Réessaie dans un instant." }]),
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentX = x.get();
    const currentY = y.get();
    const centerX = currentX + BUTTON_SIZE / 2;
    const snapToRight = centerX > window.innerWidth / 2;
    const targetX = snapToRight ? window.innerWidth - BUTTON_SIZE - MARGIN : MARGIN;
    const clampedY = Math.min(Math.max(currentY, MARGIN), window.innerHeight - BUTTON_SIZE - MARGIN);

    animate(x, targetX, { type: "spring", stiffness: 420, damping: 32 });
    animate(y, clampedY, { type: "spring", stiffness: 420, damping: 32 });

    setPanelSide(snapToRight ? "right" : "left");
    localStorage.setItem(POSITION_KEY, JSON.stringify({ x: targetX, y: clampedY }));

    setTimeout(() => {
      if (!dragMoved.current) setIsOpen((v) => !v);
      dragMoved.current = false;
    }, 0);
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[59]" />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[58] md:hidden"
              style={{ background: "rgba(0,0,0,0.4)" }}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.92, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 16, scale: 0.92, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className={`fixed z-[60] w-[92vw] max-w-sm h-[70vh] flex flex-col rounded-[28px] border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/50 ${
                panelSide === "right" ? "right-4" : "left-4"
              }`}
              style={{
                bottom: `calc(${window.innerHeight - y.get() + 16}px)`,
                maxHeight: "min(560px, calc(100vh - 96px))",
                background: "rgba(6,8,10,0.85)",
                backdropFilter: "blur(30px) saturate(180%)",
              }}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06] shrink-0">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={logo} alt="Perfect Dev" className="w-7 h-7 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-semibold leading-none">Perfect|Dev Assistant</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> En ligne
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-[13px] leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "border border-white/[0.07] text-foreground/85 rounded-tl-sm"
                      }`}
                      style={m.role !== "user" ? { background: "rgba(255,255,255,0.04)" } : {}}
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                {sendMessage.isPending && (
                  <div className="flex justify-start">
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-white/[0.07] flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                      {[0, 150, 300].map((delay) => (
                        <div key={delay} className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-white/[0.06] shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écris ton message…"
                    className="flex-1 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-3.5 text-[13px] outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={sendMessage.isPending}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sendMessage.isPending}
                    className="w-10 h-10 shrink-0 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity shadow-lg shadow-primary/20"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.08}
        style={{ x, y, position: "fixed", top: 0, left: 0, zIndex: 60, touchAction: "none" }}
        onDragStart={() => {
          dragMoved.current = false;
          setIsDragging(true);
        }}
        onDrag={() => {
          dragMoved.current = true;
        }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (!dragMoved.current) setIsOpen((v) => !v);
        }}
        whileTap={{ scale: 0.9 }}
        className="cursor-grab active:cursor-grabbing"
      >
        <motion.div
          animate={
            isDragging || isOpen
              ? { scale: 1 }
              : { scale: [1, 1.05, 1] }
          }
          transition={
            isDragging || isOpen
              ? { duration: 0.15 }
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            background: "rgba(20,24,26,0.55)",
            backdropFilter: "blur(18px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: isDragging
              ? "0 8px 30px rgba(0,0,0,0.5), 0 0 0 6px rgba(178,213,229,0.08)"
              : "0 6px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18), transparent 60%)",
            }}
          />
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="x"
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="relative text-foreground/90"
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative w-8 h-8 flex items-center justify-center"
              >
                <img src={logo} alt="Assistant" className="w-full h-full object-contain drop-shadow" />
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-2 border-black/40">
                  <Sparkles size={9} className="text-primary-foreground" />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
