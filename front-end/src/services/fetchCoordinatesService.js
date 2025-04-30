export const fetchCoordinates = async (places) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/geocode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ places }),
      });
  
      const data = await response.json();
  
      if (data.coordinates) {
        return data.coordinates;
      } else {
        console.warn("Erro ao buscar coordenadas:", data.error);
        return [];
      }
    } catch (error) {
      console.error("Erro na requisição de coordenadas:", error);
      return [];
    }
  };
  