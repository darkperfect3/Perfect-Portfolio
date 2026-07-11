import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, contactMessagesTable, pageViewsTable, projectsTable, timelineTable, profileTable } from "@workspace/db";
import { eq, count, countDistinct, sql, desc } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import { relayChatCompletion } from "@workspace/integrations-ai-relay";

const router = Router();

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

async function buildAdminContext() {
  const [totalViewsResult] = await db.select({ count: count() }).from(pageViewsTable);
  const [uniqueVisitorsResult] = await db.select({ count: countDistinct(pageViewsTable.visitorId) }).from(pageViewsTable);
  const [unreadMessagesResult] = await db.select({ count: count() }).from(contactMessagesTable).where(eq(contactMessagesTable.read, false));
  const [totalMessagesResult] = await db.select({ count: count() }).from(contactMessagesTable);

  const topPages = await db
    .select({ page: pageViewsTable.page, views: count(pageViewsTable.id) })
    .from(pageViewsTable)
    .groupBy(pageViewsTable.page)
    .orderBy(sql`count(${pageViewsTable.id}) desc`)
    .limit(5);

  const recentViews = await db
    .select({ page: pageViewsTable.page, visitorId: pageViewsTable.visitorId, createdAt: pageViewsTable.createdAt })
    .from(pageViewsTable)
    .orderBy(desc(pageViewsTable.createdAt))
    .limit(10);

  const recentMessages = await db
    .select({ id: contactMessagesTable.id, name: contactMessagesTable.name, subject: contactMessagesTable.subject, content: contactMessagesTable.content, read: contactMessagesTable.read, createdAt: contactMessagesTable.createdAt })
    .from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt))
    .limit(10);

  const projects = await db
    .select({ id: projectsTable.id, title: projectsTable.title, category: projectsTable.category, featured: projectsTable.featured })
    .from(projectsTable);

  const timeline = await db
    .select({ title: timelineTable.title, organization: timelineTable.organization, type: timelineTable.type })
    .from(timelineTable);

  const [profile] = await db.select().from(profileTable).limit(1);

  const projectViewCounts = await db
    .select({ page: pageViewsTable.page, views: count(pageViewsTable.id) })
    .from(pageViewsTable)
    .where(sql`${pageViewsTable.page} like '/projects/%'`)
    .groupBy(pageViewsTable.page)
    .orderBy(sql`count(${pageViewsTable.id}) desc`)
    .limit(5);

  return {
    stats: {
      totalViews: totalViewsResult.count,
      uniqueVisitors: uniqueVisitorsResult.count,
      unreadMessages: unreadMessagesResult.count,
      totalMessages: totalMessagesResult.count,
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

router.post("/chat", requireAuth, async (req: Request, res: Response): Promise<void> => {
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

    const contents = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { systemInstruction: systemPrompt },
    });

    const reply = response.text ?? "";
    res.json({ reply });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analyze-message/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const messages = await db.select().from(contactMessagesTable).where(eq(contactMessagesTable.id, id));
    if (!messages[0]) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    const msg = messages[0];
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let analysis;
    try {
      const text = response.text?.trim() ?? "{}";
      analysis = JSON.parse(text);
    } catch {
      analysis = {
        summary: "Unable to analyze message",
        intent: "Unknown",
        suggestedReply: "Thank you for reaching out. I'll get back to you soon.",
        priority: "medium",
      };
    }

    await db
      .update(contactMessagesTable)
      .set({ aiSummary: analysis.summary, aiIntent: analysis.intent })
      .where(eq(contactMessagesTable.id, id));

    res.json(analysis);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard-summary", requireAuth, async (req: Request, res: Response): Promise<void> => {
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

router.post("/suggest-project", requireAuth, async (req: Request, res: Response): Promise<void> => {
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let suggestion;
    try {
      const text = response.text?.trim() ?? "{}";
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

router.post("/suggest-timeline", requireAuth, async (req: Request, res: Response): Promise<void> => {
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let suggestion;
    try {
      const text = response.text?.trim() ?? "{}";
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
