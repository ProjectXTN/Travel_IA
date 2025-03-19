import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TripPlanner from "./components/TripPlanner"; // PT-BR
import TripPlannerFR from "./components/TripPlannerFR"; // FR

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/pt-br" element={<TripPlanner />} />
        <Route path="/fr" element={<TripPlannerFR />} />
        {/* Rota padrão redireciona para Português */}
        <Route path="*" element={<TripPlanner />} />
      </Routes>
    </Router>
  );
}

export default App;
