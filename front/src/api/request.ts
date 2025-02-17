export const useProduitsFollowers = async (base: string, email: string, lvl: any) => {
    try {
        const response = await fetch(`http://localhost:3000/api/${base}/products-followers/${email}/${lvl}`, 
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const jsonResponse = await response.json();
        return jsonResponse;
    }
    catch (error) {
        console.error("useProduitsFollowers", error);
        return;
    }
}