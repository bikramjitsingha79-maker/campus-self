
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSearchSuggestions = async (query: string) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide 5 concise academic search suggestions for a premium book-sharing app based on this input: "${query}". Focus on textbooks, authors, and 2026 curriculum. Return only the titles as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      }
    });
    
    try {
      return JSON.parse(response.text);
    } catch {
      return response.text.split('\n').map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
    }
  } catch (error) {
    console.error("Suggestion Error:", error);
    return [];
  }
};

export const getBookRecommendation = async (dept: string, semester: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest exactly 3 required high-standard textbooks for a student in the ${dept} department during Semester ${semester}. For each book, provide the title, author, and a 1-sentence explanation of why it's a mandatory core resource. Format clearly with bullet points.`,
    });
    return response.text;
  } catch (error) {
    return "Failed to retrieve suggestions. Ensure your department details are correct.";
  }
};

export const getBookPreview = async (bookTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give a high-quality preview of the textbook "${bookTitle}". Include a 3-sentence summary of its core curriculum value, its current edition status, and which competitive exams it helps with. Keep it professional and academic.`,
    });
    return response.text;
  } catch (error) {
    return "Detailed preview unavailable for this specific title. Please try searching for a well-known academic textbook.";
  }
};

export const searchEBooks = async (subject: string, semester: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List 4 premium digital/e-book resource links (mentioning sites like MIT OCW, Project Gutenberg, or NPTEL) for "${subject}" at a ${semester} level. Provide brief descriptions of what each link offers. Focus on open-access excellence.`,
    });
    return response.text;
  } catch (error) {
    return "Digital archive connection failed. Check your network or try a broader subject name.";
  }
};
