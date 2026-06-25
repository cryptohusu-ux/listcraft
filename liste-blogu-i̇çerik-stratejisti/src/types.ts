export interface ListicleItem {
  id: number;
  itemTitle: string;
  description: string;
  whyPrompt: string;
  visualSearchQuery: string;
  imageUrl?: string;
}

export interface ListicleStrategy {
  id: string;
  topic: string;
  titleSuggestions: string[];
  selectedTitle: string;
  items: ListicleItem[];
  closingQuestion: string;
  tone: string;
  audience: string;
  createdAt: string;
}

export interface UnsplashPreset {
  id: string;
  keyword: string;
  description: string;
  url: string;
}
