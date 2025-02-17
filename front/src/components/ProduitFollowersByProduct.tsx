import { Autocomplete, Button, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useGetEmails, useGetProducts } from "../api/search";

const ProduitFollowersByProduct = (props: any) => {
    const { base } = props;
    const [emails, setEmails] = useState<string[]>([]);
    const [searchEmail, setSearchEmail] = useState<string>("");
    const [prodcuts, setProdcuts] = useState<string[]>([]);
    const [searchProduct, setSearchProduct] = useState<string>("");

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
    }, [searchEmail]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await useGetProducts(base, searchProduct);
                setProdcuts(response.data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchProducts();
    }, [searchProduct]);

    // const handleSubmitProduitFollowersByProduct = useCallback(
    //     async (e: FormEvent<HTMLFormElement>) => {
    //         e.preventDefault();

    //         const formData = new FormData(e.currentTarget);
    //         const formObj = Object.fromEntries(formData.entries());

    //         if (!formObj.lvl || !searchEmail) {
    //             return;
    //         }

    //         // const response = await useProduitsFollowers(base, searchEmail, formObj.lvl);
    //         // if (response && response.data && response.duration) {
    //         //     toast.success("Données traité avec succès en: " + response.duration + "s");
    //         // } else {
    //         //     toast.error("Une erreur lors de la recherche de données.");
    //         // }
    //     },
    //     [searchEmail]
    // );

    return (
        <form
            className="grid grid-cols-4 items-center w-200"
            // onSubmit={(e) => handleSubmitProduitFollowersByProduct(e)}
        >
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
                options={prodcuts}
                value={searchProduct}
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

}

export default ProduitFollowersByProduct;