// ProduitFollowersByProduct.tsx
import { Autocomplete, Button, TextField } from "@mui/material";
import { FormEvent, useCallback } from "react";
import { toast } from "react-toastify";
import { useEmailAutocomplete } from "../hooks/useEmailAutocomplete";
import { useProductAutocomplete, Produit } from "../hooks/useProductAutocomplete";
import { useProduitFollowersByProduct } from "../api/request";
import EmailAutocomplete from "../components/EmailAutocomplete";

interface ProduitFollowersByProductProps {
    base: string;
}

const ProduitFollowersByProduct = ({ base }: ProduitFollowersByProductProps) => {
    const { emails, searchEmail, setSearchEmail } = useEmailAutocomplete(base);
    const { produits, searchProduct, setSearchProduct, selectedProduct, setSelectedProduct } =
        useProductAutocomplete(base);

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
            <EmailAutocomplete
                emails={emails}
                searchEmail={searchEmail}
                onChange={(event, newInputValue) => setSearchEmail(newInputValue)}
            />
            <Autocomplete
                disablePortal
                options={produits}
                getOptionLabel={(option: Produit) => option.nom}
                isOptionEqualToValue={(option: Produit, value: Produit) => option.id === value.id}
                value={selectedProduct}
                onChange={(event, newValue) => setSelectedProduct(newValue)}
                onInputChange={(event, newInputValue) => setSearchProduct(newInputValue)}
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
