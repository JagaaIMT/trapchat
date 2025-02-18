// hooks/useProductAutocomplete.ts
import { useEffect, useState } from "react";
import { useGetProducts } from "../api/search";

export interface Produit {
  id: number;
  nom: string;
}

export function useProductAutocomplete(base: string, initialSearch = "") {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [searchProduct, setSearchProduct] = useState<string>(initialSearch);
  const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await useGetProducts(base, searchProduct);
        setProduits(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchProducts();
  }, [searchProduct, base]);

  return { produits, searchProduct, setSearchProduct, selectedProduct, setSelectedProduct };
}
