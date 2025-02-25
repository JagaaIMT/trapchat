import { FormEvent, useCallback, useEffect, useState } from "react";
import { useEmailAutocomplete } from "../hooks/useEmailAutocomplete";
import { Produit, useProductAutocomplete } from "../hooks/useProductAutocomplete";
import { toast } from "react-toastify";
import EmailAutocomplete from "./EmailAutocomplete";
import { Autocomplete, Button, CircularProgress, TextField } from "@mui/material";
import { useProduitViral } from "../api/request";
import { GridColDef } from "@mui/x-data-grid";
import { useLocalStorage } from "react-use";
import CustomDataGrid from "./CustomDataGrid";

const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 150 },
    { field: 'lvlMariadb', headerName: 'Niveau (MariaDB)', width: 200 },
    { field: 'nbOrderMariadb', headerName: 'Nombre produits (MariaDB)', width: 200 },
    { field: 'durationMariadb', headerName: 'Duration (MariaDB) (seconde)', width: 200 },
    { field: 'lvlNoe4j', headerName: 'Niveau (Neo4j)', width: 200 },
    { field: 'nbOrderNoe4j', headerName: 'Nombre produits (Neo4j)', width: 200 },
    { field: 'durationNoe4j', headerName: 'Durée (Neo4j) (seconde)', width: 200 },
];

const ProduitViral = () => {
    const { emails, searchEmail, setSearchEmail } = useEmailAutocomplete("mariadb");

    const {
        produits: produitsNeo4j,
        setSearchProduct: setSearchProductNeo4j,
        selectedProduct: selectedProductNeo4j,
        setSelectedProduct: setSelectedProductNeo4j,
    } = useProductAutocomplete("neo4j");
    const {
        produits: produitsMariadb,
        selectedProduct: selectedProductMariadb,
        setSelectedProduct: setSelectedProductMariadb,
    } = useProductAutocomplete("mariadb");

    const [records, setRecords] = useLocalStorage<any>("ProduitFollowersByProduct", []);
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmitProduitViral = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setLoading(true);
            const formData = new FormData(e.currentTarget);
            const formObj = Object.fromEntries(formData.entries());

            if (!formObj.lvl || !searchEmail || !selectedProductNeo4j || !selectedProductMariadb) {
                toast.error("Veuillez remplir tous les champs.");
                setLoading(false);
                return;
            }

            const [responseMariadb, responseneo4j] = await Promise.all([
                useProduitViral(
                    "mariadb",
                    searchEmail,
                    formObj.lvl,
                    selectedProductMariadb.id
                ),
                useProduitViral(
                    "neo4j",
                    searchEmail,
                    formObj.lvl,
                    selectedProductNeo4j.id
                )
            ]);

            if (!responseMariadb || !responseneo4j) {
                toast.error("Une erreur est survenue lors de la recherche de données.");
                setLoading(false);
                return;
            }

            if (records == null) setRecords([]);
            records.push({
                lvlMariadb:  formObj.lvl,
                nbOrderMariadb: responseMariadb.data.slice(-1)[0].nbAcheteurs,
                durationMariadb: responseMariadb.duration,
                lvlNoe4j:  formObj.lvl,
                nbOrderNoe4j: responseneo4j.data.slice(-1)[0].nbAcheteurs,
                durationNoe4j: responseneo4j.duration,
            });
            setRecords(records);

            toast.success("Données traitées avec succès !");
            setLoading(false);
        },
        [searchEmail, selectedProductNeo4j, selectedProductMariadb]
    );

    useEffect(() => {
        if (!records) return;
        setRows(records.map((record: any, index: number) => {
            return {
                id: index + 1,
                lvlMariadb: record.lvlMariadb,
                nbOrderMariadb: record.nbOrderMariadb,
                durationMariadb: record.durationMariadb,
                lvlNoe4j: record.lvlNoe4j,
                nbOrderNoe4j: record.nbOrderNoe4j,
                durationNoe4j: record.durationNoe4j
            }
        }));
    }, [records]);
      
    useEffect(() => {
        if (selectedProductNeo4j && produitsMariadb.length > 0) {
            const corresponding = produitsMariadb.find((p: Produit) => p.nom === selectedProductNeo4j.nom);
            if (corresponding && (!selectedProductMariadb || selectedProductMariadb.id !== corresponding.id)) {
                setSelectedProductMariadb(corresponding);
            }
        }
    }, [selectedProductNeo4j, produitsMariadb, selectedProductMariadb, setSelectedProductMariadb]);

    return (
        <>
            <div className="m-4">
                <form
                    className="grid grid-cols-5 items-center shadow-md p-4"
                    onSubmit={handleSubmitProduitViral}
                >
                    <EmailAutocomplete
                        emails={emails}
                        searchEmail={searchEmail}
                        onChange={(_, newInputValue) => setSearchEmail(newInputValue)}
                    />
                    <Autocomplete
                        disablePortal
                        options={produitsNeo4j}
                        getOptionLabel={(option: Produit) => option.nom}
                        isOptionEqualToValue={(option: Produit, value: Produit) => option.id === value.id}
                        value={selectedProductNeo4j}
                        onChange={(_, newValue) => setSelectedProductNeo4j(newValue)}
                        onInputChange={(_, newInputValue) => setSearchProductNeo4j(newInputValue)}
                        renderInput={(params) => <TextField {...params} label="Produit" />}
                    />
                    <Autocomplete
                        disablePortal
                        options={produitsMariadb}
                        getOptionLabel={(option: Produit) => option.nom}
                        isOptionEqualToValue={(option: Produit, value: Produit) => option.id === value.id}
                        value={selectedProductMariadb}
                        renderInput={(params) => <TextField {...params} label="Produit" />}
                        hidden={true}
                    />
                    <input
                        name="lvl"
                        className="border-b mx-2"
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
}

export default ProduitViral;