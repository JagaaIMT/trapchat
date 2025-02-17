import { Button } from "@mui/material";
import { FormEvent, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useInsert } from "../api/insert";

const Insert = (props: any) => {
    const { base } = props;
    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>, name: string) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const formObj = Object.fromEntries(formData.entries());
            const data = {
                ...formObj,
                commitFreq: formObj.freq,
                nbUsers: formObj.utilisateurs,
                nbFollowers: formObj.amis,
                nbProduits: formObj.produits,
                nbCommandes: formObj.commandes,
            };

            const response = await useInsert(name, data);
            if (response && response.message && response.duration) {
                toast.success("Données insérées avec succès en: " + response.duration + "s");
            } else {
                toast.error("Une erreur lors de l'insertion des données.");
            }
        },
        []
    );
    return (
        <>
        <ToastContainer />
        <div className="m-4">
                <form
                    className="grid grid-cols-7 items-center w-200"
                    onSubmit={(e) => handleSubmit(e, base)}
                >
                    <div className="font-bold">{base}</div>
                    <input
                        name="freq"
                        className="border-b mx-2"
                        type="number"
                        placeholder="Freq"
                    />
                    <input
                        name="utilisateurs"
                        className="border-b mx-2"
                        type="number"
                        placeholder="Utilisateurs"
                    />
                    <input
                        name="amis"
                        className="border-b mx-2"
                        type="number"
                        placeholder="Amis"
                    />
                    <input
                        name="produits"
                        className="border-b mx-2"
                        type="number"
                        placeholder="Produits"
                    />
                    <input
                        name="commandes"
                        className="border-b mx-2"
                        type="number"
                        placeholder="Commandes"
                    />
                    <div>
                        <Button type="submit" variant="contained">
                            Insérer
                        </Button>
                    </div>
                </form>
        </div>
        </>
    )
}

export default Insert;