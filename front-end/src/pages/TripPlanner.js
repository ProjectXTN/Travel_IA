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

const TripPlanner = () => {
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
            <h2>Planeje sua Viagem</h2>

            {/* Botões para trocar de idioma */}
            <ContainerButton>
              <Button onClick={() => navigate("/pt-br")}>🇧🇷 Português</Button>
              <Button onClick={() => navigate("/fr")}>🇫🇷 Français</Button>
              <Button onClick={() => navigate("/en")}>🇺🇸 English</Button>
            </ContainerButton>
            <ContainerForm>
              <Form onSubmit={handleSubmit}>
                <FormRow>
                  <Label>Destino:</Label>
                  <Input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Label>Dias:</Label>
                  <Input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Label>Interesses:</Label>
                  <Select
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    required
                  >
                    <option value="Férias">Férias</option>
                    <option value="Turismo">Turismo</option>
                    <option value="Culinária">Culinária</option>
                    <option value="Aventura">Aventura</option>
                    <option value="Cultura">Cultura</option>
                    <option value="Praia">Praia</option>
                    <option value="História">História</option>
                  </Select>
                </FormRow>

                <Button type="submit" disabled={loading}>
                  {loading ? "Gerando plano..." : "Gerar Plano"}
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
                  const encodedPlace = encodeURIComponent(place);
                  return `📍 <a href="https://pt.wikipedia.org/wiki/${encodedPlace}" target="_blank" rel="noopener noreferrer">${place}</a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodedPlace}" target="_blank" rel="noopener noreferrer">Endereço Google Maps</a>`;
                })
            }}
          />
        )}
        <Footer />
      </PageWrapper>
    </>
  );
};

export default TripPlanner;
