export const fetchTideData = async (latitude, longitude) => {
    const apiKey = import.meta.env.VITE_WORLD_TIDES_API_KEY;
    const url = `https://www.worldtides.info/api?extremes&lat=${latitude}&lon=${longitude}&days=1&key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching tide data:", error);
        throw error;
    }
};
