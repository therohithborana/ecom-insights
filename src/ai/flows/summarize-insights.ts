'use server';

/**
 * @fileOverview An AI agent that summarizes key insights from e-commerce data based on user questions.
 *
 * - summarizeInsights - A function that handles the summarization process.
 * - SummarizeInsightsInput - The input type for the summarizeInsights function.
 * - SummarizeInsightsOutput - The return type for the summarizeInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInsightsInputSchema = z.object({
  question: z.string().describe('The question about the e-commerce data.'),
  queryResult: z.string().describe('The raw result from the SQL query.'),
});
export type SummarizeInsightsInput = z.infer<typeof SummarizeInsightsInputSchema>;

const SummarizeInsightsOutputSchema = z.object({
  summary: z.string().describe('The summarized insights from the data.'),
});
export type SummarizeInsightsOutput = z.infer<typeof SummarizeInsightsOutputSchema>;

export async function summarizeInsights(input: SummarizeInsightsInput): Promise<SummarizeInsightsOutput> {
  return summarizeInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeInsightsPrompt',
  input: {schema: SummarizeInsightsInputSchema},
  output: {schema: SummarizeInsightsOutputSchema},
  prompt: `You are an AI agent specializing in summarizing e-commerce data insights.

  Based on the user's question and the raw SQL query result, provide a concise and human-readable summary of the key insights.

  Question: {{{question}}}
  SQL Query Result: {{{queryResult}}}

  Summary:`,
});

const summarizeInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeInsightsFlow',
    inputSchema: SummarizeInsightsInputSchema,
    outputSchema: SummarizeInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
