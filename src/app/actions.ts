"use server";

import { generateSql } from "@/ai/flows/natural-language-to-sql";
import { generateNaturalLanguageResponse } from "@/ai/flows/generate-natural-language-response";
import { query, type QueryResult } from "@/lib/db";

export interface AIResponse {
  answer: string;
  sql: string;
  data: QueryResult;
  error?: string;
}

const dbSchema = `
- ad_sales (product_id TEXT, date TEXT, ad_spend REAL, ad_sales REAL, clicks INTEGER, impressions INTEGER)
- total_sales (product_id TEXT, date TEXT, total_sales_units INTEGER, total_sales_revenue REAL)
- eligibility (product_id TEXT, product_name TEXT, is_eligible BOOLEAN)
`;

export async function askQuestion(question: string): Promise<AIResponse> {
  try {
    // 1. Generate SQL from the natural language question
    const sqlGeneration = await generateSql({
      question: question,
      schema: dbSchema,
    });
    const sqlQuery = sqlGeneration.sql;

    if (!sqlQuery) {
      throw new Error("Failed to generate SQL query.");
    }
    
    // 2. Execute the SQL query (against the mock DB)
    const queryResult = await query(sqlQuery);

    // 3. Generate a natural language response from the data
    const naturalLanguageResponse = await generateNaturalLanguageResponse({
      query: question,
      data: JSON.stringify(queryResult),
    });
    const answer = naturalLanguageResponse.response;

    if (!answer) {
        throw new Error("Failed to generate a response.");
    }

    return {
      answer,
      sql: sqlQuery,
      data: queryResult,
    };
  } catch (error) {
    console.error("Error in askQuestion action:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      answer: "",
      sql: "",
      data: { columns: [], rows: [] },
      error: `Sorry, I couldn't process that question. ${message}`,
    };
  }
}
