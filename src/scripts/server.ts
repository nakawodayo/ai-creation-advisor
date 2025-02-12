// server.ts (例)
import dotenv from "dotenv";
dotenv.config();  // .env を読み込み

import express from "express";
import fetch from "node-fetch";  // node-fetch が必要な場合

const app = express();
app.use(express.json());

// POST /api などのルートを作ってフロントから fetch する
app.post("/api", async (req, res) => {
  try {
    // .env から読み込んだキー
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not found in environment variables.");
    }

    const userText = req.body.userText;
    // OpenAI APIへリクエスト
    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: userText }],
      })
    });

    const openAiData = await openAiRes.json();
    // 必要なレスポンスをフロントへ返す
    res.json({ response: openAiData.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
