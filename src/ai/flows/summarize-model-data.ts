'use server';

/**
 * @fileOverview Summarizes model capabilities and usage patterns using AI.
 *
 * - summarizeModel - A function that generates a summary of a given AI model.
 * - SummarizeModelInput - The input type for the summarizeModel function.
 * - SummarizeModelOutput - The return type for the summarizeModel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeModelInputSchema = z.object({
  modelName: z.string().describe('The name of the AI model.'),
  modelDescription: z.string().describe('A detailed description of the AI model.'),
  weeklyTokenUsage: z.string().describe('The weekly token usage of the AI model.'),
  providerName: z.string().describe('The provider of the AI model.'),
  contextSize: z.string().describe('The context size of the AI model.'),
  inputPricingPerMillionTokens: z.string().describe('The input pricing per million tokens of the AI model.'),
  outputPricingPerMillionTokens: z.string().describe('The output pricing per million tokens of the AI model.'),
});
export type SummarizeModelInput = z.infer<typeof SummarizeModelInputSchema>;

const SummarizeModelOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the AI model capabilities and usage patterns.'),
});
export type SummarizeModelOutput = z.infer<typeof SummarizeModelOutputSchema>;

export async function summarizeModel(input: SummarizeModelInput): Promise<SummarizeModelOutput> {
  return summarizeModelFlow(input);
}

const summarizeModelPrompt = ai.definePrompt({
  name: 'summarizeModelPrompt',
  input: {schema: SummarizeModelInputSchema},
  output: {schema: SummarizeModelOutputSchema},
  prompt: `You are an AI expert who summarizes AI models for end users.

  Given the following information about an AI model, generate a concise summary (around two sentences) highlighting its key capabilities and usage patterns.

  Model Name: {{{modelName}}}
  Description: {{{modelDescription}}}
  Weekly Token Usage: {{{weeklyTokenUsage}}}
  Provider: {{{providerName}}}
  Context Size: {{{contextSize}}}
  Input Pricing: {{{inputPricingPerMillionTokens}}}
  Output Pricing: {{{outputPricingPerMillionTokens}}}

  Summary:`,
});

const summarizeModelFlow = ai.defineFlow(
  {
    name: 'summarizeModelFlow',
    inputSchema: SummarizeModelInputSchema,
    outputSchema: SummarizeModelOutputSchema,
  },
  async input => {
    const {output} = await summarizeModelPrompt(input);
    return output!;
  }
);
