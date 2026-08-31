"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

const API_URL = "https://script.google.com/macros/s/AKfycbypYVcSDSy0Hl8SM_WpMk3dVidVkwIHySqaloLBinSGEKeP9YqEcFYe3MoLymX9Y-K19A/exec";

type Language = "id" | "en";

type ProductData = Record<string, string>;

type ApiResponse = {
  success: boolean;
  message: string;
  barcode?: string;
  data?: ProductData;
};

const backgroundImage = "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1800&auto=format&fit=crop";

/* =====================================================
   HELPERS
===================================================== */

function getField(product: ProductData, possibleNames: string[]): string {
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

function getItem(product: ProductData) {
  return getField(product, ["ITEM", "Item", "Product Name"]);
}

function getBarcode(product: ProductData, fallback: string) {
  return getField(product, ["Barcode", "BARCODE", "barcode"]) || fallback;
}

function getCode(product: ProductData) {
  return getField(product, ["KODE", "Kode", "CODE", "SKU"]);
}

function getGroup(product: ProductData) {
  return getField(product, ["GROUP", "Group"]);
}

function getAlcoholGroup(product: ProductData) {
  return getField(product, ["GOL ALCO", "Gol Alco", "Alcohol Group"]);
}

function getAlcohol(product: ProductData) {
  return getField(product, ["KADAR ALCO %", "ABV", "Alcohol %"]);
}

function getVolume(product: ProductData) {
  return getField(product, ["VOLUME ISI", "Volume", "Volume Isi"]);
}

function getPremium(product: ProductData) {
  return getField(product, ["PREMIUM", "Premium"]);
}

function getRegion(product: ProductData) {
  return getField(product, ["Region", "REGION"]);
}

function getTastingNotes(product: ProductData, language: Language) {
  if (language === "en") {
    return getField(product, ["Detailed tasting notes", "Detailed Tasting Notes", "English Tasting Notes"]);
  }

  return getField(product, ["Tasting Notes", "Tasting notes"]);
}

function getBrandStory(product: ProductData, language: Language) {
  if (language === "en") {
    return getField(product, ["Detailed story brand", "Detailed Story Brand", "English Story Brand"]);
  }

  return getField(product, ["Story Brand", "Story brand"]);
}

/* =====================================================
   TASTING NOTES PARSER
===================================================== */

function parseTastingNotes(text: string) {
  if (!text) {
    return {
      appearance: "",
      aroma: "",
      taste: "",
      mouthfeel: "",
      finish: "",
      overall: "",
    };
  }

  const clean = text.replace(/\n/g, " ");

  const extract = (label: string, nextLabels: string[]) => {
    const escapedNext = nextLabels.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    const pattern = new RegExp(`${label}\\s*:\\s*(.*?)(?=\\s+(?:${escapedNext.join("|")})\\s*:|$)`, "i");

    const match = clean.match(pattern);

    return match?.[1]?.trim() || "";
  };

  return {
    appearance: extract("Appearance", ["Aroma", "Taste", "Mouthfeel", "Finish", "Overall Impression"]),

    aroma: extract("Aroma", ["Taste", "Mouthfeel", "Finish", "Overall Impression"]),

    taste: extract("Taste", ["Mouthfeel", "Finish", "Overall Impression"]),

    mouthfeel: extract("Mouthfeel", ["Finish", "Overall Impression"]),

    finish: extract("Finish", ["Overall Impression"]),

    overall: extract("Overall Impression", []),
  };
}

/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "20px",
        borderRight: "1px solid #E8E1D6",
        borderBottom: "1px solid #E8E1D6",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "12px",
          background: "#F6F0E5",
          color: "#B69245",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8D8174",
            fontWeight: "700",
            marginBottom: "5px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "18px",
            fontWeight: "700",
            color: "#211B17",
            wordBreak: "break-word",
          }}
        >
          {value || "-"}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MAIN
===================================================== */

