import { useState, useRef, useEffect } from "react";
import { useAiChat, useGetAiDashboardSummary } from "@workspace/api-client-react";
import { Bot, Send, User, Sparkles, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Analyse my latest messages",
  "Suggest project ideas",
  "Help me write a bio",
  "Summarize my portfolio",
];

export default function AdminAi() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. I can help you analyze messages, suggest responses, or brainstorm project ideas. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiChat = useAiChat();
  const { refetch: fetchDashboardSummary, isFetching: isSummarizing } = useGetAiDashboardSummary({
    query: { enabled: false, queryKey: ["aiDashboardSummary"] },
  });

  const showDashboardSummary = async () => {
    if (isSummarizing) return;
    setMessages((prev) => [...prev, { role: "user", content: "Résumé du dashboard" }]);
    const { data } = await fetchDashboardSummary();
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data?.reply ?? "Impossible de générer le résumé pour le moment." },
    ]);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || aiChat.isPending) return;
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    aiChat.mutate(
      { data: { message: text, history: messages.slice(1).map(m => ({ role: m.role, content: m.content })) } },
      {
        onSuccess: (data) => setMessages([...newMessages, { role: "assistant", content: data.reply }]),
        onError: () => setMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]),
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); send(input); };
  const isInitial = messages.length === 1;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] pt-6">
      <div className="mb-5 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">AI Assistant</h1>
          <button
            onClick={showDashboardSummary}
            disabled={isSummarizing}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
          >
            <LayoutDashboard size={13} />
            {isSummarizing ? "Analyse…" : "Résumé du dashboard"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground/60 ml-11">Chat with the AI assistant about your portfolio.</p>
      </div>

      <div className="flex-1 flex flex-col rounded-3xl border border-white/[0.07] overflow-hidden shadow-2xl shadow-black/30 min-h-0"
        style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(16px)" }}>

        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="flex flex-col gap-5 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/[0.06] border border-white/[0.08] text-muted-foreground"
                  }`}>
                    {message.role === "user" ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "border border-white/[0.07] text-foreground/85 rounded-tl-sm"
                  }`} style={message.role !== "user" ? { background: "rgba(255,255,255,0.04)" } : {}}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {aiChat.isPending && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.08] text-muted-foreground shrink-0">
                  <Bot size={13} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/[0.07] flex items-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Suggestions for new chat */}
            {isInitial && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2 mt-2"
              >
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs px-3.5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground/70 hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/[0.06] shrink-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask the AI assistant…"
              className="flex-1 h-11 rounded-2xl bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/30 text-sm"
              disabled={aiChat.isPending}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || aiChat.isPending}
              className="w-11 h-11 rounded-2xl shrink-0 shadow-lg shadow-primary/20">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
