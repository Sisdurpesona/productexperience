import { Language, Product, RawProduct, ProductEnrichment } from "../types/product";

const IMAGE_MAP: Record<string, string> = {
  // ChumChurum Peach 360 ml
  "1210002": "https://www.oishiiplanet.it/cdn/shop/products/soju-peach-350ml.jpg?v=1602775945",

  // Gilbey's Gin 700 ml
  "1114002": "https://image.makewebcdn.com/makeweb/m_1200x600/6KKhXhmFQ/Ginnew/gilbey_gin_700.png",
};

const ENRICHMENTS: Record<
  string,
  {
    id: ProductEnrichment;
    en: ProductEnrichment;
  }
> = {
  // =====================================================
  // CHUMCHURUM PEACH
  // =====================================================

  "1210002": {
    id: {
      profile: "Soju rasa peach dengan karakter fruity yang lembut, manis, dan refreshing. Teksturnya smooth dan easy-drinking, cocok dinikmati dingin maupun sebagai base untuk minuman mix.",

      tasting: {
        appearance: "Jernih dan transparan dengan rona peach yang sangat lembut.",

        aroma: "Aroma peach yang segar dan juicy dengan karakter buah yang ringan.",

        taste: "Rasa peach yang lembut dengan sweetness yang ringan dan sensasi refreshing.",

        mouthfeel: "Light, smooth, dan easy-drinking dengan tekstur yang lembut.",

        finish: "Clean dan relatif short, meninggalkan karakter peach yang ringan dan menyegarkan.",
      },

      serveMix: {
        bestServed: "Sajikan chilled atau over ice untuk menonjolkan karakter peach yang refreshing.",

        recommendedMixer: "Soda water, lemonade, atau sparkling water.",

        cocktail: "Peach Soju Soda, Peach Spritz, atau Peach Soju Lemonade.",
      },

      brandStory:
        "Chum Churum merupakan brand soju Korea yang dikenal dengan karakter smooth dan approachable. Varian Peach menghadirkan karakter soju yang ringan dengan rasa peach yang fruity dan refreshing, sehingga mudah dinikmati baik secara neat maupun dalam berbagai kreasi minuman.",

      tags: ["FRUITY", "PEACH", "SMOOTH", "REFRESHING", "EASY DRINKING"],

      imageUrl: IMAGE_MAP["1210002"],
    },

    en: {
      profile: "A smooth and approachable peach-flavored soju with a soft fruity character and gentle sweetness. Its refreshing profile makes it enjoyable chilled or as a versatile base for mixed drinks.",

      tasting: {
        appearance: "Clear and transparent with a very subtle peach hue.",

        aroma: "Fresh and juicy peach with a light fruity character.",

        taste: "Soft peach flavor with gentle sweetness and a refreshing character.",

        mouthfeel: "Light, smooth, and easy-drinking with a soft texture.",

        finish: "Clean and relatively short, leaving a gentle and refreshing peach impression.",
      },

      serveMix: {
        bestServed: "Serve chilled or over ice to highlight its refreshing peach character.",

        recommendedMixer: "Soda water, lemonade, or sparkling water.",

        cocktail: "Peach Soju Soda, Peach Spritz, or Peach Soju Lemonade.",
      },

      brandStory:
        "Chum Churum is a Korean soju brand known for its smooth and approachable character. The Peach expression combines a light soju profile with soft fruity peach notes, making it easy to enjoy neat, chilled, or in mixed drinks.",

      tags: ["FRUITY", "PEACH", "SMOOTH", "REFRESHING", "EASY DRINKING"],

      imageUrl: IMAGE_MAP["1210002"],
    },
  },

  // =====================================================
  // GILBEY'S GIN
  // =====================================================

  "1114002": {
    id: {
      profile: "Gin klasik dengan karakter juniper yang tegas, clean, dan dry. Profilnya versatile sehingga cocok dinikmati sebagai Gin & Tonic maupun sebagai base berbagai classic cocktails.",

      tasting: {
        appearance: "Jernih dan transparan dengan tampilan crystal clear.",

        aroma: "Juniper yang prominent dengan karakter citrus dan botanical yang ringan.",

        taste: "Juniper-forward dengan citrus yang bright serta sentuhan herbal dan spice yang seimbang.",

        mouthfeel: "Light to medium-bodied dengan sensasi hangat yang smooth dan tetap clean.",

        finish: "Medium finish dengan karakter juniper dan citrus yang bertahan cukup lama.",
      },

      serveMix: {
        bestServed: "Sajikan chilled atau over ice.",

        recommendedMixer: "Indian tonic water atau soda water.",

        cocktail: "Gin & Tonic, Martini, Tom Collins, atau Negroni.",
      },

      brandStory:
        "Gilbey's merupakan gin klasik yang dikenal dengan karakter dry, refreshing, dan botanical yang khas. Profil juniper dan citrus membuatnya versatile untuk berbagai classic cocktails serta cocok untuk pengalaman Gin & Tonic yang straightforward.",

      tags: ["JUNIPER FORWARD", "DRY", "CITRUS", "CLEAN", "CLASSIC GIN"],

      imageUrl: IMAGE_MAP["1114002"],
    },

    en: {
      profile: "A classic gin with a pronounced juniper character and a clean, dry profile. Its versatile structure makes it suitable for Gin & Tonic as well as a range of classic cocktails.",

      tasting: {
        appearance: "Clear and transparent with a crystal-clear appearance.",

        aroma: "Pronounced juniper with light citrus and botanical notes.",

        taste: "Juniper-forward with bright citrus followed by balanced herbal and spicy botanical notes.",

        mouthfeel: "Light to medium-bodied with a smooth warmth while remaining clean.",

        finish: "Medium finish with lingering juniper and citrus character.",
      },

      serveMix: {
        bestServed: "Serve chilled or over ice.",

        recommendedMixer: "Indian tonic water or soda water.",

        cocktail: "Gin & Tonic, Martini, Tom Collins, or Negroni.",
      },

      brandStory: "Gilbey's is a classic gin known for its dry, refreshing, and distinctive botanical character. Its juniper and citrus profile makes it versatile for classic cocktails and a straightforward Gin & Tonic.",

      tags: ["JUNIPER FORWARD", "DRY", "CITRUS", "CLEAN", "CLASSIC GIN"],

      imageUrl: IMAGE_MAP["1114002"],
    },
  },
};

