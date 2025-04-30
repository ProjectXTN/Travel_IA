export const getCoordinatesFromPlaces = async (places) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const results = [];
    
    for (const place of places) {
        const query = place;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
            );
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                results.push({ name: place, lat: location.lat, lng: location.lng });
            } else {
                console.warn("No results found for:", query);
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
        }
    }

    return results;
};
