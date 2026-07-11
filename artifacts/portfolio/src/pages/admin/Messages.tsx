import { useListMessages, useMarkMessageRead, useAnalyzeMessage, getListMessagesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Inbox, MailOpen, Mail, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

function MessageAnalysisCard({ id, onMarkRead, read }: { id: number; onMarkRead: () => void; read: boolean }) {
  const { data: analysis, isLoading } = useAnalyzeMessage(id);

  if (isLoading) {
    return (
      <div className="rounded-2xl p-4 mt-4 border border-white/[0.06] animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <div className="h-3 bg-white/5 rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const priorityStyle = {
    low: { bg: "bg-white/[0.04]", border: "border-white/[0.07]", text: "text-muted-foreground/70" },
    medium: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
    high: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
  }[analysis.priority] ?? { bg: "bg-white/[0.04]", border: "border-white/[0.07]", text: "text-muted-foreground" };

  return (
    <div className="rounded-2xl p-5 mt-4 border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">AI Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-mono uppercase tracking-wider ${priorityStyle.bg} ${priorityStyle.border} ${priorityStyle.text}`}>
            {analysis.priority}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.04] text-muted-foreground/70 font-mono uppercase tracking-wider">
            {analysis.intent}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-xs text-muted-foreground/40 uppercase tracking-wider mb-2">Summary</h4>
          <p className="text-sm text-foreground/80 leading-relaxed">{analysis.summary}</p>
        </div>
        <div>
          <h4 className="text-xs text-muted-foreground/40 uppercase tracking-wider mb-2">Suggested Reply</h4>
          <p className="text-sm italic text-foreground/60 p-3 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
            "{analysis.suggestedReply}"
          </p>
        </div>
      </div>
      {!read && (
        <div className="mt-5 flex justify-end border-t border-white/[0.06] pt-4">
          <Button size="sm" onClick={onMarkRead} className="gap-2 rounded-xl h-8 text-xs">
            <Check className="w-3.5 h-3.5" /> Mark as Read
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminMessages() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data: messages, isLoading } = useListMessages({ read: filter === "unread" ? false : undefined });
  const markRead = useMarkMessageRead();
  const queryClient = useQueryClient();

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() }) });
  };

  return (
    <div className="space-y-8 pb-10 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight mb-1">Inbox</h1>
          <p className="text-sm text-muted-foreground/60">Manage your messages and inquiries.</p>
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.03)" }}>
          {(["all", "unread"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${filter === f ? "text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"}`}>
              {filter === f && (
                <motion.span layoutId="msg-filter" className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.08]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }} />
              )}
              <span className="relative capitalize">{f === "all" ? "All Messages" : "Unread"}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }} />)}
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((message) => {
            const isExpanded = expandedId === message.id;
            return (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                  message.read ? "border-white/[0.07]" : "border-primary/30"
                }`}
                style={{ background: message.read ? "rgba(255,255,255,0.025)" : "rgba(var(--primary-rgb, 178 213 229) / 0.04)", backdropFilter: "blur(12px)" }}
              >
                <div className="p-5 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(prev => prev === message.id ? null : message.id)}>
                  <div className="mt-0.5 flex-shrink-0">
                    {message.read
                      ? <MailOpen className="w-4 h-4 text-muted-foreground/40" />
                      : <div className="relative">
                          <Mail className="w-4 h-4 text-primary" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${!message.read ? "text-primary" : ""}`}>{message.name}</span>
                        <span className="text-xs text-muted-foreground/40">{message.email}</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground/40 whitespace-nowrap">
                        {format(parseISO(message.createdAt), "MMM d, yyyy · h:mm a")}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-foreground/70 mb-1">{message.subject || "No Subject"}</div>
                    {!isExpanded && (
                      <p className="text-xs text-muted-foreground/50 line-clamp-1">{message.content}</p>
                    )}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/[0.06]">
                            <p className="whitespace-pre-wrap text-sm text-foreground/70 leading-relaxed mb-4">{message.content}</p>
                            <MessageAnalysisCard id={message.id} onMarkRead={() => handleMarkRead(message.id)} read={message.read} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex-shrink-0 ml-2 text-muted-foreground/30">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center rounded-3xl border border-dashed border-white/[0.07] flex flex-col items-center">
          <div className="w-14 h-14 rounded-3xl border border-white/[0.07] bg-white/[0.02] flex items-center justify-center mb-5">
            <Inbox className="w-6 h-6 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-heading font-bold mb-2">Inbox Zero</h3>
          <p className="text-sm text-muted-foreground/50">No {filter === "unread" ? "unread " : ""}messages yet.</p>
        </div>
      )}
    </div>
  );
}
