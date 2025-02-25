// ProduitFollowersByProduct.tsx
import { Autocomplete, Button, CircularProgress, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useEmailAutocomplete } from "../hooks/useEmailAutocomplete";
import { useProductAutocomplete, Produit } from "../hooks/useProductAutocomplete";
import { useProduitFollowersByProduct } from "../api/request";
import EmailAutocomplete from "../components/EmailAutocomplete";
import { GridColDef } from "@mui/x-data-grid";
import { useLocalStorage } from "react-use";
import CustomDataGrid from "./CustomDataGrid";

const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 150 },
    { field: 'lstProductMariadb', headerName: 'Liste produits (MariaDB)', width: 200 },
    { field: 'nbrProductMariadb', headerName: 'Nombre produits (MariaDB)', width: 200 },
    { field: 'durationMariadb', headerName: 'Durée (MariaDB) (seconde)', width: 200 },
    { field: 'lstProductNeo4j', headerName: 'Liste produits (Neo4j)', width: 200 },
    { field: 'nbrPproductNeo4j', headerName: 'Nombre produit (Neo4j)', width: 200 },
    { field: 'durationNeo4j', headerName: 'Durée (Neo4j) (seconde)', width: 200 }
];
const ProduitFollowersByProduct = () => {
    const { emails, searchEmail, setSearchEmail } = useEmailAutocomplete("mariadb"); // Je prends mariadb arbitrairement car les deux bdd ont les mêmes données
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

    const handleSubmitProduitFollowersByProduct = useCallback(
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
                useProduitFollowersByProduct(
                    "mariadb",
                    searchEmail,
                    formObj.lvl,
                    selectedProductMariadb.id
                ),
                useProduitFollowersByProduct(
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
        [searchEmail, selectedProductNeo4j, selectedProductMariadb]
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

    useEffect(() => {
        if (selectedProductNeo4j && produitsMariadb.length > 0) {
            // On recherche le produit par nom dans la liste mariadb
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
                    onSubmit={handleSubmitProduitFollowersByProduct}
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

export default ProduitFollowersByProduct;
