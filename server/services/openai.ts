import OpenAI from "openai";
import { CategorySuggestion } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function suggestTransactionCategory(data: CategorySuggestion): Promise<{
  category: string;
  subcategory: string;
  tags: string[];
  confidence: number;
}> {
  try {
    // Format prompt with transaction data
    const prompt = `
      Please analyze this banking transaction and categorize it:
      
      Transaction description: ${data.description}
      Amount: ${data.amount}
      Type: ${data.type} (deposit/withdrawal/transfer)
      
      Return a JSON object with these fields:
      - category: The primary category (one of: income, shopping, food, utilities, transportation, housing, entertainment, health, education, personal, travel, business, investments, transfers, uncategorized)
      - subcategory: More specific categorization
      - tags: Array of relevant tags (1-3 tags)
      - confidence: A number between 0 and 1 indicating your confidence level in this categorization
      
      Only respond with valid JSON in this exact format, no additional text.
    `;

    // Call the OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }
    
    const result = JSON.parse(content);
    
    return {
      category: result.category,
      subcategory: result.subcategory,
      tags: result.tags,
      confidence: result.confidence
    };
  } catch (error) {
    console.error("Error in suggestTransactionCategory:", error);
    // Return default category in case of an error
    return {
      category: "uncategorized",
      subcategory: "other",
      tags: [],
      confidence: 0
    };
  }
}

export async function getSimilarCategorizedTransactions(description: string, limit: number = 3): Promise<{
  similarTransactions: Array<{
    description: string;
    category: string;
    subcategory: string;
  }>;
}> {
  try {
    const prompt = `
      I have a banking transaction with description: "${description}"
      
      Based on your knowledge of common banking transactions, please suggest ${limit} similar transactions that might have the same category.
      
      Return a JSON object with a single field 'similarTransactions' that contains an array of objects, each with:
      - description: A similar transaction description
      - category: The suggested category
      - subcategory: A more specific subcategory
      
      Only respond with valid JSON in this exact format, no additional text.
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error in getSimilarCategorizedTransactions:", error);
    return {
      similarTransactions: []
    };
  }
}