// components/EmailAutocomplete.tsx
import { Autocomplete, TextField } from "@mui/material";
import { FC } from "react";

interface EmailAutocompleteProps {
    emails: string[];
    searchEmail: string;
    onChange: (event: React.SyntheticEvent, newInputValue: string) => void;
}

const EmailAutocomplete: FC<EmailAutocompleteProps> = ({ emails, searchEmail, onChange }) => (
    <Autocomplete
        disablePortal
        options={emails}
        value={searchEmail}
        onInputChange={onChange}
        renderInput={(params) => <TextField {...params} label="Email" />}
    />
);

export default EmailAutocomplete;
