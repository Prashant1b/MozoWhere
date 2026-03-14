const { GoogleGenerativeAI } = require("@google/generative-ai");

const getDesignSuggestions = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: "imageBase64 is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Extract base64 data (remove data:image/...;base64, prefix)
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;
    const mimeType = imageBase64.startsWith("data:")
      ? imageBase64.split(";")[0].split(":")[1]
      : "image/png";

    const prompt = `Analyze this design image that a user wants to print on a t-shirt or product.
Suggest 3 product color recommendations that would complement this design.
For each suggestion, provide: color name, hex code, and a brief reason (1 sentence).
Also suggest which product types this design suits best (t-shirt, hoodie, mug, cap, etc).

Return ONLY valid JSON in this exact format, no markdown:
{"suggestions":[{"color":"White","hex":"#FFFFFF","reason":"..."},{"color":"Black","hex":"#111827","reason":"..."},{"color":"Navy","hex":"#1e3a8a","reason":"..."}],"bestProductTypes":["t-shirt","hoodie"]}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const text = result.response.text();
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: "Failed to parse AI response" });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.json(parsed);
  } catch (err) {
    console.error("AI suggestion error:", err.message);
    if (err.message?.includes("429") || err.message?.includes("quota")) {
      return res.status(429).json({ message: "AI quota exceeded. Please try again later." });
    }
    return res.status(500).json({ message: "AI suggestion failed" });
  }
};

module.exports = { getDesignSuggestions };
