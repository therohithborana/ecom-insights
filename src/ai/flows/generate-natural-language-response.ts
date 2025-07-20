'use server';
/**
 * @fileOverview Generates a human-readable natural language response from structured data.
 *
 * - generateNaturalLanguageResponse - A function that generates the natural language response.
 * - GenerateNaturalLanguageResponseInput - The input type for the generateNaturalLanguageResponse function.
 * - GenerateNaturalLanguageResponseOutput - The return type for the generateNaturalLanguageResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNaturalLanguageResponseInputSchema = z.object({
  query: z.string().describe('The user question.'),
  data: z.string().describe('The structured data in string format to generate the response from.'),
});
export type GenerateNaturalLanguageResponseInput = z.infer<
  typeof GenerateNaturalLanguageResponseInputSchema
>;

const GenerateNaturalLanguageResponseOutputSchema = z.object({
  response: z.string().describe('The human-readable natural language response.'),
});
export type GenerateNaturalLanguageResponseOutput = z.infer<
  typeof GenerateNaturalLanguageResponseOutputSchema
>;

export async function generateNaturalLanguageResponse(
  input: GenerateNaturalLanguageResponseInput
): Promise<GenerateNaturalLanguageResponseOutput> {
  return generateNaturalLanguageResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNaturalLanguageResponsePrompt',
  input: {schema: GenerateNaturalLanguageResponseInputSchema},
  output: {schema: GenerateNaturalLanguageResponseOutputSchema},
  prompt: `You are an AI agent that answers questions about e-commerce data in a human-readable format.

  Question: {{{query}}}
  Data: {{{data}}}

  Please generate a natural language response that accurately and concisely answers the question based on the provided data.`,
});

const generateNaturalLanguageResponseFlow = ai.defineFlow(
  {
    name: 'generateNaturalLanguageResponseFlow',
    inputSchema: GenerateNaturalLanguageResponseInputSchema,
    outputSchema: GenerateNaturalLanguageResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
