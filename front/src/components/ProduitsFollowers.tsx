import { Autocomplete, Button, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useGetEmails } from "../api/search";
import { useProduitsFollowers } from "../api/request";
import { toast } from "react-toastify";

const ProduitsFollowers = (props: any) => {
    const { base } = props;
    const [emails, setEmails] = useState<string[]>([]);
    const [searchEmail, setSearchEmail] = useState<string>("");

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

    const handleSubmitProduitsFollowers = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const formObj = Object.fromEntries(formData.entries());

            if (!formObj.lvl || !searchEmail) {
                toast.error("Veuillez remplir tous les champs.");
                return;
            }
            
            const response = await useProduitsFollowers(base, searchEmail, formObj.lvl);
            if (response && response.data && response.duration) {
                toast.success("Données traité avec succès en: " + response.duration + "s");
            } else {
                toast.error("Une erreur lors de la recherche de données.");
            }
        },
        [searchEmail]
    );

    return (
        <form
            className="grid grid-cols-4 items-center"
            onSubmit={(e) => handleSubmitProduitsFollowers(e)}
        >
            {base}
            <Autocomplete
                disablePortal
                options={emails}
                value={searchEmail}
                onInputChange={(event, newInputValue) => {
                    setSearchEmail(newInputValue);
                }}
                renderInput={(params) => <TextField {...params} label="Email" />}
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

export default ProduitsFollowers;