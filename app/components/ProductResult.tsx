"use client";

import React from "react";
import { Language, Product } from "../types/product";

type ProductResultProps = {
  product: Product;
  language: Language;
  searchedBarcode: string;
  onReset: () => void;
};

export default function ProductResult({ product, language, searchedBarcode, onReset }: ProductResultProps) {
  const enrichment = product.enrichment;

  const itemName = product.item || "Product";
  const barcode = product.barcode || searchedBarcode || "-";
  const code = product.code || "-";
  const group = product.group || "Alcohol Product";
  const alcoholGroup = product.alcoholGroup || "-";
  const alcohol = product.abv || "";
  const volume = product.volume || "";
  const premium = product.premium || "-";
  const region = product.region || "-";

  const t =
    language === "id"
      ? {
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
        }
      : {
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
        };

  return (
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
              {itemName}
            </h2>

            <div
              style={{
                marginTop: "12px",
                color: "#84786D",
              }}
            >
              {group}
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
            type="button"
            onClick={onReset}
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
            → {t.newSearch}
          </button>
        </div>

        {/* MAIN PRODUCT AREA */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(250px, 0.75fr) minmax(0, 1.6fr)",
            gap: 0,
            padding: "0 28px 28px",
          }}
        >
          {/* LEFT COLUMN */}

          <div
            style={{
              padding: "0 12px 0 0",
            }}
          >
            <div
              style={{
                height: "370px",
                borderRadius: "18px",
                backgroundImage: `
                  linear-gradient(
                    rgba(20,15,11,0.15),
                    rgba(20,15,11,0.35)
                  ),
                  url("https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1800&auto=format&fit=crop")
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
                  🍷
                </div>

                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "24px",
                    fontWeight: "700",
                  }}
                >
                  {itemName}
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

            {/* REGION / PREMIUM */}

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
                  🌍 {region}
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
                  ◆ {premium}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}

          <div>
            {/* PRODUCT INFORMATION GRID */}

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

              <InfoItem icon="◈" label={t.alcoholGroup} value={alcoholGroup} />

              <InfoItem icon="▾" label={t.sku} value={code} />

              <InfoItem icon="🍷" label={t.group} value={group} />

              <InfoItem icon="▾" label={t.barcode} value={barcode} />
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
                  {enrichment.profile || (language === "id" ? "Profil produk belum tersedia." : "Product profile is not available yet.")}
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

                  {region !== "-" && (
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

              {/* TASTING NOTES */}

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

                <TastingItem label={t.appearance} value={enrichment.tasting.appearance} icon="◌" />

                <TastingItem label={t.aroma} value={enrichment.tasting.aroma} icon="◉" />

                <TastingItem label={t.taste} value={enrichment.tasting.taste} icon="◈" />

                <TastingItem label={t.mouthfeel} value={enrichment.tasting.mouthfeel} icon="○" />

                <TastingItem label={t.finish} value={enrichment.tasting.finish} icon="✦" />
              </div>
            </div>

            {/* SERVE & MIX + BRAND STORY */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              {/* SERVE & MIX */}

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
                  🥃 {t.serveMix}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "18px",
                  }}
                >
                  <ServeItem label={t.bestServed} value={enrichment.serveMix.bestServed} />

                  <ServeItem label={t.mixer} value={enrichment.serveMix.recommendedMixer} />

                  <ServeItem label={t.cocktail} value={enrichment.serveMix.cocktail} />
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
                  {enrichment.brandStory || (language === "id" ? "Brand story belum tersedia." : "Brand story is not available yet.")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONNECTION FOOTER */}

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
  );
}

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

      <div style={{ minWidth: 0 }}>
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

function TastingItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
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
  );
}

function ServeItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong
        style={{
          display: "block",
          fontSize: "10px",
          letterSpacing: "0.12em",
          marginBottom: "5px",
        }}
      >
        {label}
      </strong>

      <span
        style={{
          fontSize: "13px",
          color: "#625950",
        }}
      >
        {value || "-"}
      </span>
    </div>
  );
}
