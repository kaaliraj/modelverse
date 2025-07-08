export type MediaType = 'image' | 'youtube' | 'facebook' | 'instagram';

export interface MediaCardData {
  mediaType: MediaType;
  thumbnailURL: string;
  previewVideoURL?: string;
  destinationURL: string;
  duration?: string;
  sourceName: string;
  sourceChannel?: string;
}

export type Model = {
  id: string;
  name: string;
  description: string;
  weeklyUsage: number;
  provider: string;
  contextLength: number;
  inputPrice: number;
  outputPrice: number;
  modality: ('Text' | 'Image' | 'Audio')[];
  series: string;
  category: ('Programming' | 'Roleplay' | 'Reasoning' | 'Writing')[];
  thumbnailUrl: string;
  previewUrl: string;
  media?: MediaCardData[];
};
