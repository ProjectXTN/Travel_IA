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

const TripPlannerFR = () => {
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
      body: JSON.stringify({ destination, days, interests, language: "FR" }), // Define o idioma fixo
    });

    const data = await response.json();
    setTripPlan(data.plan);
    setLoading(false);
  };

  return (
    <Container>
      <h2>Planifiez votre voyage</h2>

      {/* Botões para trocar de idioma */}
      <div style={{ marginBottom: "15px" }}>
        <Button onClick={() => navigate("/pt-br")}>🌎 Português</Button>
        <Button onClick={() => navigate("/fr")}>🇫🇷 Français</Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <div>
          <Label>Destination :</Label>
          <Input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Nombre de jours :</Label>
          <Input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Intérêts :</Label>
          <Input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Génération du plan en cours..." : "Générer un itinéraire"}
        </Button>
      </Form>

      {tripPlan && (
        <PlanContainer
          dangerouslySetInnerHTML={{
            __html: tripPlan
              .replace(/\n/g, "<br>")
              .replace(/\[Google Maps\]\((.*?)\)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">Google Maps</a>')
          }}
        />
      )}
    </Container>
  );
};

export default TripPlannerFR;
