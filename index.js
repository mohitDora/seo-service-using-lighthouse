const express = require("express");
const { auditSEOJson } = require("./services/seoAuditJson");
const { auditSEOHtml } = require("./services/seoAuditHtml");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());

app.post("/audit-json", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const result = await auditSEOJson(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Audit failed", details: err.message });
  }
});

app.post("/audit-html", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  try {
    const result = await auditSEOHtml(url);
    res.sendFile(result.reportPath);
  } catch (err) {
    res.status(500).json({ error: "Audit failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
