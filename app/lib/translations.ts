import { Language } from "../types/product";

export const translations = {
  id: {
    brand: "ALCOHOL PRODUCT GUIDE",

    eyebrow: "RETAIL ALCOHOL EXPERIENCE",

    title: "KENALI PRODUK SEBELUM MEMILIH",

    subtitle: "Informasi produk, tasting notes, dan rekomendasi penyajian.",

    searchPlaceholder: "Masukkan barcode produk...",

    searchButton: "CARI PRODUK",

    scanProduct: "SCAN PRODUCT HERE",

    scanDescription: "Gunakan kamera untuk memindai barcode produk.",

    productFound: "PRODUK DITEMUKAN",

    newSearch: "PENCARIAN BARU",

    abv: "KADAR ALKOHOL",

    volume: "VOLUME",

    alcoholGroup: "GOLONGAN ALKOHOL",

    code: "KODE / SKU",

    group: "GROUP",

    barcode: "BARCODE",

    region: "REGION",

    premium: "PREMIUM",

    productProfile: "PROFIL PRODUK",

    tastingNotes: "TASTING NOTES",

    appearance: "PENAMPILAN",

    aroma: "AROMA",

    taste: "RASA",

    mouthfeel: "MOUTHFEEL",

    finish: "FINISH",

    serveMix: "SERVE & MIX",

    bestServed: "PENYAJIAN TERBAIK",

    recommendedMixer: "REKOMENDASI MIXER",

    cocktail: "REKOMENDASI COCKTAIL",

    brandStory: "BRAND STORY",

    notFound: "Produk tidak ditemukan.",

    connectionError: "Gagal terhubung ke database produk.",

    loading: "Mencari produk...",
  },

  en: {
    brand: "ALCOHOL PRODUCT GUIDE",

    eyebrow: "RETAIL ALCOHOL EXPERIENCE",

    title: "KNOW THE PRODUCT BEFORE YOU CHOOSE",

    subtitle: "Product information, tasting notes, and serving recommendations.",

    searchPlaceholder: "Enter product barcode...",

    searchButton: "SEARCH PRODUCT",

    scanProduct: "SCAN PRODUCT HERE",

    scanDescription: "Use your camera to scan the product barcode.",

    productFound: "PRODUCT FOUND",

    newSearch: "NEW SEARCH",

    abv: "ABV",

    volume: "VOLUME",

    alcoholGroup: "ALCOHOL GROUP",

    code: "SKU / CODE",

    group: "GROUP",

    barcode: "BARCODE",

    region: "REGION",

    premium: "PREMIUM",

    productProfile: "PRODUCT PROFILE",

    tastingNotes: "TASTING NOTES",

    appearance: "APPEARANCE",

    aroma: "AROMA",

    taste: "TASTE",

    mouthfeel: "MOUTHFEEL",

    finish: "FINISH",

    serveMix: "SERVE & MIX",

    bestServed: "BEST SERVED",

    recommendedMixer: "RECOMMENDED MIXER",

    cocktail: "COCKTAIL RECOMMENDATION",

    brandStory: "BRAND STORY",

    notFound: "Product not found.",

    connectionError: "Unable to connect to the product database.",

    loading: "Searching product...",
  },
} as const;

/* =====================================================
   TRANSLATION HELPER
   ===================================================== */

export function getTranslations(language: Language) {
  return translations[language];
}
