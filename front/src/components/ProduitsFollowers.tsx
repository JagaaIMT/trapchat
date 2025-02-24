// ProduitsFollowers.tsx
import { Button, CircularProgress } from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useEmailAutocomplete } from "../hooks/useEmailAutocomplete";
import EmailAutocomplete from "../components/EmailAutocomplete";
import { useProduitsFollowers } from "../api/request";
import CustomDataGrid from "./CustomDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { useLocalStorage } from "react-use";

const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 150 },
    { field: 'lstProductMariadb', headerName: 'Liste produits (MariaDB)', width: 200 },
    { field: 'nbrProductMariadb', headerName: 'Nombre produits (MariaDB)', width: 200 },
    { field: 'durationMariadb', headerName: 'Durée (MariaDB) (seconde)', width: 200 },
    { field: 'lstProductNeo4j', headerName: 'Liste produits (Neo4j)', width: 200 },
    { field: 'nbrPproductNeo4j', headerName: 'Nombre produits (Neo4j)', width: 200 },
    { field: 'durationNeo4j', headerName: 'Durée (Neo4j) (seconde)', width: 200 }
];

const ProduitsFollowers = () => {
    const { emails, searchEmail, setSearchEmail } = useEmailAutocomplete("mariadb"); // Je prends mariadb arbitrairement car les deux bdd ont les mêmes données
    const [records, setRecords] = useLocalStorage<any>("PoduitsFollowers", []);
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmitProduitsFollowers = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setLoading(true);
            const formData = new FormData(e.currentTarget);
            const formObj = Object.fromEntries(formData.entries());

            if (!formObj.lvl || !searchEmail) {
                toast.error("Veuillez remplir tous les champs.");
                setLoading(false);
                return;
            }

            const [responseMariadb, responseneo4j] = await Promise.all([
                useProduitsFollowers("mariadb", searchEmail, formObj.lvl),
                useProduitsFollowers("neo4j", searchEmail, formObj.lvl)
            ]);

            if (!responseMariadb || !responseneo4j) {
                toast.error("Une erreur lors du traitement des données.");
                setLoading(false);
                return;
            }

            if (records == null) setRecords([]);
            records.push({
                lstProductMariadb: Array.from(new Set(responseMariadb.data.map((item: any) => item.produit))),
                nbrProductMariadb: responseMariadb.data.reduce((sum: any, item: any) => sum + Number(item.nbCommandes || 0), 0),
                durationMariadb: responseMariadb.duration,
                lstProductNeo4j: Array.from(new Set(responseneo4j.data.map((item: any) => item.produit))),
                nbrPproductNeo4j: responseneo4j.data.reduce((sum: any, item: any) => sum + Number(item.nbCommandes || 0), 0),
                durationNeo4j: responseneo4j.duration,
            });
            setRecords(records);
            toast.success("Données traitées avec succès !");
            setLoading(false);
        },
        [searchEmail]
    );

    useEffect(() => {
        if (!records) return;
        setRows(records.map((record: any, index: number) => {
            return {
                id: index + 1,
                lstProductMariadb: record.lstProductMariadb,
                nbrProductMariadb: record.nbrProductMariadb,
                durationMariadb: record.durationMariadb,
                lstProductNeo4j: record.lstProductNeo4j,
                nbrPproductNeo4j: record.nbrPproductNeo4j,
                durationNeo4j: record.durationNeo4j
            }
        }));
    }, [records]);

    return (
        <>
            <div className="m-4">
                <form
                    className="grid grid-cols-4 items-center shadow-md p-4"
                    onSubmit={handleSubmitProduitsFollowers}
                >
                    <EmailAutocomplete
                        emails={emails}
                        searchEmail={searchEmail}
                        onChange={(event, newInputValue) => setSearchEmail(newInputValue)}
                    />
                    <input
                        name="lvl"
                        className="border-1 m-2 p-2"
                        type="number"
                        placeholder="Niveau"
                    />
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Rechercher"}
                    </Button>
                </form>
            </div>
            <div className="shadow-md m-4 p-4">
                <CustomDataGrid rows={rows} columns={columns} />
            </div>
        </>
    );
};

export default ProduitsFollowers;
