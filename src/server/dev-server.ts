import express, { type Request, type Response } from "express";
import { streamAnswer } from "./query-vector-store.ts";

type Match = {
  content?: string;
  source?: string;
  chunk?: string | number;
  score?: number;
  strategy?: string;
};

type StreamAnswerResult = {
  matches: Match[];
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const app = express();
app.use(express.json());

const applyCors = (res: Response) => {
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.setHeader(key, value);
  }
};

app.options("/elliott-ai", (_req: Request, res: Response) => {
  applyCors(res);
  res.sendStatus(200);
});

app.post("/elliott-ai", async (req: Request, res: Response) => {
  applyCors(res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const questionInput =
    typeof req.body?.question === "string" ? req.body.question : "";
  const question = questionInput.trim();
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
    const { matches } = (await streamAnswer(
      question,
      (token: string) => {
        res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
      }
    )) as StreamAnswerResult;

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
