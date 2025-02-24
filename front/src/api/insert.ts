export const useInsert = async (data: any) => {
    try {
        const response = await fetch(`http://localhost:3000/api/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        const jsonResponse = await response.json();
        return jsonResponse;
    }
    catch (error) {
        return;
    }
};