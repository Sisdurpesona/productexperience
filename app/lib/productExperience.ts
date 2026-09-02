import { Language, RawProduct, ProductEnrichment } from "../types/product";

type ProductExperience = ProductEnrichment;

function clean(value: unknown): string {
  const text = String(value ?? "").trim();

  if (!text || text === "#NAME?" || text.toLowerCase().startsWith("unnamed")) {
    return "";
  }

  return text;
}

function getField(product: RawProduct, possibleNames: string[]): string {
  const keys = Object.keys(product);

  for (const name of possibleNames) {
    const exactKey = keys.find((key) => key.trim().toLowerCase() === name.trim().toLowerCase());

    if (!exactKey) continue;

    const value = product[exactKey];

    if (value !== undefined && value !== null && String(value).trim() && !String(value).includes("#NAME?")) {
      return String(value).trim();
    }
  }

  return "";
}

/* =====================================================
   TASTING NOTES
===================================================== */

export function getTastingNotes(product: RawProduct, language: Language): string {
  if (language === "en") {
    return getField(product, ["Detailed tasting notes", "Detailed Tasting Notes", "English Tasting Notes", "Tasting Notes", "Tasting notes"]);
  }

  return getField(product, ["Tasting Notes", "Tasting notes", "Detailed tasting notes"]);
}

/* =====================================================
   BRAND STORY
===================================================== */

export function getBrandStory(product: RawProduct, language: Language): string {
  if (language === "en") {
    return getField(product, ["Brand Story", "Brand story", "English Brand Story"]);
  }

  return getField(product, ["Brand Story", "Brand story"]);
}

/* =====================================================
   TASTING NOTES PARSER
===================================================== */

export type ParsedTastingNotes = {
  appearance: string;
  aroma: string;
  taste: string;
  mouthfeel: string;
  finish: string;
};

export function parseTastingNotes(text: string): ParsedTastingNotes {
  const result: ParsedTastingNotes = {
    appearance: "",
    aroma: "",
    taste: "",
    mouthfeel: "",
    finish: "",
  };

  if (!text) {
    return result;
  }

  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const patterns: Array<{
    key: keyof ParsedTastingNotes;
    patterns: RegExp[];
  }> = [
    {
      key: "appearance",
      patterns: [/appearance\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:aroma|taste|mouthfeel|finish)\s*[:\-]|$)/i],
    },
    {
      key: "aroma",
      patterns: [/aroma\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:appearance|taste|mouthfeel|finish)\s*[:\-]|$)/i],
    },
    {
      key: "taste",
      patterns: [/taste\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:appearance|aroma|mouthfeel|finish)\s*[:\-]|$)/i],
    },
    {
      key: "mouthfeel",
      patterns: [/mouthfeel\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:appearance|aroma|taste|finish)\s*[:\-]|$)/i],
    },
    {
      key: "finish",
      patterns: [/finish\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:appearance|aroma|taste|mouthfeel)\s*[:\-]|$)/i],
    },
  ];

  for (const item of patterns) {
    for (const pattern of item.patterns) {
      const match = normalized.match(pattern);

      if (match?.[1]) {
        result[item.key] = match[1].trim();
        break;
      }
    }
  }

  return result;
}

/* =====================================================
   PRODUCT PROFILE
===================================================== */