export default function Home() {
  const [language, setLanguage] = useState<Language>("id");

  const [barcodeInput, setBarcodeInput] = useState("");

  const [searchedBarcode, setSearchedBarcode] = useState("");

  const [product, setProduct] = useState<ProductData | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* CAMERA */

  const [scannerOpen, setScannerOpen] = useState(false);

  const [scannerLoading, setScannerLoading] = useState(false);

  const [scannerError, setScannerError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  /*
    PENTING:
    Kita menyimpan controls ZXing,
    BUKAN BrowserMultiFormatReader.
  */
  const scannerControlsRef = useRef<IScannerControls | null>(null);

  /* =====================================================
     TRANSLATION
  ===================================================== */

  const t = {
    id: {
      database: "Database Produk",

      subtitle: "Google Sheets → Apps Script → Website",

      placeholder: "Masukkan barcode...",

      search: "CARI",

      scan: "SCAN PRODUCT HERE",

      scanSub: "Gunakan kamera untuk mengenali barcode",

      productFound: "PRODUK DITEMUKAN",

      newSearch: "PENCARIAN BARU",

      productProfile: "PROFIL PRODUK",

      tastingNotes: "TASTING NOTES",

      serveMix: "SERVE & MIX",

      brandStory: "BRAND STORY",

      appearance: "PENAMPILAN",

      aroma: "AROMA",

      taste: "TASTE",

      mouthfeel: "MOUTHFEEL",

      finish: "FINISH",

      bestServed: "PENYAJIAN TERBAIK",

      mixer: "REKOMENDASI MIXER",

      cocktail: "REKOMENDASI COCKTAIL",

      region: "REGION",

      premium: "PREMIUM",

      sku: "SKU / KODE",

      group: "GROUP",

      alcoholGroup: "ALCOHOL GROUP",

      volume: "VOLUME",

      barcode: "BARCODE",

      alcohol: "ABV",

      connection: "Data terhubung dengan Google Sheets melalui Apps Script",

      scannerTitle: "SCAN PRODUCT",

      scannerInstruction: "Arahkan kamera ke barcode produk",

      cameraLoading: "Menyiapkan kamera...",

      close: "TUTUP",

      notFound: "Produk tidak ditemukan",

      emptyBarcode: "Silakan masukkan barcode terlebih dahulu.",

      connectionError: "Gagal terhubung ke database product. Cek koneksi Apps Script.",

      cameraError: "Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan.",

      noCamera: "Kamera tidak ditemukan pada perangkat ini.",
    },

    en: {
      database: "Product Database",

      subtitle: "Google Sheets → Apps Script → Website",

      placeholder: "Enter barcode...",

      search: "SEARCH",

      scan: "SCAN PRODUCT HERE",

      scanSub: "Use your camera to scan the barcode",

      productFound: "PRODUCT FOUND",

      newSearch: "NEW SEARCH",

      productProfile: "PRODUCT PROFILE",

      tastingNotes: "TASTING NOTES",

      serveMix: "SERVE & MIX",

      brandStory: "BRAND STORY",

      appearance: "APPEARANCE",

      aroma: "AROMA",

      taste: "TASTE",

      mouthfeel: "MOUTHFEEL",

      finish: "FINISH",

      bestServed: "BEST SERVED",

      mixer: "RECOMMENDED MIXER",

      cocktail: "COCKTAIL RECOMMENDATION",

      region: "REGION",

      premium: "PREMIUM",

      sku: "SKU / CODE",

      group: "GROUP",

      alcoholGroup: "ALCOHOL GROUP",

      volume: "VOLUME",

      barcode: "BARCODE",

      alcohol: "ABV",

      connection: "Connected to Google Sheets through Apps Script",

      scannerTitle: "SCAN PRODUCT",

      scannerInstruction: "Point your camera at the product barcode",

      cameraLoading: "Preparing camera...",

      close: "CLOSE",

      notFound: "Product not found",

      emptyBarcode: "Please enter a barcode first.",

      connectionError: "Unable to connect to product database. Please check Apps Script.",

      cameraError: "Camera could not be accessed. Please allow camera permission.",

      noCamera: "No camera was found on this device.",
    },
  }[language];

  /* =====================================================
     PRODUCT PROFILE
  ===================================================== */

  const profile = useMemo(() => {
    if (!product) return "";

    const tastingText = getTastingNotes(product, language);

    const parsed = parseTastingNotes(tastingText);

    if (parsed.overall) {
      return parsed.overall;
    }

    if (language === "id") {
      return "Profil produk akan ditampilkan berdasarkan informasi produk yang tersedia.";
    }

    return "Product profile will be displayed based on the available product information.";
  }, [product, language]);

  /* =====================================================
     SEARCH PRODUCT
  ===================================================== */

  const searchProduct = async (barcode: string) => {
    const cleanBarcode = barcode.trim();

    if (!cleanBarcode) {
      setErrorMessage(t.emptyBarcode);

      setProduct(null);

      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setProduct(null);
    setSearchedBarcode(cleanBarcode);

    try {
      const response = await fetch(`${API_URL}?barcode=${encodeURIComponent(cleanBarcode)}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data) {
        setErrorMessage(result.message || t.notFound);

        return;
      }

      setProduct(result.data);
    } catch (error) {
      console.error("API Error:", error);

      setErrorMessage(t.connectionError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await searchProduct(barcodeInput);
  };

  /* =====================================================
     STOP SCANNER
  ===================================================== */

  const stopScanner = () => {
    try {
      /*
        ZXing mengembalikan object controls.
        Method yang benar untuk menghentikan
        kamera adalah controls.stop().
      */
      scannerControlsRef.current?.stop();
    } catch (error) {
      console.error("Scanner cleanup error:", error);
    }

    scannerControlsRef.current = null;

    setScannerOpen(false);
    setScannerLoading(false);
    setScannerError("");
  };

  /* =====================================================
     START SCANNER
  ===================================================== */

  const startScanner = async () => {
    /*
        Bersihkan scanner lama
        sebelum membuka scanner baru.
      */

    try {
      scannerControlsRef.current?.stop();
    } catch {}

    scannerControlsRef.current = null;

    setScannerError("");
    setScannerLoading(true);
    setScannerOpen(true);

    try {
      /*
          Tunggu DOM video benar-benar
          tersedia setelah modal muncul.
        */

      await new Promise((resolve) => setTimeout(resolve, 250));

      if (!videoRef.current) {
        throw new Error("Video element belum tersedia.");
      }

      /*
          Pastikan browser mendukung kamera.
        */

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser tidak mendukung camera access.");
      }

      const reader = new BrowserMultiFormatReader();

      /*
          Cari kamera.
        */

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (!devices || devices.length === 0) {
        throw new Error("No camera found.");
      }

      /*
          Prioritaskan kamera belakang.
        */

      const preferredDevice = devices.find((device) => /back|rear|environment/i.test(device.label)) || devices[devices.length - 1];

      /*
          decodeFromVideoDevice
          mengembalikan CONTROLS.

          Ini yang kita simpan.
        */

      const controls = await reader.decodeFromVideoDevice(preferredDevice.deviceId, videoRef.current, async (result, error) => {
        /*
                error di sini normal.
                ZXing akan mengirim error
                setiap frame yang belum
                menemukan barcode.
              */

        if (!result) {
          return;
        }

        const scannedCode = result.getText().trim();

        if (!scannedCode) {
          return;
        }

        /*
                STOP KAMERA SEBELUM
                SEARCH DATABASE.
              */

        try {
          controls.stop();
        } catch {}

        scannerControlsRef.current = null;

        setScannerOpen(false);
        setScannerLoading(false);

        /*
                Masukkan barcode
                ke input.
              */

        setBarcodeInput(scannedCode);

        /*
                Langsung cari produk.
              */

        await searchProduct(scannedCode);
      });

      scannerControlsRef.current = controls;

      setScannerLoading(false);
    } catch (error) {
      console.error("Scanner Error:", error);

      setScannerLoading(false);

      setScannerError(error instanceof Error && error.message === "No camera found." ? t.noCamera : t.cameraError);
    }
  };

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      try {
        scannerControlsRef.current?.stop();
      } catch {}

      scannerControlsRef.current = null;
    };
  }, []);

  /* =====================================================
     RESET
  ===================================================== */

  const resetSearch = () => {
    setBarcodeInput("");
    setSearchedBarcode("");
    setProduct(null);
    setErrorMessage("");
  };

  /* =====================================================
     PRODUCT DATA
  ===================================================== */

  const itemName = product ? getItem(product) : "";

  const barcode = product ? getBarcode(product, searchedBarcode) : searchedBarcode;

  const code = product ? getCode(product) : "";

  const group = product ? getGroup(product) : "";

  const alcoholGroup = product ? getAlcoholGroup(product) : "";

  const alcohol = product ? getAlcohol(product) : "";

  const volume = product ? getVolume(product) : "";

  const premium = product ? getPremium(product) : "";

  const region = product ? getRegion(product) : "";

  const tastingText = product ? getTastingNotes(product, language) : "";

  const tasting = parseTastingNotes(tastingText);

  const brandStory = product ? getBrandStory(product, language) : "";

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          color: "#211B17",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#F5EFE5",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          style={{
            minHeight: product ? "560px" : "100vh",

            position: "relative",

            backgroundImage: `
              linear-gradient(
                rgba(18, 13, 9, 0.72),
                rgba(18, 13, 9, 0.60)
              ),
              url("${backgroundImage}")
            `,

            backgroundSize: "cover",

            backgroundPosition: "center",

            backgroundAttachment: "fixed",
          }}
        >
          {/* HEADER */}

          <header
            style={{
              height: "90px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 5vw",
              borderBottom: "1px solid rgba(255,255,255,0.16)",
              color: "#FFFFFF",
              position: "relative",
              zIndex: 5,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "1px solid #B69245",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "23px",
                  color: "#D5B267",
                }}
              >
                🍾
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "19px",
                    letterSpacing: "0.05em",
                  }}
                >
                  ALCOHOL
                </div>

                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    color: "#D6B76D",
                    fontSize: "17px",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                  }}
                >
                  SELF-TAKER
                </div>
              </div>
            </div>

            {/* LANGUAGE */}

            <div
              style={{
                display: "flex",
                gap: "5px",
                padding: "4px",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "12px",
              }}
            >
              <button
                onClick={() => setLanguage("id")}
                style={{
                  border: "none",
                  borderRadius: "9px",
                  padding: "10px 15px",
                  background: language === "id" ? "#D4B264" : "transparent",
                  color: language === "id" ? "#211B17" : "#FFFFFF",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                🇮🇩 ID
              </button>

              <button
                onClick={() => setLanguage("en")}
                style={{
                  border: "none",
                  borderRadius: "9px",
                  padding: "10px 15px",
                  background: language === "en" ? "#D4B264" : "transparent",
                  color: language === "en" ? "#211B17" : "#FFFFFF",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                🇬🇧 EN
              </button>
            </div>
          </header>

          {/* HERO CONTENT */}

          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "70px 24px 90px",
              textAlign: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                color: "#D6B76D",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "0.35em",
                marginBottom: "15px",
              }}
            >
              ALCOHOL SELF-TAKER
            </div>

            <h1
              style={{
                margin: 0,
                color: "#FFFFFF",
                fontFamily: "Georgia, serif",
                fontSize: "clamp(44px, 7vw, 78px)",
                lineHeight: "0.98",
                letterSpacing: "-0.035em",
              }}
            >
              Product{" "}
              <span
                style={{
                  color: "#D6B76D",
                }}
              >
                {t.database}
              </span>
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "17px",
                margin: "20px 0 34px",
              }}
            >
              {t.subtitle}
            </p>

            <div
              style={{
                width: "70px",
                height: "1px",
                background: "#D6B76D",
                margin: "0 auto 28px",
              }}
            />

            {/* SEARCH */}

            <div
              style={{
                maxWidth: "760px",
                margin: "0 auto",
                background: "rgba(255,255,255,0.96)",
                borderRadius: "22px",
                padding: "12px",
                boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
              }}
            >
              <form
                onSubmit={handleBarcodeSubmit}
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "0 12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      color: "#B69245",
                    }}
                  >
                    ▥
                  </span>

                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder={t.placeholder}
                    inputMode="numeric"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: "16px",
                      color: "#211B17",
                      padding: "18px 5px",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    minWidth: "125px",
                    border: "none",
                    borderRadius: "14px",
                    background: "#211B17",
                    color: "#FFFFFF",
                    fontWeight: "800",
                    letterSpacing: "0.08em",
                    cursor: isLoading ? "wait" : "pointer",
                    padding: "0 24px",
                  }}
                >
                  {isLoading ? "..." : t.search}
                </button>
              </form>
            </div>

            {/* SCANNER BUTTON */}

            <button
              onClick={startScanner}
              disabled={isLoading || scannerOpen}
              style={{
                marginTop: "25px",
                border: "none",
                background: "transparent",
                color: "#FFFFFF",
                cursor: scannerOpen ? "wait" : "pointer",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "7px",
                opacity: scannerOpen ? 0.7 : 1,
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.2em",
                  fontWeight: "800",
                  textDecoration: "underline",
                  textUnderlineOffset: "5px",
                }}
              >
                📷 {t.scan}
              </span>

              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {t.scanSub}
              </span>
            </button>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage && (
          <section
            style={{
              maxWidth: "1000px",
              margin: "-35px auto 40px",
              position: "relative",
              zIndex: 4,
              padding: "0 20px",
            }}
          >
            <div
              style={{
                background: "#FFF7F5",
                border: "1px solid #E5C9C1",
                borderRadius: "18px",
                padding: "20px",
                color: "#8F3C32",
              }}
            >
              <strong>{t.notFound}</strong>

              <div
                style={{
                  marginTop: "5px",
                }}
              >
                {errorMessage}
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            PRODUCT RESULT
        ================================================= */}

        {product && (
          <section
            style={{
              maxWidth: "1080px",
              margin: "-70px auto 70px",
              padding: "0 18px",
              position: "relative",
              zIndex: 4,
            }}
          >
            <div
              style={{
                background: "#FFFDF9",
                borderRadius: "26px",
                boxShadow: "0 30px 80px rgba(35,25,15,0.22)",
                overflow: "hidden",
                border: "1px solid #E5DCCD",
              }}
            >
              {/* PRODUCT HEADER */}

              <div
                style={{
                  padding: "35px 40px 25px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#B69245",
                      fontSize: "11px",
                      fontWeight: "800",
                      letterSpacing: "0.2em",
                      marginBottom: "10px",
                    }}
                  >
                    ✓ {t.productFound}
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontFamily: "Georgia, serif",
                      fontSize: "clamp(30px, 5vw, 48px)",
                      lineHeight: 1,
                      color: "#191512",
                    }}
                  >
                    {itemName || "Product"}
                  </h2>

                  <div
                    style={{
                      marginTop: "12px",
                      color: "#84786D",
                    }}
                  >
                    {group || "Alcohol Product"}
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      color: "#B69245",
                      fontWeight: "700",
                    }}
                  >
                    {t.barcode}: {barcode}
                  </div>
                </div>

                <button
                  onClick={resetSearch}
                  style={{
                    border: "1px solid #C9A95D",
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    padding: "13px 18px",
                    color: "#735522",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  ↻ {t.newSearch}
                </button>
              </div>

              {/* MAIN GRID */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(250px, 0.75fr) minmax(0, 1.6fr)",
                  gap: 0,
                  padding: "0 28px 28px",
                }}
              >
                {/* LEFT */}

                <div
                  style={{
                    padding: "0 12px 0 0",
                  }}
                >
                  {/* PRODUCT IMAGE */}

                  <div
                    style={{
                      height: "370px",
                      borderRadius: "18px",
                      backgroundImage: `
                        linear-gradient(
                          rgba(20,15,11,0.15),
                          rgba(20,15,11,0.35)
                        ),
                        url("${backgroundImage}")
                      `,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        color: "#FFFFFF",
                        padding: "30px",
                        textShadow: "0 2px 15px rgba(0,0,0,0.8)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "75px",
                          marginBottom: "15px",
                        }}
                      >
                        🍾
                      </div>

                      <div
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: "24px",
                          fontWeight: "700",
                        }}
                      >
                        {itemName || "Product"}
                      </div>

                      <div
                        style={{
                          color: "#E0C27A",
                          marginTop: "8px",
                        }}
                      >
                        {volume ? `${volume} ML` : ""}
                      </div>
                    </div>
                  </div>

                  {/* REGION + PREMIUM */}

                  <div
                    style={{
                      marginTop: "14px",
                      background: "#F7F1E8",
                      borderRadius: "16px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "20px",
                        borderBottom: "1px solid #E2D9CB",
                      }}
                    >
                      <div
                        style={{
                          color: "#B69245",
                          fontSize: "10px",
                          fontWeight: "800",
                          letterSpacing: "0.15em",
                        }}
                      >
                        {t.region}
                      </div>

                      <div
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: "20px",
                          fontWeight: "700",
                          marginTop: "5px",
                        }}
                      >
                        🌍 {region || "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "20px",
                      }}
                    >
                      <div
                        style={{
                          color: "#B69245",
                          fontSize: "10px",
                          fontWeight: "800",
                          letterSpacing: "0.15em",
                        }}
                      >
                        {t.premium}
                      </div>

                      <div
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: "20px",
                          fontWeight: "700",
                          marginTop: "5px",
                        }}
                      >
                        ◆ {premium || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}

                <div>
                  {/* MASTER INFO */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      border: "1px solid #E5DED4",
                      borderRadius: "16px",
                      overflow: "hidden",
                    }}
                  >
                    <InfoItem icon="💧" label={t.alcohol} value={alcohol ? `${alcohol}%` : "-"} />

                    <InfoItem icon="⚗" label={t.volume} value={volume ? `${volume} ML` : "-"} />

                    <InfoItem icon="◈" label={t.alcoholGroup} value={alcoholGroup || "-"} />

                    <InfoItem icon="▥" label={t.sku} value={code || "-"} />

                    <InfoItem icon="🍾" label={t.group} value={group || "-"} />

                    <InfoItem icon="▥" label={t.barcode} value={barcode || "-"} />
                  </div>

                  {/* PROFILE + TASTING */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    {/* PROFILE */}

                    <div
                      style={{
                        border: "1px solid #E5DED4",
                        borderRadius: "16px",
                        padding: "25px",
                        minHeight: "300px",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 20px",
                          fontFamily: "Georgia, serif",
                          fontSize: "18px",
                        }}
                      >
                        🥂 {t.productProfile}
                      </h3>

                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.8,
                          color: "#625950",
                          margin: 0,
                        }}
                      >
                        {profile}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "7px",
                          marginTop: "20px",
                        }}
                      >
                        {group && (
                          <span
                            style={{
                              padding: "7px 11px",
                              borderRadius: "7px",
                              background: "#E6EDDD",
                              fontSize: "10px",
                              fontWeight: "800",
                            }}
                          >
                            {group}
                          </span>
                        )}

                        {alcohol && (
                          <span
                            style={{
                              padding: "7px 11px",
                              borderRadius: "7px",
                              background: "#F1E7D3",
                              fontSize: "10px",
                              fontWeight: "800",
                            }}
                          >
                            {alcohol}% ABV
                          </span>
                        )}

                        {region && (
                          <span
                            style={{
                              padding: "7px 11px",
                              borderRadius: "7px",
                              background: "#E6EDDD",
                              fontSize: "10px",
                              fontWeight: "800",
                            }}
                          >
                            {region}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TASTING */}

                    <div
                      style={{
                        border: "1px solid #E5DED4",
                        borderRadius: "16px",
                        padding: "25px",
                        minHeight: "300px",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 20px",
                          fontFamily: "Georgia, serif",
                          fontSize: "18px",
                        }}
                      >
                        🍷 {t.tastingNotes}
                      </h3>

                      {[
                        [t.appearance, tasting.appearance, "◌"],
                        [t.aroma, tasting.aroma, "◉"],
                        [t.taste, tasting.taste, "◈"],
                        [t.mouthfeel, tasting.mouthfeel, "◍"],
                        [t.finish, tasting.finish, "✦"],
                      ].map(([label, value, icon]) => (
                        <div
                          key={label}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "24px 100px 1fr",
                            gap: "8px",
                            marginBottom: "14px",
                            alignItems: "start",
                          }}
                        >
                          <span
                            style={{
                              color: "#B69245",
                            }}
                          >
                            {icon}
                          </span>

                          <strong
                            style={{
                              fontSize: "10px",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            {label}
                          </strong>

                          <span
                            style={{
                              fontSize: "12px",
                              lineHeight: 1.55,
                              color: "#625950",
                            }}
                          >
                            {value || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SERVE + BRAND */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    {/* SERVE */}

                    <div
                      style={{
                        background: "#FBF7F0",
                        border: "1px solid #E5DED4",
                        borderRadius: "16px",
                        padding: "25px",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 20px",
                          fontFamily: "Georgia, serif",
                          fontSize: "18px",
                        }}
                      >
                        🍸 {t.serveMix}
                      </h3>

                      <div
                        style={{
                          display: "grid",
                          gap: "18px",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display: "block",
                              fontSize: "10px",
                              letterSpacing: "0.12em",
                              marginBottom: "5px",
                            }}
                          >
                            {t.bestServed}
                          </strong>

                          <span
                            style={{
                              fontSize: "13px",
                              color: "#625950",
                            }}
                          >
                            {language === "id" ? "Sajikan sesuai karakter produk." : "Serve according to the product character."}
                          </span>
                        </div>

                        <div>
                          <strong
                            style={{
                              display: "block",
                              fontSize: "10px",
                              letterSpacing: "0.12em",
                              marginBottom: "5px",
                            }}
                          >
                            {t.mixer}
                          </strong>

                          <span
                            style={{
                              fontSize: "13px",
                              color: "#625950",
                            }}
                          >
                            {language === "id" ? "Rekomendasi mixer akan dikembangkan berdasarkan karakter produk." : "Mixer recommendations will be developed based on the product character."}
                          </span>
                        </div>

                        <div>
                          <strong
                            style={{
                              display: "block",
                              fontSize: "10px",
                              letterSpacing: "0.12em",
                              marginBottom: "5px",
                            }}
                          >
                            {t.cocktail}
                          </strong>

                          <span
                            style={{
                              fontSize: "13px",
                              color: "#625950",
                            }}
                          >
                            {language === "id" ? "Rekomendasi cocktail akan disesuaikan dengan profil produk." : "Cocktail recommendations will be matched to the product profile."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BRAND STORY */}

                    <div
                      style={{
                        border: "1px solid #E5DED4",
                        borderRadius: "16px",
                        padding: "25px",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 18px",
                          fontFamily: "Georgia, serif",
                          fontSize: "18px",
                        }}
                      >
                        📖 {t.brandStory}
                      </h3>

                      <p
                        style={{
                          fontSize: "13px",
                          lineHeight: 1.75,
                          color: "#625950",
                          margin: 0,
                        }}
                      >
                        {brandStory || (language === "id" ? "Brand story belum tersedia." : "Brand story is not available yet.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONNECTION */}

              <div
                style={{
                  padding: "22px",
                  borderTop: "1px solid #E5DED4",
                  textAlign: "center",
                  color: "#A1834A",
                  fontSize: "12px",
                  letterSpacing: "0.05em",
                }}
              >
                🔒 {t.connection}
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}

        <footer
          style={{
            background: "#17120E",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            padding: "30px 20px",
            fontSize: "11px",
            letterSpacing: "0.12em",
          }}
        >
          © 2026 ALCOHOL SELF-TAKER · RETAIL ALCOHOL EXPERIENCE
        </footer>
      </main>

      {/* ===================================================
          CAMERA MODAL
      =================================================== */}

      {scannerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#17120E",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 30px 100px rgba(0,0,0,0.6)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                padding: "20px",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#D6B76D",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  fontWeight: "800",
                }}
              >
                {t.scannerTitle}
              </div>

              <h2
                style={{
                  fontFamily: "Georgia, serif",
                  margin: "8px 0 5px",
                  fontSize: "22px",
                }}
              >
                {t.scannerInstruction}
              </h2>

              {scannerLoading && (
                <div
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  {t.cameraLoading}
                </div>
              )}
            </div>

            {/* CAMERA */}

            <div
              style={{
                position: "relative",
                background: "#000000",
                aspectRatio: "4 / 3",
                overflow: "hidden",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* SCAN OVERLAY */}

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "10%",
                    right: "10%",
                    top: "25%",
                    bottom: "25%",
                    border: "2px solid #D6B76D",
                    borderRadius: "16px",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.28)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "8%",
                      right: "8%",
                      top: "50%",
                      height: "2px",
                      background: "#D6B76D",
                      boxShadow: "0 0 15px #D6B76D",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      bottom: "-35px",
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {language === "id" ? "POSISIKAN BARCODE DI DALAM KOTAK" : "POSITION THE BARCODE INSIDE THE FRAME"}
                  </div>
                </div>
              </div>
            </div>

            {/* ERROR CAMERA */}

            {scannerError && (
              <div
                style={{
                  color: "#F3B6AA",
                  textAlign: "center",
                  padding: "18px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {scannerError}
              </div>
            )}

            {/* CLOSE */}

            <div
              style={{
                padding: "18px",
              }}
            >
              <button
                onClick={stopScanner}
                style={{
                  width: "100%",
                  border: "1px solid #B69245",
                  background: "transparent",
                  color: "#D6B76D",
                  borderRadius: "12px",
                  padding: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
