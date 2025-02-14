import { Button } from "@mui/material";
import { FormEvent, useCallback } from "react";
import "./App.css";
import { useInsert } from "./api/insert";
import { toast, ToastContainer } from "react-toastify";

function App() {
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
            if(response.message){
                toast.success("Données insérées avec succès !");
            } else{     
                toast.error("Une erreur lors de l'insertion des données.");
            }
        },
        []
    );

    const urllist = ["mariadb", "neo4j"];

    return (
        <>
        <ToastContainer />
            <div className="m-4">
                {urllist.map((value, key: any) => (
                    <form key={key} className="grid grid-cols-7 items-center w-200" onSubmit={(e) => handleSubmit(e, value)}>
                        <div className="font-bold">{value}</div>
                        <input name="freq" className="border-b mx-2" type="number" placeholder="Freq" />
                        <input name="utilisateurs" className="border-b mx-2" type="number" placeholder="Utilisateurs" />
                        <input name="amis" className="border-b mx-2" type="number" placeholder="Amis" />
                        <input name="produits" className="border-b mx-2" type="number" placeholder="Produits" />
                        <input name="commandes" className="border-b mx-2" type="number" placeholder="Commandes" />
                        <div>
                            <Button type="submit" variant="contained">Insérer</Button>
                        </div>
                    </form>

                ))}
            </div>
        </>
    );
}

export default App;
