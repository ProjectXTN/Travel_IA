import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Para navegação
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  PageWrapper,
  ContainerForm,
  ContentWrapper,
  Container,
  Form,
  FormRow,
  Label,
  Input,
  Select,
  ContainerButton,
  Button,
  PlanContainer
} from "../style/styles";

const TripPlannerFR = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [interests, setInterests] = useState("");
  const [tripPlan, setTripPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const planRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/plan-trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          days,
          interests,
          language: "PT-BR",
        }),
      });

      const data = await response.json();
      setTripPlan(data.plan);
      setLoading(false);

      // Scrolling
      setTimeout(() => {
        planRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <PageWrapper>
        <ContentWrapper>
          <Container>
            <h2>Planifiez votre voyage</h2>

            {/* Botões para trocar de idioma */}
            <ContainerButton>
              <Button onClick={() => navigate("/pt-br")}>🇧🇷 Português</Button>
              <Button onClick={() => navigate("/fr")}>🇫🇷 Français</Button>
              <Button onClick={() => navigate("/en")}>🇺🇸 English</Button>
            </ContainerButton>
            <ContainerForm>
              <Form onSubmit={handleSubmit}>

                <FormRow>
                  <Label>Destination:</Label>
                  <Input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Label>Nombre de jours :</Label>
                  <Input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Label>Centres d'intérêt:</Label>
                  <Select
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    required
                  >
                    <option value="Vacances">Vacances</option>
                    <option value="Tourisme">Tourisme</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Aventure">Aventure</option>
                    <option value="Culture">Culture</option>
                    <option value="Plage">Plage</option>
                    <option value="Histoire">Histoire</option>
                  </Select>
                </FormRow>

                <Button type="submit" disabled={loading}>
                  {loading ? "Génération du plan en cours..." : "Générer un itinéraire"}
                </Button>
              </Form>
            </ContainerForm>

          </Container>
        </ContentWrapper>
        {tripPlan && (
          <PlanContainer
            ref={planRef}
            dangerouslySetInnerHTML={{
              __html: tripPlan
                .replace(/\n/g, "<br>")
                .replace(/\[Google Maps\]\((.*?)\)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">Endereço Google Maps</a>')
                .replace(/📍 \*\*(.*?)\*\*/g, (match, place) => {
                  // Codificando o nome do local para ser usado nas URLs
                  const encodedPlace = encodeURIComponent(place);
                  // Retornando o nome do local como um link para a Wikipedia e o link para o Google Maps
                  return `📍 <a href="https://pt.wikipedia.org/wiki/${encodedPlace}" target="_blank" rel="noopener noreferrer">${place}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodedPlace}" target="_blank" rel="noopener noreferrer">adresse Google Maps</a>`;
                })
            }}
          />
        )}
        <Footer />
      </PageWrapper>
    </>
  );
};

export default TripPlannerFR;
