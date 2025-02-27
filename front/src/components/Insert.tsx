import { Button, CircularProgress } from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useInsert } from "../api/insert";
import { useLocalStorage } from 'react-use';
import { GridColDef } from "@mui/x-data-grid";
import CustomDataGrid from "./CustomDataGrid";

const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 150 },
    { field: 'durationMariadb', headerName: 'Durée requête (MariaDB) (seconde)', width: 300 },
    { field: 'durationNeo4j', headerName: 'Durée equête (Neo4j) (seconde)', width: 300 }
];

const Insert = () => {
    const [records, setRecords] = useLocalStorage<any>("insert", []);
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setLoading(true);
            const formData = new FormData(e.currentTarget);
            const formObj = Object.fromEntries(formData.entries());
            if (
                !formObj.freq ||
                !formObj.utilisateurs ||
                !formObj.amis ||
                !formObj.produits ||
                !formObj.commandes
            ) {
                toast.error("Veuillez remplir tous les champs.");
                setLoading(false);
                return;
            }
            const data = {
                ...formObj,
                commitFreq: formObj.freq,
                nbUsers: formObj.utilisateurs,
                nbFollowers: formObj.amis,
                nbProduits: formObj.produits,
                nbCommandes: formObj.commandes,
            };

            const [responseMariadb, responseneo4j] = await useInsert(data);
        
            if (!responseMariadb || !responseneo4j) {
                toast.error("Une erreur lors de l'insertion des données.");
                setLoading(false);
                return;
            }

            if (records == null) setRecords([]);
            records.push({
                durationMariadb: responseMariadb.duration,
                durationNeo4j: responseneo4j.duration,
            });
            setRecords(records);

            toast.success("Données insérées avec succès!");
            setLoading(false);
        },
        [setRecords]
    );

    useEffect(() => {
        if (!records) return;
        setRows(records.map((record: any, index: number) => {
            return {
                id: index + 1,
                durationMariadb: record.durationMariadb,
                durationNeo4j: record.durationNeo4j,
            }
        }));
    }, [records]);

    return (
        <>
            <ToastContainer />
            <h1 className="text-3xl font-bold">Les insertions</h1>
            <div className="m-4">
                <form
                    className="grid grid-cols-7 items-center shadow-md p-4"
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <input
                        name="freq"
                        className="border-1 m-2 p-2"
                        type="number"
                        placeholder="Frequence commit"
                    />
                    <input
                        name="utilisateurs"
                        className="border-1 m-2 p-2"
                        type="number"
                        placeholder="Utilisateurs"
                    />
                    <input
                        name="amis"
                        className="border-1 m-2 p-2"
                        type="number"
                        placeholder="Amis"
                    />
                    <input
                        name="produits"
                        className="border-1 m-2 p-2"
                        type="number"
                        placeholder="Produits"
                    />
                    <input
                        name="commandes"
                        className="border-1 m-2 p-2"
                        type="number"
                        placeholder="Commandes"
                    />
                    <div>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Inserer"}
                        </Button>
                    </div>
                </form>
            </div>
            <div className="shadow-md m-4 p-4">
                <CustomDataGrid rows={rows} columns={columns} />
            </div>
        </>
    )
}

export default Insert;