import { useEffect, useState } from "react";
import { Card, CardContent } from "@mui/material";
import { Typography, CircularProgress, Box, Button } from "@mui/material";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const ELECTRICITY_PRICE = 0.2016;
const GRID_SELL_PRICE = 0.1269;
const SELF_CONSUMPTION_RATE = 0.6;
const YEARS = 25;
const EFFICIENCY_DEPRECIATION = 0.995;

const Result = () => {
  const [projectData, setProjectData] = useState(null);
  const [solarData, setSolarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWithSell, setShowWithSell] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    if (!sessionId) {
      setError("❌ Aucun sessionId trouvé.");
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${sessionId}/project`
        );
        console.log("Réponse API projet :", response.data);
        setProjectData(response.data);
      } catch (err) {
        setError("Erreur lors de la récupération des infos du projet.");
      }
    };

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${sessionId}/solar-estimate`
        );

        if (!response.data || response.data.length === 0) {
          setError("Aucune simulation trouvée.");
          setLoading(false);
          return;
        }

        const sortedData = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setSolarData(sortedData[0]);
      } catch (err) {
        setError("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
    fetchData();
  }, [sessionId]);

  if (loading) return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!solarData) return <Typography color="error">Aucune donnée trouvée.</Typography>;

  const {
    monthlyProduction = [],
    firstYearSavingsWithSell = 0,
    firstYearSavingsWithoutSell = 0,
    installationCost = 0,
  } = solarData;

  const moisNoms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  const monthlyProductionData = monthlyProduction.map((item) => ({
    mois: moisNoms[item.mois - 1] ?? `Mois ${item.mois}`,
    adjustedEnergyKwh: item.adjustedEnergyKwh?.toFixed(2) ?? 0,
  }));

  const monthlySavingsData = monthlyProduction.map((item) => ({
    mois: moisNoms[item.mois - 1] ?? `Mois ${item.mois}`,
    selfConsumptionSavings: (item.adjustedEnergyKwh * SELF_CONSUMPTION_RATE * ELECTRICITY_PRICE).toFixed(2),
    gridSellSavings: showWithSell
      ? (item.adjustedEnergyKwh * (1 - SELF_CONSUMPTION_RATE) * GRID_SELL_PRICE).toFixed(2)
      : 0,
    totalSavings: (
      item.adjustedEnergyKwh * SELF_CONSUMPTION_RATE * ELECTRICITY_PRICE +
      (showWithSell ? item.adjustedEnergyKwh * (1 - SELF_CONSUMPTION_RATE) * GRID_SELL_PRICE : 0)
    ).toFixed(2),
  }));

  let cumulativeSavings = 0;
  const profitabilityData = Array.from({ length: YEARS }, (_, i) => {
    const year = i + 1;
    const baseSavings = showWithSell ? firstYearSavingsWithSell : firstYearSavingsWithoutSell;
    cumulativeSavings += baseSavings * Math.pow(EFFICIENCY_DEPRECIATION, year - 1);
    return {
      year: `N${year}`,
      savings: Math.round(cumulativeSavings),
      installationCost: Math.round(installationCost),
    };
  });

  const maxSavings = Math.max(...profitabilityData.map((d) => d.savings));
  const getFilteredProfitabilityData = () => {
    const step = isMobile ? 3 : 1;
    return profitabilityData.filter((_, index) => index % step === 0);
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", textAlign: "center", bgcolor: "#FFFFFF", p: 3, overflowX: "hidden" }}>
      {error && <Typography color="error">{error}</Typography>}

      {projectData && (
        <Card sx={{ mb: 3, textAlign: "left", p: 2, bgcolor: "#f5f5f5" }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold">🏡 Votre projet</Typography>
            <Typography variant="body1"><strong>Adresse :</strong> {projectData.address}</Typography>
            <Typography variant="body1"><strong>Orientation de la toiture :</strong> {projectData.roofOrientation} ({solarData.roofTilt}°)</Typography>
            <Typography variant="body1"><strong>Puissance recommandée :</strong> {solarData.installationSizeKw} kWc</Typography>
          </CardContent>
        </Card>
      )}

      <Typography variant="h4" fontWeight="bold" color="black" mb={2}>🌞 Résultat de votre simulation</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setShowWithSell(!showWithSell)}>
        {showWithSell ? "Afficher sans revente" : "Afficher avec revente"}
      </Button>

      {/* Graphiques */}
      <ResponsiveContainer width="98%" height={350}>
        <LineChart data={getFilteredProfitabilityData()} margin={{ right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis domain={[0, maxSavings]} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="savings" stroke="#008000" strokeWidth={3} />
          <Line type="monotone" dataKey="installationCost" stroke="#0000FF" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>

      {/* Production mensuelle */}
      <ResponsiveContainer width="98%" height={300}>
        <BarChart data={monthlyProductionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="adjustedEnergyKwh" fill="#FFA500" name="Production (kWh)" />
        </BarChart>
      </ResponsiveContainer>

      {/* Économies mensuelles */}
      <ResponsiveContainer width="98%" height={300}>
        <BarChart data={monthlySavingsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalSavings" fill="#008000" name="Économies (€)" />
        </BarChart>
      </ResponsiveContainer>

    </Box>
  );
};

export default Result;
