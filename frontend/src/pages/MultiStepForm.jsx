import React, { useState } from "react";
import FormStep1 from "./FormStep1";
import FormStep2 from "./FormStep2";
import FormStep3 from "./FormStep3";
import FormStep4 from "./FormStep4";
import FormStep5 from "./FormStep5";
import FormStep6 from "./FormStep6";
import Result from "./Result";
import axios from "axios";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    status: "",
    electricity: "",
    address: "",
    coordinates: {},
  });

  const handleNext = (data) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    // Sauvegarde des données utilisateur dans la BDD
    axios
      .post("http://localhost:5000/api/users", updatedData)
      .then((response) => console.log("✅ Données sauvegardées :", response.data))
      .catch((error) => console.error("❌ Erreur lors de l'enregistrement :", error));

      setStep((prevStep) => prevStep + 1);
    };

  return (
    <div>
      {step === 1 && <FormStep1 onNext={handleNext} />}
      {step === 2 && <FormStep2 onNext={handleNext} onPrevious={() => setStep(step - 1)} />}
      {step === 3 && <FormStep3 onNext={handleNext} onPrevious={() => setStep(step - 1)} />}
      {step === 4 && <FormStep4 onNext={handleNext} onPrevious={() => setStep(step - 1)} />}
      {step === 5 && <FormStep5 onNext={handleNext} />} {/* 🔥 Plus de retour en arrière */}
      {step === 6 && <FormStep6 onComplete={() => setStep(7)} />} {/* 🔄 Simulation */}
      {step === 7 && <Result formData={formData} />} {/* 📊 Affichage du résultat */}
    </div>
  );
};

export default MultiStepForm;