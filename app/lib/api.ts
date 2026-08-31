import { ApiResponse, RawProduct } from "../types/product";

export const API_URL = "https://script.google.com/macros/s/AKfycbypYVcSDSy0Hl8SM_WpMk3dVidVkwIHySqaloLBinSGEKeP9YqEcFYe3MoLymX9Y-K19A/exec";

export async function getProductByBarcode(barcode: string): Promise<RawProduct> {
  const cleanBarcode = barcode.trim();

  if (!cleanBarcode) {
    throw new Error("Barcode belum diberikan.");
  }

  const url = `${API_URL}?barcode=${encodeURIComponent(cleanBarcode)}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result: ApiResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "Product tidak ditemukan.");
  }

  return result.data;
}
