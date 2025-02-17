export const useGetEmails = async (name: string, email: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/${name}/email/${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const jsonResponse = await response.json();
        return jsonResponse;
    }
    catch (error) {
        return;
    }
};