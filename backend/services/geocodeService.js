async function getCoordinatesFromPlaces(places) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const results = [];
  const signal = AbortSignal.timeout(15000);
  for (const place of new Set(places)) {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.search = new URLSearchParams({ address: place, key: apiKey });
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error("Geocoding unavailable");
    const data = await response.json();
    if (data.status === "ZERO_RESULTS") continue;
    const location = data.results?.[0]?.geometry?.location;
    if (data.status !== "OK" || !location) throw new Error("Geocoding unavailable");
    results.push({ name: place, lat: location.lat, lng: location.lng });
  }
  return results;
}

module.exports = { getCoordinatesFromPlaces };
