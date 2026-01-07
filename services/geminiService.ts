
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Always use a named parameter for apiKey and obtain from process.env.API_KEY
const getAIClient = () => {
  // Use process.env.API_KEY directly as required by guidelines
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const streamChatResponse = async (
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  onChunk: (text: string) => void,
  onMetadata?: (metadata: any) => void
) => {
  const ai = getAIClient();
  // Using gemini-3-flash-preview as recommended for basic/general text tasks
  const model = 'gemini-3-flash-preview';

  try {
    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: m.parts
    }));
    
    // Use ai.chats.create for chat-based interactions
    const chat = ai.chats.create({
      model: model,
      history: history,
      config: {
        systemInstruction: "أنت 'ابتكار'، مساعد ذكي عالمي المستوى. تمتاز بالدقة، الذكاء، واللباقة. استخدم ميزة البحث لتوفير معلومات محدثة دائماً. قم بتنسيق الإجابات بشكل احترافي باستخدام Markdown.",
        tools: [{ googleSearch: {} }]
      },
    });

    const lastMessage = messages[messages.length - 1].parts[0].text;

    // Use sendMessageStream which is the correct method for chat streaming
    const result = await chat.sendMessageStream({ message: lastMessage });

    for await (const chunk of result) {
      // Access the .text property directly, do not call it as a function
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
      
      // Extract grounding metadata if available
      const groundingMetadata = (chunk as GenerateContentResponse).candidates?.[0]?.groundingMetadata;
      if (groundingMetadata && onMetadata) {
        onMetadata(groundingMetadata);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
