import { Button } from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useInsert } from "../api/insert";
import { useLocalStorage } from 'react-use';
import { GridColDef } from "@mui/x-data-grid";
import CustomDataGrid from "./CustomDataGrid";

export interface InsertRecord {
    timestamp: string;
    duration: number;
}

export interface InsertRecords {
    [key: string]: InsertRecord[];
}

const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 150 },
    { field: 'duration', headerName: 'Duration (seconde)', width: 150 }
];


const Insert = (props: any) => {
    const { base } = props;
    const [records, setRecords] = useLocalStorage<InsertRecords>("insert", {
        mariadb: [],
        neo4j: [],
    });
    const [rows, setRows] = useState<any[]>([]);
    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>, name: string) => {
            e.preventDefault();

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

            const response = await useInsert(name, data);
            if (response && response.message && response.duration) {
                let insertData;
                if (records && records[name]) {
                    insertData = records[name].push({ timestamp: 'frrf', duration: response.duration  });

                } else {
                    insertData = { mariadb: [], neo4j: [] };
                }
                setRecords(records);

                toast.success("Données insérées avec succès en: " + response.duration + "s");
            } else {
                toast.error("Une erreur lors de l'insertion des données.");
            }
        },
        [setRecords]
    );

    useEffect(() => {
        if (!records || !records[base])  return;
        setRows(records[base].map((record, index) => {
            return {
                id: index + 1,
                duration: record.duration,
            }
        }));
        console.log("Records mis à jour :", records);
    }, [records]);

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
            <div>
                <CustomDataGrid rows={rows} columns={columns}/>
            </div>
        </>
    )
}

export default Insert;