/** Flattens the stored `data` JSON blob back onto the report the frontend expects. */
module.exports = function serializeReport(report) {
  const data = report.data || {};
  return {
    id: report.id,
    filename: report.filename,
    companyName: data.companyName || "",
    period: data.period || "",
    currency: data.currency || "USD",
    extractedData: data,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
};
