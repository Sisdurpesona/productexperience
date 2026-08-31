export type Language = "id" | "en";

export type RawProduct = Record<string, unknown>;

export type ProductTasting = {
  appearance: string;
  aroma: string;
  taste: string;
  mouthfeel: string;
  finish: string;
};

export type ProductServeMix = {
  bestServed: string;
  recommendedMixer: string;
  cocktail: string;
};

export type ProductEnrichment = {
  profile: string;
  tasting: ProductTasting;
  serveMix: ProductServeMix;
  brandStory: string;
  tags: string[];
  imageUrl: string;
};

export type Product = {
  code: string;
  item: string;
  group: string;
  alcoholGroup: string;
  abv: string;
  volume: string;
  premium: string;
  barcode: string;
  region: string;
  enrichment: ProductEnrichment;
};

export type ApiResponse<T> = {
  data: T;
  error?: string;
};
