import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getLanguageFromPath } from "../services/languageService";
import { handlePlanTrip } from "../services/planTripService";
import { exportPDF } from "../services/pdfService";
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
  const [interests, setInterests] = useState("");
  const [tripPlan, setTripPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [daysError, setDaysError] = useState(false);
  const planRef = useRef(null);
  const location = useLocation();
  const language = getLanguageFromPath(location.pathname);
  const navigate = useNavigate();


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!days || parseInt(days) < 1) {
      setDaysError(true);
      return;
    }

    setDaysError(false);

    handlePlanTrip({
      destination,
      days,
      interests,
      language,
      setTripPlan,
      setLoading,
      planRef,
      event: e,
    });
  };

  return (
    <>
      <PageWrapper>
        <ContentWrapper>
          <Container>
            <Title>
              <h1>Plan your Trip</h1>
            </Title>
            <ContainerGeneral>

              <ContainerButton>
                <Button onClick={() => navigate("/pt-br")} disabled={loading} variant="secondary">🇧🇷 Português</Button>
                <Button onClick={() => navigate("/fr")} disabled={loading} variant="secondary">🇫🇷 Français</Button>
                <Button onClick={() => navigate("/en")} disabled={loading} variant="secondary">🇺🇸 English</Button>
              </ContainerButton>
              <ContainerForm>
                <Form onSubmit={handleSubmit}>

                  <FormRow>
                    <Label>Destination:</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Paris"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </FormRow>

                  <FormRow>
                    <Label>Days:</Label>
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
                          The number of days must be at least 1.
                        </ErrorMessage>
                      )}
                    </InputWrapper>
                  </FormRow>


                  <FormRow variant="secondary">
                    <Label>Interests:</Label>
                    <CheckboxGroup>
                      {[
                        "Vacation",
                        "Tourism",
                        "Cuisine",
                        "Adventure",
                        "Culture",
                        "Beach",
                        "History",
                        "Parks",
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
                  </FormRow>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="loader" /> Generating plan...
                      </>
                    ) : (
                      "Generate Plan"
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
                  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                  .replace(/\[Google Maps\]\((.*?)\)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">Endereço Google Maps</a>')
                  .replace(/📍 \*\*(.*?)\*\*/g, (match, place) => {
                    const encodedPlace = encodeURIComponent(place);
                    return `📍 <a href="https://pt.wikipedia.org/wiki/${encodedPlace}" target="_blank" rel="noopener noreferrer"><strong>${place}</strong></a> - <a href="https://www.google.com/maps/search/?api=1&query=${encodedPlace}" target="_blank" rel="noopener noreferrer">>Google Maps Address</a>`;
                  })
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              }}
            />

            <ContainerButton>
              <Button onClick={() => exportPDF(
                "trip-plan",
                `my-itinerary-${destination.toLowerCase().replace(/\s+/g, "-")}-${days}days.pdf`
              )}>
                📄 Download Itinerary as PDF
              </Button>
            </ContainerButton>
          </>
        )}
        <Footer />
      </PageWrapper>
    </>
  );
};

export default TripPlanner;