function clean(value: unknown): string {
  const text = String(value ?? "").trim();

  if (!text || text === "#NAME?" || text.toLowerCase().startsWith("unnamed")) {
    return "";
  }

  return text;
}

function getCode(raw: RawProduct): string {
  return clean(raw["KODE"] || raw["Kode"] || raw["SKU"]);
}

function getEnrichment(code: string, language: Language, raw: RawProduct): ProductEnrichment {
  const preset = ENRICHMENTS[code]?.[language];

  if (preset) {
    return preset;
  }

  // =====================================================
  // FALLBACK
  // =====================================================

  const item = clean(raw["ITEM"]) || "Product";
  const group = clean(raw["GROUP"]) || "Alcohol";

  if (language === "id") {
    return {
      profile: `${item} dengan karakter khas kategori ${group}. Profil produk akan disesuaikan berdasarkan karakter dan kategori produknya.`,

      tasting: {
        appearance: "Informasi penampilan produk belum tersedia.",
        aroma: "Informasi aroma produk belum tersedia.",
        taste: "Informasi rasa produk belum tersedia.",
        mouthfeel: "Informasi mouthfeel produk belum tersedia.",
        finish: "Informasi finish produk belum tersedia.",
      },

      serveMix: {
        bestServed: "Sajikan sesuai karakter produk.",

        recommendedMixer: "Rekomendasi mixer akan disesuaikan dengan karakter produk.",

        cocktail: "Rekomendasi cocktail akan disesuaikan dengan profil produk.",
      },

      brandStory: "Informasi brand story untuk produk ini sedang dipersiapkan.",

      tags: [group.toUpperCase()],

      imageUrl: "",
    };
  }

  return {
    profile: `${item} with a distinctive character from the ${group} category. Product details will be refined according to its specific style and profile.`,

    tasting: {
      appearance: "Appearance information is not yet available.",
      aroma: "Aroma information is not yet available.",
      taste: "Taste information is not yet available.",
      mouthfeel: "Mouthfeel information is not yet available.",
      finish: "Finish information is not yet available.",
    },

    serveMix: {
      bestServed: "Serve according to the product character.",

      recommendedMixer: "Mixer recommendations will be based on the product character.",

      cocktail: "Cocktail recommendations will be based on the product profile.",
    },

    brandStory: "Brand story information for this product is currently being prepared.",

    tags: [group.toUpperCase()],

    imageUrl: "",
  };
}

export function mapProduct(raw: RawProduct, language: Language): Product {
  const code = getCode(raw);

  return {
    code,

    item: clean(raw["ITEM"]),

    group: clean(raw["GROUP"]),

    alcoholGroup: clean(raw["GOL ALCO"]),

    abv: clean(raw["KADAR ALCO %"]),

    volume: clean(raw["VOLUME ISI"]),

    premium: clean(raw["PREMIUM"]),

    barcode: clean(raw["Barcode"]),

    region: clean(raw["Region"]),

    enrichment: getEnrichment(code, language, raw),
  };
}
