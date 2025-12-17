import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";

// Note: Initialization is done inside the function to ensure 
// environment variables (secrets) are populated at runtime.

export const generateWish = onCall({ 
  secrets: ["GEMINI_API_KEY"],
  cors: true, // Enable CORS to allow calls from the frontend
  maxInstances: 10,
}, async (request) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Check if the secret is actually available
    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY is missing. Make sure to run 'firebase functions:secrets:set GEMINI_API_KEY'");
        throw new HttpsError('failed-precondition', 'Server API Key is not configured.');
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const model = "gemini-2.5-flash";
    const prompt = "Đóng vai một người bạn thân cực kỳ lầy lội, phũ mồm nhưng hài hước. Hãy viết 1 câu troll (trêu chọc) ngắn gọn về Giáng Sinh (dưới 25 từ). Chủ đề: Đòi quà, than nghèo, trêu ế, bóc phốt. Tuyệt đối KHÔNG dùng văn mẫu sến súa. KHÔNG dùng từ ngữ gượng gạo kiểu 'keo lỳ', 'tái châu'. Ví dụ: 'Lớn đầu rồi đừng đòi quà nữa', 'Tầm này liêm sỉ gì nữa', 'Alo mẹ à, con không về đâu'.";

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const text = response.text;
    
    if (!text) {
        console.warn("Gemini response was empty or blocked.");
        return { wish: "Noel vui vẻ nha! (AI bí từ)" };
    }

    return { wish: text };

  } catch (error: any) {
    console.error("Detailed Backend Error:", error);
    
    // If it's already an HttpsError, rethrow it
    if (error instanceof HttpsError) {
        throw error;
    }

    // Otherwise, throw an internal error with a sanitized message
    throw new HttpsError('internal', 'Unable to generate wish due to a server error.');
  }
});
