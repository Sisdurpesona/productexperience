import { ApiResponse, RawProduct } from "../types/product";

const API_URL = "https://script.google.com/macros/s/AKfycbypYVcSDSy0Hl8SM_WpMk3dVidVkwIHySqaloLBinSGEKeP9YqEcFYe3MoLymX9Y-K19A/exec";

export async function fetchProductByBarcode(barcode: string): Promise<ApiResponse<RawProduct>> {
  const cleanBarcode = barcode.trim();

  if (!cleanBarcode) {
    return {
      data: {},
      error: "Barcode belum diberikan.",
    };
  }

  try {
    const response = await fetch(`${API_URL}?barcode=${encodeURIComponent(cleanBarcode)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        data: {},
        error: `Gagal menghubungi database. Status: ${response.status}`,
      };
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        data: {},
        error: result.message || "Product tidak ditemukan.",
      };
    }

    return {
      data: result.data as RawProduct,
    };
  } catch (error) {
    console.error("Product API Error:", error);

    return {
      data: {},
      error: "Gagal terhubung ke database product.",
    };
  }
}
