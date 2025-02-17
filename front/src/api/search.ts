export const useGetEmails = async (base: string, email: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/${base}/email/${email}`, {
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

export const useGetProducts = async (base: string, product: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/${base}/product/${product}`, {
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