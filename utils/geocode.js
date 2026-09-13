const geocode = async (location, country) => {
    const query = `${location}, ${country}`;

    const url =
        `https://photon.komoot.io/api/` +
        `?q=${encodeURIComponent(query)}` +
        `&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "WanderlustCollegeProject/1.0"
            },
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error(`Location not found: ${query}`);
        }

        const coordinates = data.features[0].geometry.coordinates;

        return {
            longitude: Number(coordinates[0]),
            latitude: Number(coordinates[1])
        };

    } catch (error) {
        console.log("Geocoding Error:", error.message);
        throw new Error(`Unable to find location: ${query}`);
    }
};

module.exports = geocode;