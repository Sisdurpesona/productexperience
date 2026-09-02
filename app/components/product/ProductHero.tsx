"use client";

import React from "react";
import { Language, Product } from "../../types/product";

type ProductHeroProps = {
  product: Product;
  language: Language;
};

export default function ProductHero({ product, language }: ProductHeroProps) {
  const itemName = product.item || "Product";
  const group = product.group || "Alcohol Product";
  const alcoholGroup = product.alcoholGroup || "-";
  const alcohol = product.abv || "-";
  const volume = product.volume ? `${product.volume} ML` : "-";
  const region = product.region || "-";
  const premium = product.premium || "-";
  const code = product.code || "-";
  const barcode = product.barcode || "-";
  const imageUrl = product.enrichment?.imageUrl || "";

  const isPremium = premium.toLowerCase() === "yes" || premium.toLowerCase() === "y" || premium.toLowerCase() === "premium";

  const t =
    language === "id"
      ? {
          experience: "PRODUCT EXPERIENCE",
          productFound: "PRODUK DITEMUKAN",
          newSearch: "PENCARIAN BARU",
          group: "GROUP",
          alcoholGroup: "ALCOHOL GROUP",
          abv: "ABV",
          volume: "VOLUME",
          region: "REGION",
          premium: "PREMIUM",
          sku: "SKU / KODE",
          barcode: "BARCODE",
        }
      : {
          experience: "PRODUCT EXPERIENCE",
          productFound: "PRODUCT FOUND",
          newSearch: "NEW SEARCH",
          group: "GROUP",
          alcoholGroup: "ALCOHOL GROUP",
          abv: "ABV",
          volume: "VOLUME",
          region: "REGION",
          premium: "PREMIUM",
          sku: "SKU / CODE",
          barcode: "BARCODE",
        };

  return (
    <section
      style={{
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "18px 14px 40px",
        background: "linear-gradient(180deg, #F8F6F1 0%, #F2EEE6 100%)",
        color: "#17243A",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            marginBottom: "18px",
          }}
        >
          <span
            style={{
              width: "30px",
              height: "1px",
              background: "#B08A3C",
            }}
          />

          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.18em",
              color: "#8A6B2E",
            }}
          >
            {t.experience}
          </span>
        </div>

        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid rgba(23,36,58,0.09)",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 22px 55px rgba(23,36,58,0.10)",
          }}
        >
          <div
            style={{
              position: "relative",
              height: "min(76vw, 390px)",
              minHeight: "280px",
              background: "radial-gradient(circle at center, #FFFFFF 0%, #F0ECE4 72%, #E8E3D9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={itemName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "22px",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#8A8F98",
                }}
              >
                <div
                  style={{
                    fontSize: "64px",
                    marginBottom: "14px",
                  }}
                >
                  ◇
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                  }}
                >
                  PRODUCT IMAGE
                </div>
              </div>
            )}

            {isPremium && (
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  padding: "8px 11px",
                  borderRadius: "999px",
                  background: "#17243A",
                  color: "#F3D48A",
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                }}
              >
                PREMIUM
              </div>
            )}
          </div>

          <div
            style={{
              padding: "24px 20px 22px",
              borderTop: "1px solid rgba(23,36,58,0.07)",
            }}
          >
            <div
              style={{
                marginBottom: "8px",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "#8A6B2E",
              }}
            >
              {t.productFound}
            </div>

            <div
              style={{
                marginBottom: "8px",
                fontSize: "11px",
                color: "#7D8490",
              }}
            >
              {group}
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(30px, 8vw, 44px)",
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                color: "#17243A",
                overflowWrap: "anywhere",
              }}
            >
              {itemName}
            </h1>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "9px",
              padding: "0 14px 14px",
            }}
          >
            <FactCard label={t.abv} value={alcohol === "-" ? "-" : `${alcohol}%`} accent />

            <FactCard label={t.volume} value={volume} />

            <FactCard label={t.region} value={region} />

            <FactCard label={t.premium} value={premium} />
          </div>

          <div
            style={{
              margin: "0 14px 14px",
              padding: "17px",
              borderRadius: "17px",
              background: "#F7F4ED",
              border: "1px solid rgba(23,36,58,0.07)",
            }}
          >
            <DetailItem label={t.alcoholGroup} value={alcoholGroup} />

            <DetailItem label={t.sku} value={code} />

            <DetailItem label={t.barcode} value={barcode} />
          </div>

          <div
            style={{
              padding: "4px 14px 16px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                width: "100%",
                minHeight: "48px",
                border: "1px solid #B08A3C",
                borderRadius: "13px",
                background: "#FFFFFF",
                color: "#735522",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ← {t.newSearch}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FactCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: "15px 14px 14px",
        borderRadius: "15px",
        background: accent ? "rgba(176,138,60,0.10)" : "#FFFFFF",
        border: "1px solid rgba(23,36,58,0.07)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          marginBottom: "6px",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: accent ? "#8A6B2E" : "#8A919C",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          fontWeight: 750,
          color: "#17243A",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        marginBottom: "13px",
      }}
    >
      <div
        style={{
          marginBottom: "5px",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "#8A6B2E",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "13px",
          lineHeight: 1.5,
          fontWeight: 650,
          color: "#263247",
          overflowWrap: "anywhere",
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}
