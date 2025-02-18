// hooks/useEmailAutocomplete.ts
import { useEffect, useState } from "react";
import { useGetEmails } from "../api/search";

export function useEmailAutocomplete(base: string, initialSearch = "") {
    const [emails, setEmails] = useState<string[]>([]);
    const [searchEmail, setSearchEmail] = useState<string>(initialSearch);

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
    }, [searchEmail, base]);

    return { emails, searchEmail, setSearchEmail };
}
