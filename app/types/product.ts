// =====================================================
// ALCOHOL SELF-TAKER
// PRODUCT TYPES
// =====================================================

export type Language = "id" | "en";

// =====================================================
// RAW PRODUCT
// Data mentah yang datang dari Google Sheets
// =====================================================

export type RawProduct = Record<string, string>;

// =====================================================
// TASTING NOTES
// =====================================================

export type TastingNotes = {
  appearance: string;
  aroma: string;
  taste: string;
  mouthfeel: string;
  finish: string;
  overall: string;
};

// =====================================================
// SERVE & MIX
// =====================================================

export type ServeMix = {
  bestServed: string;
  recommendedMixer: string;
  cocktail: string;
};

// =====================================================
// PRODUCT ENRICHMENT
//
// Data tambahan yang tidak perlu disimpan di spreadsheet.
// Data ini berasal dari product knowledge/enrichment.
// =====================================================

export type ProductEnrichment = {
  profile: string;

  tasting: TastingNotes;

  serveMix: ServeMix;

  brandStory: string;

  tags: string[];

  imageUrl: string;
};

// =====================================================
// PRODUCT
//
// Struktur final yang dipakai website.
// =====================================================

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

// =====================================================
// API RESPONSE
// =====================================================

export type ProductApiResponse = {
  success: boolean;

  message: string;

  barcode?: string;

  sheet?: string;

  data?: RawProduct;

  error?: string;
};
