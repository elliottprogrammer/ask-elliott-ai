import express from "express";
import { streamAnswer } from "./query-vector-store.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const app = express();
app.use(express.json());

const applyCors = (res) => {
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value);
  }
};

app.options("/elliott-ai", (req, res) => {
  applyCors(res);
  res.sendStatus(200);
});

app.post("/elliott-ai", async (req, res) => {
  applyCors(res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const question = (req.body?.question || "").trim();
  if (!question) {
    return res
      .status(400)
      .json({ error: "Missing 'question' in request body" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const { matches } = await streamAnswer(question, (token) => {
      res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ type: "metadata", matches })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.write(
      `data: ${JSON.stringify({ type: "error", message })}\n\n`
    );
    res.end();
  }
});

const port = process.env.PORT || 8888;
app.listen(port, () => {
  console.log(`Elliott-AI dev server listening on http://localhost:${port}`);
});
