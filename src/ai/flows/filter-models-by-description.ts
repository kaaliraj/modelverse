// src/ai/flows/filter-models-by-description.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for filtering AI models based on a user-provided description.
 *
 * - filterModelsByDescription - A function that takes a description and a list of models and returns a filtered list of models.
 * - FilterModelsByDescriptionInput - The input type for the filterModelsByDescription function.
 * - FilterModelsByDescriptionOutput - The output type for the filterModelsByDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterModelsByDescriptionInputSchema = z.object({
  description: z.string().describe('The description to filter models by.'),
  models: z.array(z.any()).describe('The list of models to filter.'),
});
export type FilterModelsByDescriptionInput = z.infer<
  typeof FilterModelsByDescriptionInputSchema
>;

const FilterModelsByDescriptionOutputSchema = z.array(z.any()).describe(
  'The filtered list of models.'
);
export type FilterModelsByDescriptionOutput = z.infer<
  typeof FilterModelsByDescriptionOutputSchema
>;

export async function filterModelsByDescription(
  input: FilterModelsByDescriptionInput
): Promise<FilterModelsByDescriptionOutput> {
  return filterModelsByDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterModelsByDescriptionPrompt',
  input: {schema: FilterModelsByDescriptionInputSchema},
  output: {schema: FilterModelsByDescriptionOutputSchema},
  prompt: `You are an AI model filtering expert.

  The user will provide a description of what they want an AI model to do.
  You will receive a list of models. You need to filter the list down to the models that match the user's description.

  User Description: {{{description}}}
  Models: {{{models}}}

  Return ONLY the array of models that are relevant to the user's description.  Do not include any other text or formatting.
  `,
});

const filterModelsByDescriptionFlow = ai.defineFlow(
  {
    name: 'filterModelsByDescriptionFlow',
    inputSchema: FilterModelsByDescriptionInputSchema,
    outputSchema: FilterModelsByDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

