import { pgTable, text, serial, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timelineTypeEnum = pgEnum("timeline_type", ["education", "work", "achievement"]);

export const timelineTable = pgTable("timeline", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  current: boolean("current").notNull().default(false),
  type: timelineTypeEnum("type").notNull().default("work"),
  order: integer("order").notNull().default(0),
});

export const insertTimelineSchema = createInsertSchema(timelineTable).omit({ id: true });
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type TimelineEntry = typeof timelineTable.$inferSelect;
