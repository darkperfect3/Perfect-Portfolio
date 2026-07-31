import { Router, Request, Response } from "express";
import {
  conversationsCollection,
  messagesCollection,
  getNextSequence,
} from "@workspace/db";
import { relayChatCompletion, type RelayMessage } from "@workspace/integrations-ai-relay";

const router = Router();

const SYSTEM_PROMPT = `Tu es l'assistant IA du site portfolio de Perfect Dev, un développeur full stack.
Ton rôle : accueillir chaleureusement chaque visiteur, te présenter brièvement, et le guider dans le site
(page Accueil, Projets, Parcours, Contact). Réponds toujours en français sauf si le visiteur écrit dans une autre langue.
Sois concis, chaleureux et professionnel. Si le visiteur veut contacter le propriétaire, oriente-le vers la page /contact.
Tu ne dois jamais inventer d'informations précises (chiffres, dates) que tu ne connais pas sur le propriétaire.`;

async function getOrCreateConversation(visitorId: string) {
  const existing = await conversationsCollection.findOne({ visitorId, kind: "public_chat" });
  if (existing) return existing;

  const id = await getNextSequence("conversations");
  const conversation = {
    id,
    _id: id,
    title: `Visiteur ${visitorId.slice(0, 8)}`,
    kind: "public_chat",
    visitorId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await conversationsCollection.insertOne(conversation);
  return conversation;
}

router.get("/history/:visitorId", async (req: Request, res: Response): Promise<void> => {
  try {
    const visitorId = String(req.params.visitorId);
    const conversation = await conversationsCollection.findOne({ visitorId, kind: "public_chat" });

    if (!conversation) {
      res.json([]);
      return;
    }

    const history = await messagesCollection
      .find({ conversationId: conversation.id })
      .sort({ createdAt: 1 })
      .project({ role: 1, content: 1, createdAt: 1, _id: 0 })
      .toArray();

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

    const priorMessages = await messagesCollection
      .find({ conversationId: conversation.id })
      .sort({ createdAt: 1 })
      .project({ role: 1, content: 1, _id: 0 })
      .limit(20)
      .toArray();

    const userMessageId = await getNextSequence("messages");
    await messagesCollection.insertOne({
      id: userMessageId,
      _id: userMessageId,
      conversationId: conversation.id,
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    const relayMessages: RelayMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...priorMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const { content } = await relayChatCompletion(relayMessages, { maxTokens: 512 });

    const assistantMessageId = await getNextSequence("messages");
    await messagesCollection.insertOne({
      id: assistantMessageId,
      _id: assistantMessageId,
      conversationId: conversation.id,
      role: "assistant",
      content,
      createdAt: new Date(),
    });

    await conversationsCollection.updateOne(
      { id: conversation.id },
      { $set: { updatedAt: new Date() } },
    );

    res.json({ reply: content });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
