import { notFound } from "next/navigation";
import ProductHero from "../../components/product/ProductHero";
import { fetchProductByBarcode } from "../../lib/api";
import { mapProduct } from "../../lib/product";

type ProductPageProps = {
  params: Promise<{
    barcode: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { barcode } = await params;

  const cleanBarcode = decodeURIComponent(barcode).trim();

  if (!cleanBarcode) {
    notFound();
  }

  const result = await fetchProductByBarcode(cleanBarcode);

  if (
    result.error ||
    !result.data ||
    Object.keys(result.data).length === 0
  ) {
    notFound();
  }

  const product = mapProduct(result.data, "id");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F1EA",
        boxSizing: "border-box",
      }}
    >
      <ProductHero
        product={product}
        language="id"
      />
    </main>
  );
}