export function getProductProfile(product: RawProduct, language: Language): string {
  const directProfile = language === "en" ? getField(product, ["Product Profile", "Product profile", "Profile", "English Product Profile"]) : getField(product, ["Product Profile", "Product profile", "Profile"]);

  if (directProfile) {
    return directProfile;
  }

  const item = getField(product, ["ITEM", "Item", "Product"]) || (language === "id" ? "Produk" : "Product");

  const group = getField(product, ["GROUP", "Group", "Category"]) || (language === "id" ? "Alcohol" : "Alcohol");

  const alcoholGroup = getField(product, ["GOL ALCO", "Alcohol Group", "Alcohol group"]);

  const abv = getField(product, ["KADAR ALCO %", "ABV", "Alcohol %", "Alcohol"]);

  const volume = getField(product, ["VOLUME ISI", "Volume", "Volume Isi"]);

  if (language === "id") {
    const details = [alcoholGroup ? `kategori ${alcoholGroup}` : "", abv ? `dengan kadar alkohol ${abv}%` : "", volume ? `dan volume ${volume} ml` : ""].filter(Boolean).join(", ");

    return details ? `${item} merupakan produk ${group} ${details}.` : `${item} merupakan produk dari kategori ${group}.`;
  }

  const details = [alcoholGroup ? `in the ${alcoholGroup} category` : "", abv ? `with ${abv}% ABV` : "", volume ? `and a ${volume} ml volume` : ""].filter(Boolean).join(", ");

  return details ? `${item} is a ${group} product ${details}.` : `${item} is a product from the ${group} category.`;
}

/* =====================================================
   SERVE & MIX
===================================================== */

export type ProductServeMixData = {
  bestServed: string;
  recommendedMixer: string;
  cocktail: string;
};

export function getServeMix(product: RawProduct, language: Language): ProductServeMixData {
  const bestServed = getField(product, ["Best Served", "Best served", "Serving", "Serve"]);

  const recommendedMixer = getField(product, ["Recommended Mixer", "Recommended mixer", "Mixer"]);

  const cocktail = getField(product, ["Cocktail", "Recommended Cocktail", "Recommended cocktail"]);

  return {
    bestServed: bestServed || (language === "id" ? "Sajikan sesuai karakter produk." : "Serve according to the product character."),

    recommendedMixer: recommendedMixer || (language === "id" ? "Rekomendasi mixer belum tersedia." : "Mixer recommendation is not available yet."),

    cocktail: cocktail || (language === "id" ? "Rekomendasi cocktail akan disesuaikan dengan profil produk." : "Cocktail recommendations will be matched to the product profile."),
  };
}

/* =====================================================
   TAGS
===================================================== */

export function getProductTags(product: RawProduct): string[] {
  const rawTags = getField(product, ["Tags", "Tag", "Product Tags", "Product tags"]);

  if (!rawTags) {
    const group = getField(product, ["GROUP", "Group", "Category"]);

    return group ? [group.toUpperCase()] : [];
  }

  return rawTags
    .split(/[,|;]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.toUpperCase());
}

/* =====================================================
   COMPLETE PRODUCT EXPERIENCE
===================================================== */

export function buildProductExperience(product: RawProduct, language: Language): ProductExperience {
  const tastingText = getTastingNotes(product, language);
  const tasting = parseTastingNotes(tastingText);

  const serveMix = getServeMix(product, language);

  const brandStory = getBrandStory(product, language);

  const imageUrl = getField(product, ["Image", "Image URL", "ImageUrl", "Image URL", "Product Image"]);

  return {
    profile: getProductProfile(product, language),

    tasting: {
      appearance: tasting.appearance || (language === "id" ? "Informasi penampilan produk belum tersedia." : "Appearance information is not available yet."),

      aroma: tasting.aroma || (language === "id" ? "Informasi aroma produk belum tersedia." : "Aroma information is not available yet."),

      taste: tasting.taste || (language === "id" ? "Informasi rasa produk belum tersedia." : "Taste information is not available yet."),

      mouthfeel: tasting.mouthfeel || (language === "id" ? "Informasi mouthfeel produk belum tersedia." : "Mouthfeel information is not available yet."),

      finish: tasting.finish || (language === "id" ? "Informasi finish produk belum tersedia." : "Finish information is not available yet."),
    },

    serveMix,

    brandStory: brandStory || (language === "id" ? "Brand story belum tersedia." : "Brand story is not available yet."),

    tags: getProductTags(product),

    imageUrl,
  };
}
