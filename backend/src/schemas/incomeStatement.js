const { z } = require("zod");

const LINE_ITEM_KEYS = [
  "revenue",
  "costOfRevenue",
  "grossProfit",
  "researchDevelopment",
  "salesMarketing",
  "generalAdministrative",
  "operatingIncome",
  "interestExpense",
  "incomeTax",
  "netIncome",
];

const lineItemValueSchema = z.object({
  value: z.number(),
  confidence: z.number().min(0).max(1).default(1),
});

const lineItemsSchema = z
  .object(Object.fromEntries(LINE_ITEM_KEYS.map((key) => [key, lineItemValueSchema.optional()])))
  .partial();

const incomeStatementSchema = z.object({
  companyName: z.string().trim().default(""),
  period: z.string().trim().default(""),
  currency: z.string().trim().default("USD"),
  lineItems: lineItemsSchema.default({}),
});

module.exports = { LINE_ITEM_KEYS, lineItemValueSchema, lineItemsSchema, incomeStatementSchema };
