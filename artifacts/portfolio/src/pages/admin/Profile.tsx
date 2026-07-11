import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Globe, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  cvUrl: z.string().url().optional().or(z.literal("")),
  skills: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/[0.07] overflow-hidden shadow-xl shadow-black/20"
      style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(16px)" }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function AdminProfile() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", title: "", bio: "", email: "", location: "", githubUrl: "", linkedinUrl: "", cvUrl: "", skills: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name, title: profile.title, bio: profile.bio,
        email: profile.email || "", location: profile.location || "",
        githubUrl: profile.githubUrl || "", linkedinUrl: profile.linkedinUrl || "",
        cvUrl: profile.cvUrl || "", skills: profile.skills.join(", "),
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate({
      data: {
        ...data,
        skills: data.skills.split(",").map(s => s.trim()).filter(Boolean),
        email: data.email || null, location: data.location || null,
        githubUrl: data.githubUrl || null, linkedinUrl: data.linkedinUrl || null, cvUrl: data.cvUrl || null,
      }
    }, {
      onSuccess: (updated) => {
        toast({ title: "Profile updated" });
        queryClient.setQueryData(getGetProfileQueryKey(), updated);
      },
      onError: () => toast({ title: "Failed to update profile", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse pt-6">
        <div className="h-7 bg-white/5 rounded-xl w-1/4 mb-1" />
        <div className="h-4 bg-white/5 rounded w-1/3" />
        <div className="h-64 bg-white/5 rounded-3xl" />
        <div className="h-48 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  const inputClass = "bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/30 h-10 rounded-xl text-sm";

  return (
    <div className="space-y-6 pt-6 pb-10">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight mb-1">Profile</h1>
        <p className="text-sm text-muted-foreground/60">Manage your personal information and online presence.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          <SectionCard icon={User} title="Personal Info">
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">Full Name</FormLabel>
                    <FormControl><Input {...field} className={inputClass} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">Professional Title</FormLabel>
                    <FormControl><Input {...field} className={inputClass} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">Bio</FormLabel>
                  <FormControl><Textarea className="min-h-[110px] bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/30 rounded-xl text-sm resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid md:grid-cols-2 gap-5">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">Contact Email</FormLabel>
                    <FormControl><Input type="email" {...field} className={inputClass} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">Location</FormLabel>
                    <FormControl><Input {...field} className={inputClass} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Globe} title="Online Presence">
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <FormField control={form.control} name="githubUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">GitHub URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://github.com/..." {...field} className={inputClass} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">LinkedIn URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://linkedin.com/in/..." {...field} className={inputClass} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="cvUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">Resume / CV URL</FormLabel>
                  <FormControl><Input type="url" placeholder="https://..." {...field} className={inputClass} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </SectionCard>

          <SectionCard icon={Code2} title="Skills">
            <FormField control={form.control} name="skills" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground/50 uppercase tracking-wider">Skills <span className="normal-case text-muted-foreground/40">(comma separated)</span></FormLabel>
                <FormControl><Input placeholder="React, TypeScript, Node.js, PostgreSQL…" {...field} className={inputClass} /></FormControl>
                <FormMessage />
                {field.value && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {field.value.split(",").map(s => s.trim()).filter(Boolean).map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary/70">{s}</span>
                    ))}
                  </div>
                )}
              </FormItem>
            )} />
          </SectionCard>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateProfile.isPending} className="gap-2 rounded-xl px-6 shadow-lg shadow-primary/20">
              <Save className="w-4 h-4" />
              {updateProfile.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
