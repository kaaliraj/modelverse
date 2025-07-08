'use server';
/**
 * @fileOverview This file defines a Genkit flow for filtering and sorting AI models.
 * This approach is scalable as it performs the heavy lifting on the server-side,
 * only returning the relevant data to the client.
 *
 * - filterAndSortModels - A function that takes filter and sort criteria and returns a list of models.
 * - FilterAndSortModelsInput - The input type for the function.
 * - FilterAndSortModelsOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllModels } from '@/services/model-service';
import type { Model } from '@/lib/types';


const FilterAndSortModelsInputSchema = z.object({
  searchTerm: z.string().optional(),
  sortOption: z.string(),
  filters: z.object({
    modalities: z.array(z.string()),
    contextLength: z.array(z.number()),
    promptPricing: z.array(z.number()),
    series: z.array(z.string()),
    categories: z.array(z.string()),
    providers: z.array(z.string()),
  }),
});
type FilterAndSortModelsInput = z.infer<typeof FilterAndSortModelsInputSchema>;

const FilterAndSortModelsOutputSchema = z.array(z.custom<Model>());
type FilterAndSortModelsOutput = z.infer<typeof FilterAndSortModelsOutputSchema>;

export async function filterAndSortModels(
  input: FilterAndSortModelsInput
): Promise<FilterAndSortModelsOutput> {
  return filterAndSortModelsFlow(input);
}

const filterAndSortModelsFlow = ai.defineFlow(
  {
    name: 'filterAndSortModelsFlow',
    inputSchema: FilterAndSortModelsInputSchema,
    outputSchema: FilterAndSortModelsOutputSchema,
  },
  async ({ searchTerm, sortOption, filters }) => {
    const allModels = await getAllModels();
    
    let filtered = (allModels as Model[])
      .filter((model) => {
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          return (
            model.name.toLowerCase().includes(searchTermLower) ||
            model.description.toLowerCase().includes(searchTermLower) ||
            model.provider.toLowerCase().includes(searchTermLower)
          );
        }
        return true;
      })
      .filter((model) => {
        if (filters.modalities.length > 0) {
          if (!filters.modalities.some(mod => model.modality.includes(mod as any))) {
            return false;
          }
        }
        if (filters.series.length > 0 && !filters.series.includes(model.series)) {
            return false;
        }
        if (filters.categories.length > 0) {
            if (!filters.categories.some(cat => model.category.includes(cat as any))) {
              return false;
            }
        }
        if (filters.providers.length > 0 && !filters.providers.includes(model.provider)) {
            return false;
        }
        if (model.contextLength < filters.contextLength[0] || model.contextLength > filters.contextLength[1]) {
          return false;
        }
        const maxPrice = filters.promptPricing[1];
        if (model.inputPrice < filters.promptPricing[0] || (maxPrice < 10 && model.inputPrice > maxPrice)) {
          return false;
        }
        return true;
      });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'weeklyUsage':
          return b.weeklyUsage - a.weeklyUsage;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'contextLength':
          return b.contextLength - a.contextLength;
        case 'inputPrice':
          return a.inputPrice - b.inputPrice;
        default:
          return 0;
      }
    });
  }
);
