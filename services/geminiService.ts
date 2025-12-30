
import { GoogleGenAI, Type } from "@google/genai";

// Always use the process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSearchSuggestions = async (query: string) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide 5 concise search suggestions for a book-sharing app based on this input: "${query}". Return only the titles as a list.`,
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
      // Fallback if JSON parsing fails
      return response.text.split('\n').map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
    }
  } catch (error) {
    console.error("Suggestion Error:", error);
    return [];
  }
};

export const getAIAssistantResponse = async (userMessage: string, context?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the Campus Shelf AI Assistant. Help the user with: 
      1. Finding books or digital resources.
      2. Troubleshooting issues with the "Campus Shelf" app (an exchange/donation platform).
      3. General campus advice and book recommendations.
      User context: ${context || 'General student'}.
      User message: ${userMessage}`,
      config: {
        systemInstruction: "You are a helpful, witty, and high-tech AI assistant for a campus book-sharing platform called Campus Shelf. Use student-friendly language."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "I'm having a little trouble connecting to the campus mainframe. Try again in a second!";
  }
};

export const analyzeBookCondition = async (imageBase64: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
          { text: "Analyze this book's condition. Is the cover damaged? Are pages yellow? Give a 1-sentence summary." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not analyze condition via AI.";
  }
};

export const getBookRecommendation = async (courseName: string, semester: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a must-read textbook for a student studying ${courseName} in Semester ${semester}. Provide the book title, author, and a 1-sentence reason why it is essential.`,
    });
    return response.text;
  } catch (error) {
    return "Standard Engineering Mathematics by K.A. Stroud. Essential for core logic building.";
  }
};

export const getBookPreview = async (bookTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed 3-point summary/preview for the book titled "${bookTitle}". Include: 1. Main theme, 2. Key topics covered, 3. Target audience. Keep it concise.`,
    });
    return response.text;
  } catch (error) {
    return "Unable to retrieve preview. Please try a specific title.";
  }
};

export const searchEBooks = async (subject: string, semester: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a university digital librarian. Recommend 3 high-quality free/open-source PDF or E-Book resources for "${subject}" in Semester ${semester}. Format: Resource Name (Source/Site).`,
    });
    return response.text;
  } catch (error) {
    return "1. MIT OpenCourseWare Lecture Notes\n2. Project Gutenberg Digital Archive\n3. Library Genesis Academic Collection";
  }
};

export const getCampusNetworkingTip = async (branch: string, interest: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give a one-sentence icebreaker for a student in ${branch} to connect with someone interested in ${interest} on a campus book-sharing app.`,
    });
    return response.text;
  } catch (error) {
    return "Hey! I saw you're into ${interest} too. Have you checked out any great books on it lately?";
  }
};

export const findNearbyLibraries = async (latitude: number, longitude: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find the 5 nearest public or university libraries to my current location. List their names and provide Google Maps links for each.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: latitude,
              longitude: longitude
            }
          }
        }
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract URIs from grounding chunks
    const links = groundingChunks
      .filter((chunk: any) => chunk.maps?.uri)
      .map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri
      }));

    return { text, links };
  } catch (error) {
    console.error("Maps Error:", error);
    return { text: "Could not find nearby libraries at this time.", links: [] };
  }
};
