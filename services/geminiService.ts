
import { GoogleGenAI } from "@google/genai";
import { SaleRecord } from "../types";
import { Language } from "../translations";

export const analyzeSalesData = async (data: SaleRecord[], lang: Language = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const languageInstruction = lang === 'zh' 
    ? "Please respond entirely in Chinese." 
    : "Please respond entirely in English.";

  const prompt = `
    As a Senior Inventory and Financial Analyst, analyze the following sales data and provide a concise strategic report.
    ${languageInstruction}

    Focus on:
    1. Overall performance trends.
    2. Most profitable product categories and channels.
    3. Potential risks (low GP rate products or declining trends).
    4. Strategic recommendations for growth.

    Sales Data Summary:
    ${JSON.stringify(data.map(d => ({
      category: d.productCategory,
      profit: d.grossProfit,
      gpRate: d.grossProfitRate,
      channel: d.clientChannel,
      product: d.productName
    })), null, 2)}

    Format the response in Markdown with clear sections.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return lang === 'zh' 
      ? "目前无法生成 AI 洞察。请检查您的网络连接或 API 配置。"
      : "Unable to generate AI insights at this time. Please check your connection or API configuration.";
  }
};
