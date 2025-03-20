import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Para navegação
import {
  Container,
  Form,
  Label,
  Input,
  Button,
  PlanContainer
} from "../style/TripPlannerStyles";

const TripPlanner = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [interests, setInterests] = useState("");
  const [tripPlan, setTripPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Navegação para trocar de idioma

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/plan-trip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ destination, days, interests, language: "EN" }), // Define o idioma fixo
    });

    const data = await response.json();
    setTripPlan(data.plan);
    setLoading(false);
  };

  return (
    <Container>
      <h2>Plan your Trip</h2>

      {/* Botões para trocar de idioma */}
      <div style={{ marginBottom: "15px" }}>
        <Button onClick={() => navigate("/pt-br")}>🌎 Português</Button>
        <Button onClick={() => navigate("/fr")}>🇫🇷 Français</Button>
        <Button onClick={() => navigate("/en")}>🌎 English</Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <div>
          <Label>Destination:</Label>
          <Input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Days:</Label>
          <Input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </div>
        <div>
        <Label>Interests:</Label>
        <select
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            required
        >
            <option value="Vacation">Vacation</option>
            <option value="Tourism">Tourism</option>
            <option value="Cuisine">Cuisine</option>
            <option value="Adventure">Adventure</option>
            <option value="Culture">Culture</option>
            <option value="Beach">Beach</option>
            <option value="History">History</option>
        </select>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Generating plan..." : "Generate Plan"}
        </Button>
      </Form>

      {tripPlan && (
        <PlanContainer
          dangerouslySetInnerHTML={{
            __html: tripPlan
              .replace(/\n/g, "<br>")
              .replace(/\[Google Maps\]\((.*?)\)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">Endereço Google Maps</a>')
              .replace(/📍 \*\*(.*?)\*\*/g, (match, place) => {
                // Codificando o nome do local para ser usado nas URLs
                const encodedPlace = encodeURIComponent(place);
                // Retornando o nome do local como um link para a Wikipedia e o link para o Google Maps
                return `📍 <a href="https://pt.wikipedia.org/wiki/${encodedPlace}" target="_blank" rel="noopener noreferrer">${place}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodedPlace}" target="_blank" rel="noopener noreferrer">Google Maps Address</a>`;
              })                 
          }}
        />
      )}
    </Container>
  );
};

export default TripPlanner;
