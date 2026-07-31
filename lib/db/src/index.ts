import { MongoClient, type Collection, type Db, ReturnDocument } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to provision a MongoDB database?",
  );
}

const mongoClient = new MongoClient(process.env.MONGODB_URI);

const databaseName = (() => {
  try {
    const uri = new URL(process.env.MONGODB_URI);
    return uri.pathname?.slice(1) || "attachment-manager";
  } catch {
    return "attachment-manager";
  }
})();

export const client = mongoClient;
export const db: Db = mongoClient.db(databaseName);

async function ensureConnected(): Promise<void> {
  await mongoClient.connect();
}

async function getNextSequence(name: string): Promise<number> {
  await ensureConnected();
  const result = (await db
    .collection<{ _id: string; seq: number }>("counters")
    .findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { returnDocument: ReturnDocument.AFTER, upsert: true },
    )) as { value: { seq: number } | null } | null;

  if (!result?.value) {
    throw new Error(`Unable to get next sequence value for "${name}"`);
  }

  return result.value.seq;
}

export interface Profile {
  _id: number;
  id: number;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
  email: string | null;
  location: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  whatsappUrl: string | null;
  cvUrl: string | null;
  skills: string[];
  updatedAt: Date;
}

export interface Project {
  _id: number;
  id: number;
  title: string;
  description: string;
  longDescription: string | null;
  imageUrl: string | null;
  technologies: string[];
  category: string;
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
}

export interface TimelineEntry {
  _id: number;
  id: number;
  title: string;
  organization: string;
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  type: "education" | "work" | "achievement";
  order: number;
}

export interface ContactMessage {
  _id: number;
  id: number;
  name: string;
  email: string;
  subject: string | null;
  content: string;
  read: boolean;
  aiSummary: string | null;
  aiIntent: string | null;
  createdAt: Date;
}

export interface PageView {
  _id: number;
  id: number;
  page: string;
  referrer: string | null;
  visitorId: string | null;
  createdAt: Date;
}

export interface Conversation {
  _id: number;
  id: number;
  title: string;
  kind: string;
  visitorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: number;
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface SecurityAlert {
  _id: number;
  id: number;
  attemptedEmail: string;
  attemptedPassword: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export const profileCollection: Collection<Profile> = db.collection("profile");
export const projectsCollection: Collection<Project> = db.collection("projects");
export const timelineCollection: Collection<TimelineEntry> = db.collection("timeline");
export const contactMessagesCollection: Collection<ContactMessage> = db.collection("contact_messages");
export const pageViewsCollection: Collection<PageView> = db.collection("page_views");
export const conversationsCollection: Collection<Conversation> = db.collection("conversations");
export const messagesCollection: Collection<Message> = db.collection("messages");
export const securityAlertsCollection: Collection<SecurityAlert> = db.collection("security_alerts");

export { getNextSequence };
