import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import MultiStepForm from "./pages/MultiStepForm";
import Result from "./pages/Result";

const GOOGLE_MAPS_API_KEY = "*******************";

const libraries = ["places"];

function App() {
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <Router>
        <Routes>
          <Route path="/" element={<MultiStepForm />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </Router>
    </LoadScript>
  );
}

export default App;
