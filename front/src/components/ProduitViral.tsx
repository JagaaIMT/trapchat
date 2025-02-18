import { FormEvent, useCallback } from "react";
import { useEmailAutocomplete } from "../hooks/useEmailAutocomplete";
import { Produit, useProductAutocomplete } from "../hooks/useProductAutocomplete";
import { toast } from "react-toastify";
import EmailAutocomplete from "./EmailAutocomplete";
import { Autocomplete, Button, TextField } from "@mui/material";
import { useProduitViral } from "../api/request";

interface ProduitFollowersByProductProps {
    base: string;
}

const ProduitViral = ({ base }: ProduitFollowersByProductProps) => {
    const { emails, searchEmail, setSearchEmail } = useEmailAutocomplete(base);
    const { produits, searchProduct, setSearchProduct, selectedProduct, setSelectedProduct } = useProductAutocomplete(base);

    const handleSubmitProduitViral = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const formObj = Object.fromEntries(formData.entries());

            if (!formObj.lvl || !searchEmail || !selectedProduct) {
                toast.error("Veuillez remplir tous les champs.");
                return;
            }

            const response = await useProduitViral(
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
            onSubmit={handleSubmitProduitViral}
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
}

export default ProduitViral;