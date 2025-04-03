import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TripPlanner from "./pages/TripPlanner"; // PT-BR
import TripPlannerFR from "./pages/TripPlannerFR"; // FR
import TripPlannerEN from "./pages/TripPlannerEN"; // EN
import GlobalStyle from "./style/GlobalStyle";

function App() {
  return (
    <>
      <GlobalStyle />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/pt-br" element={<TripPlanner />} />
          <Route path="/fr" element={<TripPlannerFR />} />
          <Route path="/en" element={<TripPlannerEN />} />

          <Route path="*" element={<TripPlanner />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
