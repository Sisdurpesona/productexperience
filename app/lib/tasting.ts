import { Language, TastingNotes } from "../types/product";

export type TastingSection = {
  key: "appearance" | "aroma" | "taste" | "mouthfeel" | "finish";

  label: string;

  value: string;
};

const LABELS = {
  id: {
    appearance: "PENAMPILAN",
    aroma: "AROMA",
    taste: "RASA",
    mouthfeel: "MOUTHFEEL",
    finish: "FINISH",
  },

  en: {
    appearance: "APPEARANCE",
    aroma: "AROMA",
    taste: "TASTE",
    mouthfeel: "MOUTHFEEL",
    finish: "FINISH",
  },
};

/* =====================================================
   GET TASTING SECTIONS
   ===================================================== */

export function getTastingSections(tasting: TastingNotes, language: Language): TastingSection[] {
  const labels = LABELS[language];

  return [
    {
      key: "appearance",
      label: labels.appearance,
      value: tasting.appearance || "-",
    },

    {
      key: "aroma",
      label: labels.aroma,
      value: tasting.aroma || "-",
    },

    {
      key: "taste",
      label: labels.taste,
      value: tasting.taste || "-",
    },

    {
      key: "mouthfeel",
      label: labels.mouthfeel,
      value: tasting.mouthfeel || "-",
    },

    {
      key: "finish",
      label: labels.finish,
      value: tasting.finish || "-",
    },
  ];
}

/* =====================================================
   VALIDATE TASTING NOTES
   ===================================================== */

export function hasCompleteTasting(tasting?: TastingNotes): boolean {
  if (!tasting) {
    return false;
  }

  return Boolean(tasting.appearance && tasting.aroma && tasting.taste && tasting.mouthfeel && tasting.finish);
}
