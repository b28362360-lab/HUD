/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    vendor_name: { type: Type.STRING, description: "The name of the store or service provider." },
    date: { type: Type.STRING, description: "The date of the transaction (format: YYYY-MM-DD)." },
    total_amount: { type: Type.NUMBER, description: "The final price paid (as a number)." },
    currency: { type: Type.STRING, description: "The currency symbol or code (e.g., ILS, USD, EUR)." },
    tax_amount: { type: Type.NUMBER, description: "The VAT/tax amount, if specified." },
    category: { 
      type: Type.STRING, 
      enum: ["Food", "Transport", "Supplies", "Utilities", "Travel", "Other"],
      description: "Categorize the expense into one of these: Food, Transport, Supplies, Utilities, Travel, or Other."
    },
    confidence_score: { type: Type.NUMBER, description: "Your confidence in the extraction (0.0 to 1.0)." }
  },
  required: ["vendor_name", "date", "total_amount", "currency", "category", "confidence_score"]
};

export async function extractReceiptData(base64Image: string, mimeType: string): Promise<ExtractionResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: "Analyze this receipt/invoice and extract key financial info according to the schema. " +
                    "Return ONLY a valid JSON object. Accuracy is critical. If a value is unreadable, set it to null. " +
                    "Use the transaction date, not the print date.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: EXTRACTION_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ExtractionResult;
  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
}
