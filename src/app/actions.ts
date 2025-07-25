"use server";

import { generateSql } from "@/ai/flows/natural-language-to-sql";
import { generateNaturalLanguageResponse } from "@/ai/flows/generate-natural-language-response";
import { checkVisualization } from "@/ai/flows/check-visualization";
import { query, type QueryResult } from "@/lib/db";

export interface VisualizationInfo {
  isVisualizable: boolean;
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'none';
  chartTitle: string;
  reasoning: string;
}

export interface AIResponse {
  answer: string;
  sql: string;
  data: QueryResult;
  visualization?: VisualizationInfo;
  error?: string;
}

const dbSchema = `
- ad_metrics (date TEXT, item_id TEXT, ad_sales REAL, impressions INTEGER, ad_spend REAL, clicks INTEGER, units_sold INTEGER)
- total_sales (date TEXT, item_id TEXT, total_sales REAL, total_units_ordered INTEGER)
- eligibility (item_id TEXT, eligibility BOOLEAN, message TEXT, eligibility_datetime_utc TEXT)
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
    
    // 2. Execute the SQL query
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

    // 4. Check if the data can be visualized
    let visualization: VisualizationInfo = {
      isVisualizable: false,
      chartType: 'none',
      chartTitle: '',
      reasoning: '',
    };

    if (queryResult.rows.length > 0) {
      visualization = await checkVisualization({
        question,
        data: JSON.stringify(queryResult)
      });
    }

    return {
      answer,
      sql: sqlQuery,
      data: queryResult,
      visualization,
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
