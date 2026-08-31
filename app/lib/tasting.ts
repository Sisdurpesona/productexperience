import { Language, ProductTasting, ProductServeMix, RawProduct } from "../types/product";

function clean(value: unknown): string {
  const text = String(value ?? "").trim();

  if (!text || text === "#NAME?" || text.toLowerCase().startsWith("unnamed")) {
    return "";
  }

  return text;
}

// =====================================================
// DEFAULT TASTING
// =====================================================

export function getDefaultTasting(language: Language): ProductTasting {
  if (language === "id") {
    return {
      appearance: "Informasi penampilan produk belum tersedia.",
      aroma: "Informasi aroma produk belum tersedia.",
      taste: "Informasi rasa produk belum tersedia.",
      mouthfeel: "Informasi mouthfeel produk belum tersedia.",
      finish: "Informasi finish produk belum tersedia.",
    };
  }

  return {
    appearance: "Appearance information is not yet available.",
    aroma: "Aroma information is not yet available.",
    taste: "Taste information is not yet available.",
    mouthfeel: "Mouthfeel information is not yet available.",
    finish: "Finish information is not yet available.",
  };
}

// =====================================================
// DEFAULT SERVE & MIX
// =====================================================

export function getDefaultServeMix(language: Language): ProductServeMix {
  if (language === "id") {
    return {
      bestServed: "Sajikan sesuai karakter produk.",
      recommendedMixer: "Rekomendasi mixer akan disesuaikan dengan karakter produk.",
      cocktail: "Rekomendasi cocktail akan disesuaikan dengan profil produk.",
    };
  }

  return {
    bestServed: "Serve according to the product character.",
    recommendedMixer: "Mixer recommendations will be based on the product character.",
    cocktail: "Cocktail recommendations will be based on the product profile.",
  };
}

// =====================================================
// TASTING FROM RAW DATA
//
// Dipakai sebagai fallback apabila enrichment
// belum tersedia untuk SKU tertentu.
// =====================================================

export function getTastingNotes(raw: RawProduct, language: Language): ProductTasting {
  const rawTasting = clean(raw["Tasting Notes"] ?? raw["tasting notes"] ?? raw["Tasting Notes ID"]);

  if (rawTasting) {
    return {
      appearance: rawTasting,
      aroma: rawTasting,
      taste: rawTasting,
      mouthfeel: rawTasting,
      finish: rawTasting,
    };
  }

  return getDefaultTasting(language);
}

// =====================================================
// SERVE & MIX FROM RAW DATA
//
// Fallback sederhana untuk produk yang belum memiliki
// enrichment khusus.
// =====================================================

export function getServeMix(raw: RawProduct, language: Language): ProductServeMix {
  const serve = clean(raw["Serve & Mix"] ?? raw["Serve and Mix"] ?? raw["Serving & Mix"]);

  if (serve) {
    return {
      bestServed: serve,
      recommendedMixer: serve,
      cocktail: serve,
    };
  }

  return getDefaultServeMix(language);
}
