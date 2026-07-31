import { Router, Request, Response } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import {
  contactMessagesCollection,
  pageViewsCollection,
  projectsCollection,
  timelineCollection,
  profileCollection,
} from "@workspace/db";
import { relayChatCompletion } from "@workspace/integrations-ai-relay";

const router = Router();


async function buildAdminContext() {
  const totalViews = await pageViewsCollection.countDocuments();
  const uniqueVisitors = await pageViewsCollection.distinct("visitorId", { visitorId: { $ne: null } });
  const unreadMessages = await contactMessagesCollection.countDocuments({ read: false });
  const totalMessages = await contactMessagesCollection.countDocuments();

  const topPages = await pageViewsCollection
    .aggregate<{ page: string; views: number }>([
      { $group: { _id: "$page", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, page: "$_id", views: 1 } },
    ])
    .toArray();

  const recentViews = await pageViewsCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(10)
    .project<{ page: string; visitorId: string | null; createdAt: Date }>({ page: 1, visitorId: 1, createdAt: 1, _id: 0 })
    .toArray();

  const recentMessages = await contactMessagesCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(10)
    .project<{ id: number; name: string; subject: string | null; content: string; read: boolean; createdAt: Date }>({ id: 1, name: 1, subject: 1, content: 1, read: 1, createdAt: 1, _id: 0 })
    .toArray();

  const projects = await projectsCollection
    .find()
    .project<{ id: number; title: string; category: string; featured: boolean }>({ id: 1, title: 1, category: 1, featured: 1, _id: 0 })
    .toArray();

  const timeline = await timelineCollection
    .find()
    .project<{ title: string; organization: string; type: string }>({ title: 1, organization: 1, type: 1, _id: 0 })
    .toArray();

  const profile = await profileCollection.findOne();

  const projectViewCounts = await pageViewsCollection
    .aggregate([
      { $match: { page: { $regex: "^/projects/" } } },
      { $group: { _id: "$page", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, page: "$_id", views: 1 } },
    ])
    .toArray();

  return {
    stats: {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      unreadMessages,
      totalMessages,
      totalProjects: projects.length,
    },
    topPages,
    projectViewCounts,
    recentViews,
    recentMessages,
    projects,
    timeline,
    profile,
  };
}

function contextToPromptText(ctx: Awaited<ReturnType<typeof buildAdminContext>>): string {
  return `Contexte actuel de l'administration du portfolio (données réelles, en direct) :

Propriétaire: ${ctx.profile?.name ?? "N/A"} - ${ctx.profile?.title ?? "N/A"}

Statistiques:
- Vues totales: ${ctx.stats.totalViews}
- Visiteurs uniques: ${ctx.stats.uniqueVisitors}
- Messages non lus: ${ctx.stats.unreadMessages} / ${ctx.stats.totalMessages} au total
- Nombre de projets: ${ctx.stats.totalProjects}

Pages les plus visitées: ${ctx.topPages.map((p) => `${p.page} (${p.views} vues)`).join(", ") || "aucune donnée"}
Projets les plus consultés: ${ctx.projectViewCounts.map((p) => `${p.page} (${p.views} vues)`).join(", ") || "aucune donnée"}

Visites récentes (10 dernières): ${ctx.recentViews.map((v) => `${v.page} par ${v.visitorId?.slice(0, 8) ?? "anonyme"}`).join(", ") || "aucune"}

Messages récents: ${ctx.recentMessages.map((m) => `[${m.read ? "lu" : "NON LU"}] ${m.name}${m.subject ? ` - ${m.subject}` : ""}: ${m.content.slice(0, 80)}`).join(" | ") || "aucun"}

Liste des projets: ${ctx.projects.map((p) => `${p.title} (${p.category}${p.featured ? ", mis en avant" : ""})`).join(", ") || "aucun"}

Parcours (timeline): ${ctx.timeline.map((t) => `${t.title} @ ${t.organization} (${t.type})`).join(", ") || "aucun"}`;
}

