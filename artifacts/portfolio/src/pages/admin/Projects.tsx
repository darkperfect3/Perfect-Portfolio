import { useListProjects, useCreateProject, useUpdateProject, useDeleteProject, getListProjectsQueryKey, useSuggestProject } from "@workspace/api-client-react";
import { useState, useRef } from "react";
import { Plus, Edit, Trash2, ExternalLink, Image as ImageIcon, Star, Sparkles, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpload } from "@workspace/object-storage-web";
import { Upload, Loader2 as Loader2Icon, Check } from "lucide-react";

const inputClass = "bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/30 h-10 rounded-xl text-sm";

const emptyForm = { title: "", description: "", longDescription: "", imageUrl: "", category: "", technologies: "", githubUrl: "", demoUrl: "", featured: false, order: 0 };

function ProjectForm({ formData, setFormData }: { formData: typeof emptyForm; setFormData: (d: typeof emptyForm) => void }) {
  const suggestProject = useSuggestProject();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setFormData({ ...formData, imageUrl: `/api/storage${response.objectPath}` });
      toast({ title: "Image importée" });
    },
    onError: () => toast({ title: "Erreur d'import", description: "Impossible d'importer l'image.", variant: "destructive" }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleAiSuggest = () => {
    suggestProject.mutate({ data: { title: formData.title, description: formData.description, category: formData.category, technologies: formData.technologies } }, {
      onSuccess: (suggestion) => {
        setFormData({
          ...formData,
          title: suggestion.title,
          description: suggestion.description,
          longDescription: suggestion.longDescription,
          category: suggestion.category,
          technologies: suggestion.technologies,
        });
        toast({ title: "Suggestions IA appliquées" });
      },
      onError: () => toast({ title: "Erreur IA", description: "Impossible de générer des suggestions.", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-5 pt-4">
      <div className="flex justify-end">
        <Button type="button" size="sm" variant="secondary" disabled={suggestProject.isPending} onClick={handleAiSuggest} className="gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border-0">
          {suggestProject.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Suggestion IA
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Title *</label>
          <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Category *</label>
          <Input required placeholder="e.g. Web App, Mobile" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Short Description *</label>
        <Textarea required className="h-20 bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 rounded-xl text-sm resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Detailed Description</label>
        <Textarea className="h-28 bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 rounded-xl text-sm resize-none" value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Technologies * (comma separated)</label>
        <Input required placeholder="React, Node.js, PostgreSQL" value={formData.technologies} onChange={e => setFormData({...formData, technologies: e.target.value})} className={inputClass} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Image</label>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button
            type="button"
            variant="secondary"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-10 gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-sm font-normal justify-start px-3"
          >
            {isUploading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : formData.imageUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Import en cours…" : formData.imageUrl ? "Image importée — changer" : "Importer une image"}
          </Button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Order</label>
          <Input type="number" required value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className={inputClass} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">GitHub URL</label>
          <Input type="url" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Live Demo URL</label>
          <Input type="url" value={formData.demoUrl} onChange={e => setFormData({...formData, demoUrl: e.target.value})} className={inputClass} />
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.02)" }}>
        <Checkbox id="featured" checked={formData.featured} onCheckedChange={(c: boolean) => setFormData({...formData, featured: c})} />
        <label htmlFor="featured" className="text-sm font-medium cursor-pointer flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-amber-400" /> Featured — appears on the home page
        </label>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const { data: projects, isLoading } = useListProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({ data: { ...formData, technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean), longDescription: formData.longDescription || null, imageUrl: formData.imageUrl || null, githubUrl: formData.githubUrl || null, demoUrl: formData.demoUrl || null } }, {
      onSuccess: () => { toast({ title: "Project created" }); setIsCreateOpen(false); invalidate(); setFormData(emptyForm); }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    updateProject.mutate({ id: editingProject.id, data: { ...formData, technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean), longDescription: formData.longDescription || null, imageUrl: formData.imageUrl || null, githubUrl: formData.githubUrl || null, demoUrl: formData.demoUrl || null } }, {
      onSuccess: () => { toast({ title: "Project updated" }); setEditingProject(null); invalidate(); }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this project?")) return;
    deleteProject.mutate({ id }, { onSuccess: () => { toast({ title: "Project deleted" }); invalidate(); } });
  };

  const openEdit = (p: any) => {
    setEditingProject(p);
    setFormData({ title: p.title, description: p.description, longDescription: p.longDescription || "", imageUrl: p.imageUrl || "", category: p.category, technologies: p.technologies.join(", "), githubUrl: p.githubUrl || "", demoUrl: p.demoUrl || "", featured: p.featured, order: p.order });
  };

  return (
    <div className="space-y-8 pb-10 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight mb-1">Projects</h1>
          <p className="text-sm text-muted-foreground/60">Manage your portfolio projects and case studies.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/[0.08]" style={{ background: "rgba(12,12,15,0.95)", backdropFilter: "blur(24px)" }}>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
              <DialogDescription>Fill in the details or use the AI suggestion button to auto-generate content.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <ProjectForm formData={formData} setFormData={setFormData} />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl border-white/[0.08]">Cancel</Button>
                <Button type="submit" disabled={createProject.isPending} className="rounded-xl">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/[0.08]" style={{ background: "rgba(12,12,15,0.95)", backdropFilter: "blur(24px)" }}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update the project details or use the AI suggestion button to refresh content.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <ProjectForm formData={formData} setFormData={setFormData} />
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditingProject(null)} className="rounded-xl border-white/[0.08]">Cancel</Button>
              <Button type="submit" disabled={updateProject.isPending} className="rounded-xl">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-5 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-60 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)" }} />)}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-3xl border border-white/[0.07] overflow-hidden flex flex-col transition-all duration-200 hover:border-primary/20 shadow-xl shadow-black/20"
              style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(16px)" }}
            >
              <div className="h-44 relative overflow-hidden bg-white/[0.03]">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20 gap-2">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-xs font-mono uppercase tracking-wider">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {project.featured && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" /> Featured
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-xl" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => openEdit(project)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border-0 text-rose-400" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-primary uppercase tracking-wider">{project.category}</span>
                  <span className="text-xs text-muted-foreground/40 font-mono">#{project.order}</span>
                </div>
                <h3 className="text-base font-heading font-bold mb-1.5">{project.title}</h3>
                <p className="text-xs text-muted-foreground/60 line-clamp-2 mb-4 leading-relaxed flex-1">{project.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                  <p className="text-xs text-muted-foreground/40 truncate flex-1 mr-3 font-mono">{project.technologies.slice(0, 3).join(" · ")}</p>
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center rounded-3xl border border-dashed border-white/[0.07] flex flex-col items-center">
          <div className="w-14 h-14 rounded-3xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-5">
            <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-heading font-bold mb-2">No projects yet</h3>
          <p className="text-sm text-muted-foreground/50 mb-6">Create your first project to get started.</p>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 rounded-xl"><Plus className="w-4 h-4" /> New Project</Button>
        </div>
      )}
    </div>
  );
}
