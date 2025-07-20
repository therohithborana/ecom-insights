'use server';

/**
 * @fileOverview Determines if a given dataset can be visualized and suggests a chart type.
 *
 * - checkVisualization - A function that handles the visualization check process.
 * - CheckVisualizationInput - The input type for the checkVisualization function.
 * - CheckVisualizationOutput - The return type for the checkVisualization function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CheckVisualizationInputSchema = z.object({
  question: z.string().describe('The original user question.'),
  data: z.string().describe('The structured data in JSON string format.'),
});
export type CheckVisualizationInput = z.infer<typeof CheckVisualizationInputSchema>;

const CheckVisualizationOutputSchema = z.object({
  isVisualizable: z.boolean().describe('Whether the data is suitable for visualization.'),
  chartType: z
    .enum(['bar', 'line', 'area', 'pie', 'none'])
    .describe('The recommended chart type. Use "none" if not visualizable.'),
  chartTitle: z.string().describe('A descriptive title for the chart.'),
  reasoning: z
    .string()
    .describe('A brief explanation of why the data is or is not visualizable and the choice of chart type.'),
});
export type CheckVisualizationOutput = z.infer<typeof CheckVisualizationOutputSchema>;

export async function checkVisualization(
  input: CheckVisualizationInput
): Promise<CheckVisualizationOutput> {
  // Basic check to avoid calling AI for clearly non-visualizable data
  try {
    const parsedData = JSON.parse(input.data);
    if (!parsedData || !Array.isArray(parsedData.rows) || parsedData.rows.length === 0) {
      return {
        isVisualizable: false,
        chartType: 'none',
        chartTitle: '',
        reasoning: 'Data is empty or not in the expected format.',
      };
    }
  } catch (error) {
    return {
      isVisualizable: false,
      chartType: 'none',
      chartTitle: '',
      reasoning: 'Failed to parse data.',
    };
  }
  return checkVisualizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkVisualizationPrompt',
  input: { schema: CheckVisualizationInputSchema },
  output: { schema: CheckVisualizationOutputSchema },
  prompt: `You are an expert data visualization analyst. Your task is to determine if the given data can be effectively visualized to answer the user's question.

You must analyze the data and the question to make a recommendation.

- Data must contain at least one categorical column (e.g., text, date) and at least one numerical column.
- Single-value aggregations (like a single SUM or COUNT) are generally not visualizable unless the question implies comparison or trends over time.
- Time series data is best for line or area charts.
- Categorical comparisons are best for bar charts.
- Proportions or parts of a whole are good for pie charts.

Based on your analysis, provide a JSON response with the following fields:
- isVisualizable: boolean
- chartType: 'bar', 'line', 'area', 'pie', or 'none'
- chartTitle: A concise, descriptive title for the chart.
- reasoning: A brief explanation for your choices.

User Question: {{{question}}}
Data: {{{data}}}
`,
});

const checkVisualizationFlow = ai.defineFlow(
  {
    name: 'checkVisualizationFlow',
    inputSchema: CheckVisualizationInputSchema,
    outputSchema: CheckVisualizationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
