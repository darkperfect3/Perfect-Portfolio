import { Router, Request, Response } from "express";
import { db, conversations, messages } from "@workspace/db";
import { eq, asc, and } from "drizzle-orm";
import { relayChatCompletion, type RelayMessage } from "@workspace/integrations-ai-relay";

const router = Router();

const SYSTEM_PROMPT = `Tu es l'assistant IA du site portfolio de Perfect Dev, un développeur full stack.
Ton rôle : accueillir chaleureusement chaque visiteur, te présenter brièvement, et le guider dans le site
(page Accueil, Projets, Parcours, Contact). Réponds toujours en français sauf si le visiteur écrit dans une autre langue.
Sois concis, chaleureux et professionnel. Si le visiteur veut contacter le propriétaire, oriente-le vers la page /contact.
Tu ne dois jamais inventer d'informations précises (chiffres, dates) que tu ne connais pas sur le propriétaire.`;

async function getOrCreateConversation(visitorId: string) {
  const existing = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.visitorId, visitorId), eq(conversations.kind, "public_chat")))
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(conversations)
    .values({ title: `Visiteur ${visitorId.slice(0, 8)}`, kind: "public_chat", visitorId })
    .returning();

  return created;
}

router.get("/history/:visitorId", async (req: Request, res: Response): Promise<void> => {
  try {
    const visitorId = String(req.params.visitorId);
    const conversation = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.visitorId, visitorId), eq(conversations.kind, "public_chat")))
      .limit(1);

    if (!conversation[0]) {
      res.json([]);
      return;
    }

    const history = await db
      .select({ role: messages.role, content: messages.content, createdAt: messages.createdAt })
      .from(messages)
      .where(eq(messages.conversationId, conversation[0].id))
      .orderBy(asc(messages.createdAt));

    res.json(history.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/message", async (req: Request, res: Response): Promise<void> => {
  try {
    const { visitorId, message } = req.body as { visitorId?: string; message?: string };
    if (!visitorId || !message) {
      res.status(400).json({ error: "visitorId and message are required" });
      return;
    }

    const conversation = await getOrCreateConversation(visitorId);

    const priorMessages = await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, conversation.id))
      .orderBy(asc(messages.createdAt))
      .limit(20);

    await db.insert(messages).values({ conversationId: conversation.id, role: "user", content: message });

    const relayMessages: RelayMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...priorMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const { content } = await relayChatCompletion(relayMessages, { maxTokens: 512 });

    await db.insert(messages).values({ conversationId: conversation.id, role: "assistant", content });
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversation.id));

    res.json({ reply: content });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
