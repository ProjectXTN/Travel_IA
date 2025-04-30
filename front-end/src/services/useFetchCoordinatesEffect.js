// services/useFetchCoordinatesEffect.js
import { useEffect } from "react";
import { extractPlacesService } from "./extractPlacesService";
import { fetchCoordinates } from "./fetchCoordinatesService";

export const useFetchCoordinatesEffect = (tripPlan, setMapPoints) => {
  useEffect(() => {
    if (!tripPlan) return;

    const places = extractPlacesService(tripPlan);
    console.log("📍 Extracted places:", places);

    if (places.length > 0) {
      fetchCoordinates(places).then((coords) => {
        console.log("📍 Coordinates received:", coords);
        setMapPoints(coords);
      });
    }
  }, [tripPlan]);
};
