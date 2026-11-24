import { BrowserRouter, useLocation } from "react-router-dom";
import TripPlanner from "./pages/TripPlanner";

function PlannerRoute() {
  const { pathname } = useLocation();
  const language = { "/fr": "FR", "/en": "EN" }[pathname.replace(/\/$/, "").toLowerCase()] || "PT-BR";
  return <TripPlanner language={language} />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PlannerRoute />
    </BrowserRouter>
  );
}
