'use server';

/**
 * @fileOverview Converts natural language questions to SQL queries.
 *
 * - generateSql - A function that converts natural language to SQL.
 * - GenerateSqlInput - The input type for the generateSql function.
 * - GenerateSqlOutput - The return type for the generateSql function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateSqlInputSchema = z.object({
  question: z.string().describe('The natural language question about the e-commerce data.'),
  schema: z.string().describe('The schema of the database tables.'),
});
export type GenerateSqlInput = z.infer<typeof GenerateSqlInputSchema>;

const GenerateSqlOutputSchema = z.object({
  sql: z.string().describe('The generated SQL query. It should be a valid SQLite query.'),
});
export type GenerateSqlOutput = z.infer<typeof GenerateSqlOutputSchema>;

export async function generateSql(input: GenerateSqlInput): Promise<GenerateSqlOutput> {
  return generateSqlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSqlPrompt',
  input: {schema: GenerateSqlInputSchema},
  output: {schema: GenerateSqlOutputSchema},
  prompt: `You are an expert SQL writer. Given a database schema and a user's question, write a single, valid SQLite SQL query to answer the question.

Only return the SQL query and nothing else. Do not wrap it in markdown or add explanations.

IMPORTANT: When writing queries that involve division, you MUST handle potential division-by-zero errors. Use the NULLIF function to prevent these errors.
For example, to calculate Return on Ad Spend (RoAS), instead of 'SUM(ad_sales) / SUM(ad_spend)', you should write 'SUM(ad_sales) * 1.0 / NULLIF(SUM(ad_spend), 0)'.

Schema:
{{{schema}}}

Question:
{{{question}}}
`,
});

const generateSqlFlow = ai.defineFlow(
  {
    name: 'generateSqlFlow',
    inputSchema: GenerateSqlInputSchema,
    outputSchema: GenerateSqlOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
      throw new Error("AI failed to generate a response.");
    }
    
    // Sometimes the model returns the SQL query wrapped in markdown.
    // We need to remove it.
    const cleanedSql = output.sql.replace(/```sql\n|```/g, '').trim();

    return { sql: cleanedSql };
  }
);
