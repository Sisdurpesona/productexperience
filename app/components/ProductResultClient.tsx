"use client";

import ProductResult from "./ProductResult";
import { Language, Product } from "../types/product";

type ProductResultClientProps = {
  product: Product;
  language: Language;
  searchedBarcode: string;
};

export default function ProductResultClient({ product, language, searchedBarcode }: ProductResultClientProps) {
  const handleReset = () => {
    window.location.href = "/";
  };

  return <ProductResult product={product} language={language} searchedBarcode={searchedBarcode} onReset={handleReset} />;
}
