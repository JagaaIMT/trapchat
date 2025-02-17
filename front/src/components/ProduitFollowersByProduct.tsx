import { Autocomplete, Button, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useGetEmails, useGetProducts } from "../api/search";
import { toast } from "react-toastify";
import { useProduitFollowersByProduct } from "../api/request";

interface Produit {
    id: number;
    nom: string;
}

const ProduitFollowersByProduct = (props: any) => {
    const { base } = props;
    const [emails, setEmails] = useState<string[]>([]);
    const [searchEmail, setSearchEmail] = useState<string>("");
    const [produits, setProduits] = useState<Produit[]>([]);
    const [searchProduct, setSearchProduct] = useState<string>("");

    const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);

    useEffect(() => {
        async function fetchEmails() {
            try {
                const response = await useGetEmails(base, searchEmail);
                setEmails(response.data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchEmails();
    }, [searchEmail, base]);

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

    const handleSubmitProduitFollowersByProduct = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const formObj = Object.fromEntries(formData.entries());

            if (!formObj.lvl || !searchEmail || !selectedProduct) {
                toast.error("Veuillez remplir tous les champs.");
                return;
            }

            const response = await useProduitFollowersByProduct(
                base,
                searchEmail,
                formObj.lvl,
                selectedProduct.id 
            );
            if (response && response.data && response.duration) {
                console.log(response.data);
                toast.success("Données traitées avec succès en: " + response.duration + "s");
            } else {
                toast.error("Une erreur est survenue lors de la recherche de données.");
            }
        },
        [searchEmail, selectedProduct, base]
    );

    return (
        <form
            className="grid grid-cols-5 items-center"
            onSubmit={handleSubmitProduitFollowersByProduct}
        >
            {base}
            <Autocomplete
                disablePortal
                options={emails}
                value={searchEmail}
                onInputChange={(event, newInputValue) => {
                    setSearchEmail(newInputValue);
                }}
                renderInput={(params) => <TextField {...params} label="Email" />}
            />
            <Autocomplete
                disablePortal
                options={produits}
                getOptionLabel={(option) => option.nom}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedProduct}
                onChange={(event, newValue) => {
                    setSelectedProduct(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                    setSearchProduct(newInputValue);
                }}
                renderInput={(params) => <TextField {...params} label="Produit" />}
            />
            <input
                name="lvl"
                className="border-b mx-2"
                type="number"
                placeholder="Niveau"
            />
            <Button type="submit" variant="contained">
                Rechercher
            </Button>
        </form>
    );
};

export default ProduitFollowersByProduct;
