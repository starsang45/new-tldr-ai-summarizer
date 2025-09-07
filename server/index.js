import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import OpenAI from "openai";

// ✅ 환경 변수 로드
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ 요약 엔드포인트
app.post("/api/generate-summary", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // 1️⃣ Puppeteer로 페이지 텍스트 크롤링
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const content = await page.evaluate(() => {
      return document.body.innerText.slice(0, 4000); // 긴 페이지 방어
    });

    await browser.close();

    // 2️⃣ OpenAI로 요약
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes web pages in under 300 characters.",
        },
        {
          role: "user",
          content: `Summarize this page in under 300 characters:\n\n${content}`,
        },
      ],
    });

    const summary = completion.choices[0].message.content;

    // 3️⃣ 응답 반환
    res.json({ url, summary });
  } catch (error) {
    console.error("❌ Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
