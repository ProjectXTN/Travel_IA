import React, { useState } from "react";
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
  const [language, setLanguage] = useState("PT-BR");
  const [tripPlan, setTripPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/plan-trip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ destination, days, interests, language }),
    });

    const data = await response.json();
    setTripPlan(data.plan);
    setLoading(false);
  };

  return (
    <Container>
      <h2>Planeje sua Viagem</h2>
      <Form onSubmit={handleSubmit}>
        <div>
          <Label>Destino:</Label>
          <Input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Dias:</Label>
          <Input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Interesses:</Label>
          <Input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Idioma:</Label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="PT-BR">Português</option>
            <option value="EN">English</option>
            <option value="FR">Françes</option>
          </select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Gerando plano..." : "Gerar Plano"}
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

export default TripPlanner;