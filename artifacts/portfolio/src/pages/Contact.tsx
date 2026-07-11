import { useSendMessage, useGetProfile } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, ExternalLink, Send, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  content: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { data: profile } = useGetProfile();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", content: "" },
  });

  const onSubmit = (data: ContactFormValues) => {
    sendMessage.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Message sent!", description: "Thanks for reaching out. I'll get back to you soon." });
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to send", description: "Please try again or contact me directly.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="w-full pb-32">
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20 max-w-2xl"
          >
            <p className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-5">Contact</p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold tracking-tight mb-5">Get in touch</h1>
            <p className="text-lg md:text-xl text-muted-foreground/70 leading-relaxed">
              Have a project in mind or want to collaborate? I'm always open to discussing new opportunities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-[1fr_1.6fr] gap-12 md:gap-20">
            {/* Left column — info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-10"
            >
              <div>
                <h2 className="text-lg font-heading font-semibold mb-6 text-foreground/80">Contact Information</h2>
                <div className="flex flex-col gap-4">
                  {profile?.email && (
                    <a href={`mailto:${profile.email}`}
                      className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:border-primary/25 hover:bg-primary/5 transition-all duration-200">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-0.5">Email</p>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{profile.email}</p>
                      </div>
                    </a>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-0.5">Location</p>
                        <p className="text-sm font-medium">{profile.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold mb-6 text-foreground/80">Connect</h2>
                <div className="flex flex-col gap-2">
                  {profile?.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground/70 hover:text-foreground border border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-200">
                      <Github className="w-4 h-4 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                    </a>
                  )}
                  {profile?.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground/70 hover:text-foreground border border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-200">
                      <Linkedin className="w-4 h-4 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">LinkedIn</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                    </a>
                  )}
                  {profile?.cvUrl && (
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground/70 hover:text-foreground border border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-200">
                      <svg className="w-4 h-4 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                      <span className="text-sm font-medium">Resume / CV</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right column — form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="rounded-3xl border border-white/[0.07] p-8 md:p-10 shadow-2xl shadow-black/30"
                style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)" }}>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground/60 uppercase tracking-wider">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field}
                              className="bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/50 focus-visible:border-primary/40 h-11 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground/60 uppercase tracking-wider">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field}
                              className="bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/50 focus-visible:border-primary/40 h-11 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground/60 uppercase tracking-wider">Subject <span className="normal-case text-muted-foreground/40">(optional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="What's this about?" {...field}
                            className="bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/50 focus-visible:border-primary/40 h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="content" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground/60 uppercase tracking-wider">Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell me about your project..." {...field}
                            className="min-h-[160px] bg-white/[0.04] border-white/[0.08] focus-visible:ring-primary/50 focus-visible:border-primary/40 rounded-xl resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={sendMessage.isPending}
                      className="w-full h-12 rounded-xl font-semibold text-sm gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow mt-2">
                      {sendMessage.isPending ? "Sending…" : <><Send className="w-4 h-4" /> Send Message</>}
                    </Button>
                  </form>
                </Form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
