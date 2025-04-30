// services/tripPlannerSubmitService.js
import { handlePlanTrip } from "./planTripService";

export const submitTripPlan = async ({
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
}) => {
  e.preventDefault();

  if (!days || parseInt(days) < 1) {
    setDaysError(true);
    return;
  }

  setDaysError(false);

  let allInterests = [...interests];
  if (customInterest.trim() !== "") {
    const cleaned = customInterest.trim();
    if (!allInterests.includes(cleaned)) {
      allInterests.push(cleaned);
    }
    setCustomInterest("");
  }

  await handlePlanTrip({
    destination,
    days,
    interests: allInterests,
    language,
    setTripPlan,
    setLoading,
    planRef,
    event: e,
  });
};
