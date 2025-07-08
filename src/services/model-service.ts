'use server';

/**
 * @fileOverview A service for interacting with model data.
 * This acts as a data access layer, abstracting the data source
 * from the rest of the application. Currently, it reads from a JSON file,
 * but it could be updated to fetch from a database like Firestore.
 */

import type { Model } from '@/lib/types';
import allModelsData from '@/data/models.json';

/**
 * Fetches all models from the data source.
 * @returns A promise that resolves to an array of all models.
 */
export async function getAllModels(): Promise<Model[]> {
  // In a real application, this would be a database query.
  // For now, we're returning the imported JSON data.
  // The `as Model[]` cast is used to ensure type safety.
  return allModelsData as Model[];
}

/**
 * Fetches all unique providers from the data source.
 * @returns A promise that resolves to a sorted array of unique provider names.
 */
export async function getUniqueProviders(): Promise<string[]> {
  const models = await getAllModels();
  return [...new Set(models.map((m) => m.provider))].sort();
}

/**
 * Fetches all unique series from the data source.
 * @returns A promise that resolves to a sorted array of unique series names.
 */
export async function getUniqueSeries(): Promise<string[]> {
  const models = await getAllModels();
  return [...new Set(models.map((m) => m.series))].sort();
}

/**
 * Fetches all unique categories from the data source.
 * @returns A promise that resolves to a sorted array of unique category names.
 */
export async function getUniqueCategories(): Promise<string[]> {
  const models = await getAllModels();
  return [...new Set(models.flatMap((m) => m.category))].sort();
}
