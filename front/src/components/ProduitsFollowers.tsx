// ProduitsFollowers.tsx
import { Button } from "@mui/material";
import { FormEvent, useCallback } from "react";
import { toast } from "react-toastify";
import { useEmailAutocomplete } from "../hooks/useEmailAutocomplete";
import EmailAutocomplete from "../components/EmailAutocomplete";
import { useProduitsFollowers } from "../api/request";

interface ProduitsFollowersProps {
    base: string;
}

const ProduitsFollowers = ({ base }: ProduitsFollowersProps) => {
    const { emails, searchEmail, setSearchEmail } = useEmailAutocomplete(base);

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
                toast.success("Données traitées avec succès en: " + response.duration + "s");
            } else {
                toast.error("Une erreur est survenue lors de la recherche de données.");
            }
        },
        [searchEmail, base]
    );

    return (
        <form
            className="grid grid-cols-4 items-center"
            onSubmit={handleSubmitProduitsFollowers}
        >
            {base}
            <EmailAutocomplete
                emails={emails}
                searchEmail={searchEmail}
                onChange={(event, newInputValue) => setSearchEmail(newInputValue)}
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
};

export default ProduitsFollowers;
