export const handlePlanTrip = async ({
  destination,
  days,
  interests,
  language = "PT-BR",
  setTripPlan,
  setLoading,
  planRef,
  event,
}) => {
  event.preventDefault();
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
        interests: Array.isArray(interests) ? interests.join(", ") : interests,
        language
      }),
    });

    const data = await response.json();
    setTripPlan(data.plan);
    setLoading(false);

    // Scroll até o plano
    setTimeout(() => {
      planRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    setLoading(false);
  }
};
