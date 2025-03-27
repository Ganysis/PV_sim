import { useEffect, useState } from "react";
import { Card, CardContent, Typography, CircularProgress, Box, Button, Grid, Paper, Divider, Stack, Tooltip, IconButton } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SavingsIcon from '@mui/icons-material/Savings';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DownloadIcon from '@mui/icons-material/Download';
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
  Label
} from "recharts";

const ELECTRICITY_PRICE = 0.2016;
const GRID_SELL_PRICE = 0.1269;
const SELF_CONSUMPTION_RATE = 0.6;
const YEARS = 25;
const EFFICIENCY_DEPRECIATION = 0.995;
const ELECTRICITY_PRICE_INCREASE = 0.022; // 2.2% d'augmentation annuelle

const Result = () => {
  const [projectData, setProjectData] = useState(null);
  const [solarData, setSolarData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWithSell, setShowWithSell] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState("overview");
  const [panelCoordinates, setPanelCoordinates] = useState(null);


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

    const fetchData = async () => {
      try {
        // Récupération des infos utilisateur
        const userResponse = await axios.get(`http://localhost:5000/api/users/${sessionId}`);
        setUserData(userResponse.data);
        
        // Récupération des infos projet
        const projectResponse = await axios.get(
          `http://localhost:5000/api/users/${sessionId}/project`
        );
        setProjectData(projectResponse.data);
        
        // Récupération des estimations solaires
        const solarResponse = await axios.get(
          `http://localhost:5000/api/solar/users/${sessionId}/solar-estimate`
        );

        if (!solarResponse.data) {
          setError("Aucune simulation trouvée.");
          setLoading(false);
          return;
        }

        setSolarData(solarResponse.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
      <Typography variant="h6" ml={2}>Chargement de vos résultats...</Typography>
    </Box>
  );
  
  if (error) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="error" gutterBottom>{error}</Typography>
      <Button variant="contained" onClick={() => window.location.href = "/"}>
        Retour à l'accueil
      </Button>
    </Box>
  );
  
  if (!solarData) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="error">Aucune donnée trouvée.</Typography>
      <Button variant="contained" onClick={() => window.location.href = "/"} sx={{ mt: 2 }}>
        Retour à l'accueil
      </Button>
    </Box>
  );

  const {
    monthlyProduction = [],
    firstYearSavingsWithSell = 0,
    firstYearSavingsWithoutSell = 0,
    installationCost = 0,
    installationSizeKw = 0,
    panelsCount = 0,
    yearlyEnergyAcKwh = 0,
    roofOrientation = "",
    roofTilt = 0,
    paybackYears = 0,
    savingsLifetimeWithSell = 0,
    savingsLifetimeWithoutSell = 0,
    solarPercentage = 0
  } = solarData;

  // Calcul du retour sur investissement actualisé
  const calculateROI = () => {
    let roi = -installationCost;
    let savings = showWithSell ? firstYearSavingsWithSell : firstYearSavingsWithoutSell;
    
    for (let i = 0; i < YEARS; i++) {
      const yearSavings = savings * Math.pow(EFFICIENCY_DEPRECIATION, i) * Math.pow(1 + ELECTRICITY_PRICE_INCREASE, i);
      roi += yearSavings / Math.pow(1.04, i); // Taux d'actualisation de 4%
    }
    
    return roi;
  };

  const roi = calculateROI();
  const roiPercentage = (roi / installationCost) * 100;

  // Formatage des noms de mois
  const moisNoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const monthlyProductionData = monthlyProduction.map((item) => ({
    mois: moisNoms[item.mois - 1] ?? `Mois ${item.mois}`,
    production: parseFloat(item.adjustedEnergyKwh?.toFixed(0)) ?? 0,
  }));

  const monthlySavingsData = monthlyProduction.map((item) => {
    const selfConsumptionSavings = parseFloat((item.adjustedEnergyKwh * SELF_CONSUMPTION_RATE * ELECTRICITY_PRICE).toFixed(2));
    const gridSellSavings = showWithSell 
      ? parseFloat((item.adjustedEnergyKwh * (1 - SELF_CONSUMPTION_RATE) * GRID_SELL_PRICE).toFixed(2))
      : 0;
    
    return {
      mois: moisNoms[item.mois - 1] ?? `Mois ${item.mois}`,
      autoconsommation: selfConsumptionSavings,
      revente: gridSellSavings,
      total: selfConsumptionSavings + gridSellSavings
    };
  });

  // Données sur 25 ans
  let cumulativeSavings = 0;
  const yearlyData = Array.from({ length: YEARS + 1 }, (_, i) => {
    const year = i;
    const baseSavings = showWithSell ? firstYearSavingsWithSell : firstYearSavingsWithoutSell;
    
    // Année 0 = investissement initial
    if (i === 0) {
      return {
        year: 0,
        investissement: -installationCost,
        economies: 0,
        cumulatif: -installationCost
      };
    }
    
    // Les économies annuelles diminuent légèrement avec l'âge des panneaux
    // mais augmentent avec l'inflation du prix de l'électricité
    const yearlyEfficiency = Math.pow(EFFICIENCY_DEPRECIATION, year - 1);
    const yearlyPriceIncrease = Math.pow(1 + ELECTRICITY_PRICE_INCREASE, year - 1);
    const adjustedYearlySavings = baseSavings * yearlyEfficiency * yearlyPriceIncrease;
    
    cumulativeSavings += adjustedYearlySavings;
    
    return {
      year: year,
      investissement: 0,
      economies: Math.round(adjustedYearlySavings),
      cumulatif: Math.round(-installationCost + cumulativeSavings)
    };
  });

  const breakEvenYear = yearlyData.findIndex(data => data.cumulatif >= 0);
  const maxCumulative = Math.max(...yearlyData.map(d => d.cumulatif));

  // Calculer l'empreinte carbone
  const carbonSavingsPerYear = yearlyEnergyAcKwh * 0.057; // 57g CO2/kWh pour le PV vs ~400g pour le mix français
  const lifetimeCarbonSavings = carbonSavingsPerYear * 25;

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Carte résumé */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f9f9f9' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Votre projet solaire en résumé
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : 'Votre simulation personnalisée'}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
            >
              Télécharger le PDF
            </Button>
          </Stack>
        </Paper>
      </Grid>
      
      {/* Statistiques clés */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ElectricBoltIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Production</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {yearlyEnergyAcKwh.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} kWh/an
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {installationSizeKw.toFixed(2)} kWc • {panelsCount} panneaux
            </Typography>
            <Box mt={2}>
              <Typography variant="body2">
                Orientation: {roofOrientation} • Inclinaison: {roofTilt}°
              </Typography>
              <Typography variant="body2">
                Couvre environ {solarPercentage.toFixed(0)}% de votre consommation
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <SavingsIcon color="success" sx={{ fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Économies</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="success">
              {(showWithSell ? firstYearSavingsWithSell : firstYearSavingsWithoutSell).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}/an
            </Typography>
            <Typography variant="body2" color="text.secondary">
              avec {showWithSell ? 'revente du surplus' : 'autoconsommation uniquement'}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setShowWithSell(!showWithSell)}
              sx={{ mt: 1 }}
            >
              <CompareArrowsIcon fontSize="small" sx={{ mr: 0.5 }} />
              Voir {showWithSell ? 'sans' : 'avec'} revente
            </Button>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AttachMoneyIcon sx={{ color: '#FF9800', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Investissement</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF9800' }}>
              {installationCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rentabilité en {breakEvenYear} ans
            </Typography>
            <Typography variant="body2" mt={1}>
              ROI sur 25 ans: {roiPercentage.toFixed(0)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Graphique de rentabilité */}
      <Grid item xs={12}>
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Rentabilité sur 25 ans</Typography>
          <Box height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Années', position: 'insideBottomRight', offset: -10 }} 
                />
                <YAxis 
                  tickFormatter={(value) => value.toLocaleString('fr-FR')} 
                  label={{ value: 'Euros (€)', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  formatter={(value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} 
                  labelFormatter={(value) => `Année ${value}`} 
                />
                <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
                <ReferenceLine 
                  x={breakEvenYear} 
                  stroke="#4CAF50" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                >
                  <Label value="Point de rentabilité" position="top" fill="#4CAF50" />
                </ReferenceLine>
                <Area 
                  type="monotone" 
                  dataKey="cumulatif" 
                  fill="rgba(76, 175, 80, 0.2)" 
                  stroke="#4CAF50" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Votre installation devient rentable après {breakEvenYear} ans et génère un bénéfice de&nbsp;
            <strong>{maxCumulative.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong> sur 25 ans
          </Typography>
        </Card>
      </Grid>
      
      {/* Impact environnemental */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <EnergySavingsLeafIcon sx={{ color: '#4CAF50', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Impact écologique</Typography>
            </Box>
            <Typography variant="body1" gutterBottom>
              Votre installation permet d'éviter le rejet de <strong>{carbonSavingsPerYear.toFixed(2)} tonnes de CO₂</strong> chaque année.
            </Typography>
            <Typography variant="body1">
              Sur la durée de vie des panneaux (25 ans), cela représente <strong>{lifetimeCarbonSavings.toFixed(2)} tonnes</strong> d'émissions évitées.
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Équivalent à planter environ {Math.round(lifetimeCarbonSavings * 50)} arbres
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Production mensuelle */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Production mensuelle</Typography>
            <Box height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProductionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => `${value} kWh`} />
                  <Bar dataKey="production" name="Production (kWh)" fill="#FFA726" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFinancialTab = () => (
    <Grid container spacing={3}>
      {/* Répartition des économies */}
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Économies mensuelles détaillées</Typography>
          <Box height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySavingsData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `${value}€`} />
                <RechartsTooltip formatter={(value) => `${value.toFixed(2)}€`} />
                <Legend />
                <Bar 
                  dataKey="autoconsommation" 
                  name="Économies par autoconsommation" 
                  stackId="a" 
                  fill="#2196F3" 
                />
                {showWithSell && (
                  <Bar 
                    dataKey="revente" 
                    name="Revenus par revente" 
                    stackId="a" 
                    fill="#4CAF50" 
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            {showWithSell ? (
              <>En revendant votre surplus d'électricité, vous augmentez vos gains annuels de <strong>{(firstYearSavingsWithSell - firstYearSavingsWithoutSell).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong></>
            ) : (
              <>Affichez le mode avec revente pour voir le potentiel de revenus supplémentaires</>
            )}
          </Typography>
        </Card>
      </Grid>
      
      {/* Comparaison avec/sans panneaux */}
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Comparaison des coûts sur 25 ans</Typography>
          <Box height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { 
                    category: 'Sans panneaux solaires', 
                    montant: solarData.remainingLifetimeUtilityBill, 
                    installation: 0,
                    factures: solarData.remainingLifetimeUtilityBill
                  },
                  { 
                    category: 'Avec panneaux solaires', 
                    montant: installationCost + solarData.remainingLifetimeUtilityBill - (showWithSell ? savingsLifetimeWithSell : savingsLifetimeWithoutSell),
                    installation: installationCost,
                    factures: solarData.remainingLifetimeUtilityBill - (showWithSell ? savingsLifetimeWithSell : savingsLifetimeWithoutSell)
                  }
                ]} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}k€`} />
                <RechartsTooltip 
                  formatter={(value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} 
                />
                <Legend />
                <Bar dataKey="installation" name="Coût d'installation" stackId="a" fill="#FF9800" />
                <Bar dataKey="factures" name="Factures d'électricité" stackId="a" fill="#F44336" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Sur 25 ans, vous économiserez environ <strong>{(solarData.remainingLifetimeUtilityBill - (installationCost + solarData.remainingLifetimeUtilityBill - (showWithSell ? savingsLifetimeWithSell : savingsLifetimeWithoutSell))).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong>
          </Typography>
        </Card>
      </Grid>
      
      {/* Options de financement */}
      <Grid item xs={12}>
        <Card sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Options de financement</Typography>
          <Typography variant="body1" paragraph>
            L'installation de {panelsCount} panneaux solaires d'une puissance totale de {installationSizeKw.toFixed(2)} kWc représente un investissement de {installationCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}.
          </Typography>
          
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Paiement comptant
                </Typography>
                <Typography variant="body2" paragraph>
                  Montant: {installationCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Typography>
                <Typography variant="body2">
                  Rentabilité: {breakEvenYear} ans
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Crédit sur 10 ans
                </Typography>
                <Typography variant="body2" paragraph>
                  Mensualité estimée: {((installationCost * 1.25) / 120).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Typography>
                <Typography variant="body2">
                  Coût total: {(installationCost * 1.25).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Crédit sur 15 ans
                </Typography>
                <Typography variant="body2" paragraph>
                  Mensualité estimée: {((installationCost * 1.35) / 180).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Typography>
                <Typography variant="body2">
                  Coût total: {(installationCost * 1.35).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Typography variant="body2" color="text.secondary" mt={2}>
            Note: Les estimations de crédit sont données à titre indicatif. Consultez votre banque pour connaître les taux exacts.
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F5F7FA", p: 3, overflowX: "hidden" }}>
      {/* Header avec onglets */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
            <Button
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 0,
                borderBottom: activeTab === 'overview' ? '3px solid #1976d2' : 'none',
                color: activeTab === 'overview' ? '#1976d2' : 'inherit',
                fontWeight: activeTab === 'overview' ? 'bold' : 'normal'
              }}
              onClick={() => setActiveTab('overview')}
            >
              Vue d'ensemble
            </Button>
            <Button
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 0,
                borderBottom: activeTab === 'financial' ? '3px solid #1976d2' : 'none',
                color: activeTab === 'financial' ? '#1976d2' : 'inherit',
                fontWeight: activeTab === 'financial' ? 'bold' : 'normal'
              }}
              onClick={() => setActiveTab('financial')}
            >
              Détails financiers
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Contenu principal */}
      <Box>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'financial' && renderFinancialTab()}
      </Box>
    </Box>
  );
};

export default Result;