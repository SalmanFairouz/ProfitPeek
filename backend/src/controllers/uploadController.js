const prisma = require("../lib/prisma");
const anthropic = require("../lib/anthropic");
const serializeReport = require("../utils/serializeReport");
const { LINE_ITEM_KEYS, incomeStatementSchema } = require("../schemas/incomeStatement");

const EXTRACTION_MODEL = "claude-sonnet-5";

const EXTRACTION_TOOL = {
  name: "record_income_statement",
  description: "Record the income statement data extracted from the uploaded financial document.",
  input_schema: {
    type: "object",
    properties: {
      companyName: { type: "string", description: "Company name, or empty string if not found" },
      period: { type: "string", description: "Reporting period, e.g. 'Q2 2026' or 'FY 2025', or empty string if not found" },
      currency: { type: "string", description: "ISO 4217 currency code, e.g. 'USD'" },
      lineItems: {
        type: "object",
        description: "Only include keys for line items actually present in the document.",
        properties: Object.fromEntries(
          LINE_ITEM_KEYS.map((key) => [
            key,
            {
              type: "object",
              properties: {
                value: { type: "number", description: "Amount in the stated currency" },
                confidence: { type: "number", description: "0-1 confidence the value and label were read correctly" },
              },
              required: ["value", "confidence"],
            },
          ]),
        ),
      },
    },
    required: ["companyName", "period", "currency", "lineItems"],
  },
};

async function extractIncomeStatement(buffer) {
  const message = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 2048,
    tools: [EXTRACTION_TOOL],
    tool_choice: { type: "tool", name: "record_income_statement" },
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: buffer.toString("base64") } },
          {
            type: "text",
            text: "Extract the income statement from this financial document using the record_income_statement tool. Only include line items that actually appear in the document.",
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return structured data");
  return incomeStatementSchema.parse(toolUse.input);
}

async function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file was uploaded" });
  }

  let extractedData;
  try {
    extractedData = await extractIncomeStatement(req.file.buffer);
  } catch (err) {
    console.error("Extraction failed:", err);
    return res.status(502).json({ error: "Failed to extract data from this PDF. Try re-uploading it." });
  }

  const report = await prisma.report.create({
    data: { userId: req.userId, filename: req.file.originalname, data: extractedData },
  });

  const serialized = serializeReport(report);
  res.status(201).json({ reportId: serialized.id, extractedData: serialized.extractedData });
}

module.exports = { upload };
