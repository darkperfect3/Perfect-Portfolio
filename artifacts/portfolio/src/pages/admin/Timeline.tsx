import { useListTimeline, useCreateTimelineEntry, useUpdateTimelineEntry, useDeleteTimelineEntry, getListTimelineQueryKey, TimelineEntry, CreateTimelineEntryBody, UpdateTimelineEntryBody, useSuggestTimelineEntry } from "@workspace/api-client-react";
import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, Briefcase, GraduationCap, Trophy, Sparkles, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

type TimelineEntryType = TimelineEntry;
type CreateTimelineEntryBodyType = CreateTimelineEntryBody;
type UpdateTimelineEntryBodyType = UpdateTimelineEntryBody;
const EntryType = { work: "work", education: "education", achievement: "achievement" } as const;

const typeConfig = {
  work: { icon: Briefcase, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  education: { icon: GraduationCap, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  achievement: { icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

const inputClass = "bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/30 h-10 rounded-xl text-sm";
const defaultForm = { title: "", organization: "", description: "", startDate: new Date().toISOString().split("T")[0], endDate: "", current: false, type: EntryType.work, order: 0 };

export default function AdminTimeline() {
  const { data: timeline, isLoading } = useListTimeline();
  const createEntry = useCreateTimelineEntry();
  const updateEntry = useUpdateTimelineEntry();
  const deleteEntry = useDeleteTimelineEntry();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState(defaultForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListTimelineQueryKey() });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createEntry.mutate({ data: { ...formData, endDate: formData.current ? null : (formData.endDate || null) } }, {
      onSuccess: () => { toast({ title: "Entry created" }); setIsCreateOpen(false); invalidate(); setFormData(defaultForm); }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    updateEntry.mutate({ id: editingEntry.id, data: { ...formData, endDate: formData.current ? null : (formData.endDate || null) } }, {
      onSuccess: () => { toast({ title: "Entry updated" }); setEditingEntry(null); invalidate(); }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this timeline entry?")) return;
    deleteEntry.mutate({ id }, { onSuccess: () => { toast({ title: "Entry deleted" }); invalidate(); } });
  };

  const openEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({ title: entry.title, organization: entry.organization, description: entry.description, startDate: entry.startDate?.split("T")[0] ?? "", endDate: entry.endDate?.split("T")[0] ?? "", current: entry.current, type: entry.type, order: entry.order });
  };

  const suggestTimeline = useSuggestTimelineEntry();

  const handleAiSuggest = () => {
    suggestTimeline.mutate({ data: { title: formData.title, organization: formData.organization, description: formData.description, type: formData.type } }, {
      onSuccess: (suggestion) => {
        setFormData({ ...formData, title: suggestion.title, organization: suggestion.organization, description: suggestion.description, type: suggestion.type as typeof formData.type });
        toast({ title: "Suggestions IA appliquées" });
      },
      onError: () => toast({ title: "Erreur IA", description: "Impossible de générer des suggestions.", variant: "destructive" }),
    });
  };

  const FormContent = () => (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button type="button" size="sm" variant="secondary" disabled={suggestTimeline.isPending} onClick={handleAiSuggest} className="gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border-0">
          {suggestTimeline.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Suggestion IA
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Title / Role *</label>
          <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Organization *</label>
          <Input required value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className={inputClass} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Description *</label>
        <Textarea required className="h-24 bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 rounded-xl text-sm resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Type *</label>
          <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
            <SelectTrigger className="bg-white/[0.04] border-white/[0.08] rounded-xl h-10 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="achievement">Achievement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Order</label>
          <Input type="number" required value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className={inputClass} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Start Date *</label>
          <Input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">End Date</label>
          <Input type="date" disabled={formData.current} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className={inputClass} />
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.02)" }}>
        <Checkbox id="current" checked={formData.current} onCheckedChange={(c: boolean) => setFormData({...formData, current: c, endDate: c ? "" : formData.endDate})} />
        <label htmlFor="current" className="text-sm font-medium cursor-pointer">This is my current role</label>
      </div>
    </div>
  );

  const getIcon = (type: string) => {
    const cfg = typeConfig[type as keyof typeof typeConfig] ?? { icon: Calendar, color: "text-muted-foreground", bg: "bg-white/[0.05] border-white/[0.08]" };
    return cfg;
  };

  return (
    <div className="space-y-8 pb-10 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight mb-1">Timeline</h1>
          <p className="text-sm text-muted-foreground/60">Manage your experience, education, and milestones.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> New Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/[0.08]" style={{ background: "rgba(12,12,15,0.95)", backdropFilter: "blur(24px)" }}>
            <DialogHeader>
              <DialogTitle>New Timeline Entry</DialogTitle>
              <DialogDescription>Fill in the details or use the AI suggestion button to auto-generate content.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="pt-4"><FormContent /></div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl border-white/[0.08]">Cancel</Button>
                <Button type="submit" disabled={createEntry.isPending} className="rounded-xl">Create Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/[0.08]" style={{ background: "rgba(12,12,15,0.95)", backdropFilter: "blur(24px)" }}>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>Update the entry details or use the AI suggestion button to refresh content.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="pt-4"><FormContent /></div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditingEntry(null)} className="rounded-xl border-white/[0.08]">Cancel</Button>
              <Button type="submit" disabled={updateEntry.isPending} className="rounded-xl">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)" }} />)}
        </div>
      ) : timeline && timeline.length > 0 ? (
        <div className="space-y-4">
          {timeline.map((entry, i) => {
            const dateStr = entry.endDate
              ? `${format(parseISO(entry.startDate), "MMM yyyy")} — ${format(parseISO(entry.endDate), "MMM yyyy")}`
              : `${format(parseISO(entry.startDate), "MMM yyyy")} — Present`;
            const cfg = getIcon(entry.type);
            const Icon = cfg.icon;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="group rounded-3xl border border-white/[0.07] p-5 flex flex-col md:flex-row gap-5 transition-all duration-200 hover:border-primary/20 shadow-xl shadow-black/20"
                style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(16px)" }}
              >
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="text-base font-heading font-bold leading-snug">{entry.title}</h3>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>{dateStr}</span>
                  </div>
                  <h4 className="text-sm text-foreground/60 mb-2">{entry.organization}</h4>
                  <p className="text-xs text-muted-foreground/50 line-clamp-2 leading-relaxed">{entry.description}</p>
                </div>
                <div className="flex flex-row md:flex-col gap-2 md:justify-center shrink-0">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border-0" onClick={() => openEdit(entry)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border-0 text-rose-400" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center rounded-3xl border border-dashed border-white/[0.07]">
          <p className="text-sm text-muted-foreground/50">No timeline entries yet.</p>
        </div>
      )}
    </div>
  );
}
