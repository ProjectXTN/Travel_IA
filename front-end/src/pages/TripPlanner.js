import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getLanguageFromPath } from "../services/languageService";
import { exportPDF } from "../services/pdfService";
import { submitTripPlan } from "../services/tripPlannerSubmitService";
import { useFetchCoordinatesEffect } from "../services/useFetchCoordinatesEffect";
import InterestCheckbox from "../components/InterestCheckbox";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  PageWrapper,
  ContainerGeneral,
  ContainerForm,
  ContentWrapper,
  Container,
  Title,
  Form,
  FormRow,
  Label,
  Input,
  InputWrapper,
  ErrorMessage,
  CheckboxGroup,
  ContainerButton,
  Button,
  PlanContainer
} from "../style/styles";

const TripPlanner = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [interests, setInterests] = useState([]);
  const [tripPlan, setTripPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [customInterest, setCustomInterest] = useState("");
  const [mapPoints, setMapPoints] = useState([]);
  const [daysError, setDaysError] = useState(false);
  const planRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const language = getLanguageFromPath(location.pathname);

  const handleSubmit = (e) => {
    submitTripPlan({
      e,
      days,
      interests,
      customInterest,
      setDaysError,
      setCustomInterest,
      destination,
      language,
      setTripPlan,
      setLoading,
      planRef,
    });
  };

  useFetchCoordinatesEffect(tripPlan, setMapPoints);

  return (
    <>
      <PageWrapper>
        <ContentWrapper>
          <Container>
          <Header loading={loading} title="Planeje sua Viagem" />
            <ContainerGeneral>
              <ContainerForm>
                <Form onSubmit={handleSubmit}>
                  <FormRow>
                    <Label>Destino:</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Paris"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </FormRow>

                  <FormRow>
                    <Label>Dias:</Label>
                    <InputWrapper>
                      <Input
                        type="number"
                        placeholder="Ex: 5"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        min="1"
                        $error={daysError}
                      />
                      {daysError && (
                        <ErrorMessage>
                          O número de dias deve ser no mínimo 1.
                        </ErrorMessage>
                      )}
                    </InputWrapper>
                  </FormRow>

                  <FormRow $variant="secondary">
                    <Label>Interesses:</Label>
                    <CheckboxGroup>
                      {[
                        "Férias",
                        "Turismo",
                        "Culinária",
                        "Aventura",
                        "Cultura",
                        "Praia",
                        "História",
                        "Parques"
                      ]
                        .sort((a, b) => a.localeCompare(b))
                        .map((interest) => (
                          <InterestCheckbox
                            key={interest}
                            interest={interest}
                            checked={interests.includes(interest)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInterests([...interests, interest]);
                              } else {
                                setInterests(interests.filter((i) => i !== interest));
                              }
                            }}
                          />
                        ))}
                    </CheckboxGroup>
                    <InputWrapper style={{ marginTop: "10px" }}>
                      <Input
                        type="text"
                        placeholder="Adicionar interesse personalizado"
                        value={customInterest}
                        onChange={(e) => setCustomInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            customInterest.trim() !== ""
                          ) {
                            const cleaned = customInterest.trim();
                            if (!interests.includes(cleaned)) {
                              setInterests([...interests, cleaned]);
                            }
                            setCustomInterest("");
                            e.preventDefault();
                          }
                        }}
                      />
                    </InputWrapper>
                  </FormRow>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="loader" /> Gerando plano...
                      </>
                    ) : (
                      "Gerar Plano"
                    )}
                  </Button>
                </Form>
              </ContainerForm>
            </ContainerGeneral>

          </Container>
        </ContentWrapper>
        {tripPlan && (
          <>
            <PlanContainer
              id="trip-plan"
              ref={planRef}
              dangerouslySetInnerHTML={{
                __html: tripPlan
                  .replace(/\n/g, "<br>")
                  // 🆕 Transforma links do tipo [Texto](URL) em <a href="URL">Texto</a>
                  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                  // Substitui o [Google Maps](url) por um link com texto fixo
                  .replace(/\[Google Maps\]\((.*?)\)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">Endereço Google Maps</a>')
                  // Substitui locais com 📍 **Lugar** pelo link do Wikipedia + Google Maps
                  .replace(/📍 \*\*(.*?)\*\*/g, (match, place) => {
                    const encodedPlace = encodeURIComponent(place);
                    return `📍 <a href="https://pt.wikipedia.org/wiki/${encodedPlace}" target="_blank" rel="noopener noreferrer"><strong>${place}</strong></a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodedPlace}" target="_blank" rel="noopener noreferrer">Endereço Google Maps</a>`;
                  })
                  // Aplica negrito em **Texto**
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              }}
            />

            <ContainerButton $variant="secondary">
              <Button
                onClick={() =>
                  exportPDF(
                    "trip-plan",
                    `meu-roteiro-${destination.toLowerCase().replace(/\s+/g, "-")}-${days}dias.pdf`
                  )
                }
              >
                📄 Baixar Roteiro em PDF
              </Button>
            </ContainerButton>
          </>
        )}
      </PageWrapper>
      <Footer />
    </>
  );
};

export default TripPlanner;
