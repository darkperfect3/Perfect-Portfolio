import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const securityAlertsTable = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  attemptedEmail: text("attempted_email").notNull(),
  attemptedPassword: text("attempted_password").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlertsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type SecurityAlert = typeof securityAlertsTable.$inferSelect;