router.post("/chat", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const ctx = await buildAdminContext();

    const systemPrompt = `Tu es un assistant admin intelligent pour un site portfolio professionnel.
Tu aides le propriétaire du portfolio à gérer son contenu, analyser les messages de visiteurs, comprendre le comportement des visiteurs en temps réel, et prendre des décisions.
Tu as un accès complet et à jour aux données ci-dessous : statistiques de visites, pages/projets les plus consultés, visiteurs récents, messages de contact, projets, et parcours professionnel.
Utilise ces données pour répondre précisément aux questions sur le comportement des visiteurs, les messages, les projets les plus populaires, etc.
Tu peux aussi aider à rédiger des descriptions de projets, des réponses aux messages, et donner des analyses. Sois concis, professionnel et utile. Réponds dans la langue du message de l'utilisateur.

${contextToPromptText(ctx)}`;

    const messagesList: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    const { content: reply = "" } = await relayChatCompletion(
      messagesList,
      { maxTokens: 1024 },
    );

    res.json({ reply });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analyze-message/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const msg = await contactMessagesCollection.findOne({ id });
    if (!msg) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    const prompt = `Analyze this contact message from a portfolio website visitor:

From: ${msg.name} <${msg.email}>
Subject: ${msg.subject || "No subject"}
Message: ${msg.content}

Provide a JSON response with:
- summary: 1-2 sentence summary of the message
- intent: what the sender wants (e.g., "Job inquiry", "Collaboration request", "General inquiry", "Client project")  
- suggestedReply: a professional, brief reply draft
- priority: "low", "medium", or "high" based on the opportunity

Respond ONLY with valid JSON, no markdown.`;

    const { content } = await relayChatCompletion(
      [{ role: "user", content: prompt }],
      { maxTokens: 512 },
    );

    let analysis;
    try {
      const text = content.trim() || "{}";
      analysis = JSON.parse(text);
    } catch {
      analysis = {
        summary: "Unable to analyze message",
        intent: "Unknown",
        suggestedReply: "Thank you for reaching out. I'll get back to you soon.",
        priority: "medium",
      };
    }

    await contactMessagesCollection.updateOne(
      { id },
      { $set: { aiSummary: analysis.summary, aiIntent: analysis.intent } },
    );

    res.json(analysis);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard-summary", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const ctx = await buildAdminContext();

    const statsPrompt = `${contextToPromptText(ctx)}

Fais un résumé clair et concis en français (5-7 phrases max) pour le propriétaire du site qui vient de se connecter à son tableau de bord admin. Mets en avant : le comportement des visiteurs récents, les pages/projets les plus consultés, les messages non lus qui méritent son attention, et toute tendance importante. Sois direct et actionnable.`;

    const { content } = await relayChatCompletion([
      { role: "system", content: "Tu es un assistant admin qui résume des statistiques de tableau de bord de façon claire et actionnable." },
      { role: "user", content: statsPrompt },
    ]);

    res.json({ reply: content });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/suggest-project", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title = "", description = "", category = "", technologies = "" } = req.body ?? {};

    const prompt = `Tu aides le propriétaire d'un portfolio à remplir la fiche d'un projet.
Voici ce qu'il a déjà saisi (peut être vide ou partiel) :
- Titre: ${title || "(vide)"}
- Description courte: ${description || "(vide)"}
- Catégorie: ${category || "(vide)"}
- Technologies: ${technologies || "(vide)"}

Complète et améliore ces informations pour un projet de portfolio professionnel crédible et cohérent avec ce qui est déjà fourni. Si un champ est vide, invente quelque chose de plausible et cohérent avec les autres champs déjà remplis ; si un champ est déjà rempli, améliore-le légèrement (accroche-le, rends-le plus pro) sans le dénaturer.

Réponds UNIQUEMENT avec un JSON valide (pas de markdown) au format :
{
  "title": "...",
  "description": "une description courte, 1-2 phrases",
  "longDescription": "une description plus longue et détaillée, 3-5 phrases",
  "category": "une catégorie courte comme Web, Mobile, IA, Backend, etc.",
  "technologies": "liste de technologies séparées par des virgules, ex: React, Node.js, PostgreSQL"
}`;

    const { content } = await relayChatCompletion(
      [{ role: "user", content: prompt }],
      { maxTokens: 512 },
    );

    let suggestion;
    try {
      const text = content.trim() || "{}";
      suggestion = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/, ""));
    } catch {
      res.status(502).json({ error: "AI returned an invalid response" });
      return;
    }

    res.json(suggestion);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/suggest-timeline", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title = "", organization = "", description = "", type = "" } = req.body ?? {};

    const prompt = `Tu aides le propriétaire d'un portfolio à remplir une entrée de son parcours (timeline).
Voici ce qu'il a déjà saisi (peut être vide ou partiel) :
- Titre / rôle: ${title || "(vide)"}
- Organisation: ${organization || "(vide)"}
- Description: ${description || "(vide)"}
- Type: ${type || "(vide, choisir entre work, education, achievement)"}

Complète et améliore ces informations de façon cohérente et professionnelle. Si un champ est vide, invente quelque chose de plausible cohérent avec les autres champs déjà remplis ; si un champ est déjà rempli, améliore-le légèrement sans le dénaturer.

Réponds UNIQUEMENT avec un JSON valide (pas de markdown) au format :
{
  "title": "...",
  "organization": "...",
  "description": "2-3 phrases décrivant le rôle, les responsabilités ou l'accomplissement",
  "type": "work" | "education" | "achievement"
}`;

    const { content } = await relayChatCompletion(
      [{ role: "user", content: prompt }],
      { maxTokens: 512 },
    );

    let suggestion;
    try {
      const text = content.trim() || "{}";
      suggestion = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/, ""));
    } catch {
      res.status(502).json({ error: "AI returned an invalid response" });
      return;
    }

    res.json(suggestion);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
