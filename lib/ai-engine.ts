import { GoogleGenAI, Type } from "@google/genai";
import { COMP_REGISTRY } from "./shopify-registry";

export async function callAI(prompt: string, currentSections: any[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
  const available = Object.keys(COMP_REGISTRY);
  const stylesMap = Object.fromEntries(Object.entries(COMP_REGISTRY).map(([k, v]) => [k, v.styles]));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Current page has: ${currentSections.map(s => s.component).join(", ") || "nothing"}.
User request: "${prompt}"
Generate sections to add or a full page layout.`,
    config: {
      systemInstruction: `You are a Shopify theme layout architect. Generate layout JSON for Shopify Online Store 2.0 themes.

Available components: ${available.join(", ")}
Component styles: ${JSON.stringify(stylesMap)}

Respond ONLY with valid JSON (no markdown, no preamble).

Rules:
- ONLY use available component names
- ONLY use valid styles for each component
- Settings must match the component's schema fields
- Return 2-6 sections that make sense together
- Never generate raw Liquid code`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                component: { type: Type.STRING, description: "One of the available components" },
                style: { type: Type.STRING, description: "A valid style for that component" },
                settings: { type: Type.OBJECT, description: "Relevant settings for the component" }
              },
              required: ["component", "style", "settings"]
            }
          },
          explanation: { type: Type.STRING, description: "Brief description of the generated layout" }
        },
        required: ["sections", "explanation"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}
