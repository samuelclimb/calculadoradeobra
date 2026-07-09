import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  cidade: text("cidade").notNull(),
  whatsapp: text("whatsapp"),
  tipoObra: text("tipo_obra").notNull(),
  tamanho: text("tamanho").notNull(),
  fase: text("fase").notNull(),
  projeto: text("projeto").notNull(),
  orcamento: text("orcamento").notNull(),
  medo: text("medo").notNull(),
  prazo: text("prazo").notNull(),
  investimento: text("investimento").notNull(),
  classificacao: text("classificacao").notNull(), // baixo | medio | alto | critico
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
