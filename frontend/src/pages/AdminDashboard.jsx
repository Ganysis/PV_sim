import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Search, 
  Logout, 
  Refresh, 
  Person, 
  ElectricBolt, 
  AttachMoney,
  SolarPower,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarMonth,
  MoreVert
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // États pour la gestion des données
  const [stats, setStats] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });
  
  // États pour le dialogue de détail
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [contactNote, setContactNote] = useState('');
  const [contacting, setContacting] = useState(false);
  
  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
    
    fetchData();
  }, [navigate, pagination.page, pagination.limit]);
  
  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Récupérer les statistiques
      const statsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`,
        { headers }
      );
      
      // Récupérer les simulations
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const simulationsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/simulations?page=${pagination.page + 1}&limit=${pagination.limit}${searchParam}`,
        { headers }
      );
      
      setStats(statsResponse.data);
      setSimulations(simulationsResponse.data.simulations);
      setPagination(prev => ({
        ...prev,
        total: simulationsResponse.data.pagination.total
      }));
      
    } catch (err) {
      console.error('Erreur de récupération des données:', err);
      setError('Erreur lors de la récupération des données. Veuillez réessayer.');
      
      // Rediriger vers la connexion si l'authentification a échoué
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };
  
  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 0 })); // Revenir à la première page
    fetchData();
  };
  
  // Gérer la pagination
  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const handleChangeRowsPerPage = (event) => {
    setPagination({
      page: 0,
      limit: parseInt(event.target.value, 10)
    });
  };
  
  // Gérer l'ouverture du dialogue de détail
  const handleOpenDetailDialog = (simulation) => {
    setSelectedSimulation(simulation);
    setDetailDialogOpen(true);
  };
  
  // Gérer la fermeture du dialogue de détail
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedSimulation(null);
    setContactNote('');
  };
  
  // Gérer le contact client
  const handleContactClient = async () => {
    if (!selectedSimulation) return;
    
    setContacting(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/simulations/${selectedSimulation.id}/contact`,
        { notes: contactNote },
        { headers }
      );
      
      // Fermer le dialogue et rafraîchir les données
      handleCloseDetailDialog();
      fetchData();
      
    } catch (err) {
      console.error('Erreur lors du contact:', err);
      setError('Erreur lors de l\'enregistrement du contact. Veuillez réessayer.');
    } finally {
      setContacting(false);
    }
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Charger le nom de l'admin connecté
  const adminName = JSON.parse(localStorage.getItem('adminInfo'))?.name || 'Admin';

  if (loading && !simulations.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 2, px: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1">
              Tableau de bord admin
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Bonjour, {adminName}
              </Typography>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="small"
                startIcon={<Logout />}
                onClick={handleLogout}
              >
                {isMobile ? '' : 'Déconnexion'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        {/* Cartes statistiques */}
        {stats && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SolarPower color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalSimulations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Simulations totales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CalendarMonth color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.simulationsToday}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Simulations aujourd'hui
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ElectricBolt color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.averageInstallationSize?.toFixed(1) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Puissance moyenne (kWc)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Person color="info" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalProprietaires || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Propriétaires
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Recherche et liste des simulations */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom, email, adresse, téléphone..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ ml: 1 }}
            >
              Rechercher
            </Button>
            <IconButton onClick={() => { setSearch(''); fetchData(); }} sx={{ ml: 1 }}>
              <Refresh />
            </IconButton>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  {!isMobile && <TableCell>Contact</TableCell>}
                  <TableCell align="center">Installation</TableCell>
                  <TableCell align="center">Économies/an</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && !simulations.length ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : simulations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucune simulation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  simulations.map((simulation) => (
                    <TableRow key={simulation.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {simulation.user.firstName || ''} {simulation.user.lastName || ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <Chip 
                              size="small" 
                              label={simulation.user.status} 
                              color={simulation.user.status === 'propriétaire' ? 'success' : 'info'}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Typography>
                          {isMobile && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <PhoneIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                              {simulation.user.phone || 'N/A'}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      {!isMobile && (
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {simulation.user.phone || 'N/A'}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {simulation.user.email || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}
                      
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {simulation.installationSizeKw.toFixed(1)} kWc
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {simulation.panelsCount} panneaux
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          {Math.round(simulation.firstYearSavingsWithSell)} €
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="caption">
                          {formatDate(simulation.createdAt)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenDetailDialog(simulation)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page}
            onPageChange={handleChangePage}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </Paper>
      </Container>
      
      {/* Dialogue de détail de la simulation */}
      {selectedSimulation && (
        <Dialog 
          open={detailDialogOpen} 
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            Détails de la simulation
            <IconButton
              aria-label="close"
              onClick={handleCloseDetailDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <MoreVert />
            </IconButton>
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Informations du client */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Informations client
                </Typography>
                
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nom complet
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedSimulation.user.firstName || ''} {selectedSimulation.user.lastName || ''}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Statut
                    </Typography>
                    <Chip 
                      label={selectedSimulation.user.status} 
                      color={selectedSimulation.user.status === 'propriétaire' ? 'success' : 'info'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Téléphone
                    </Typography>
                    <Typography variant="body1">
                      {selectedSimulation.user.phone || 'Non renseigné'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedSimulation.user.email || 'Non renseigné'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Adresse
                    </Typography>
                    <Typography variant="body1">
                      {selectedSimulation.user.address || 'Non renseignée'}
                    </Typography>
                  </Box>
                </Paper>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Contacter le client
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Notes sur le contact (optionnel)"
                    value={contactNote}
                    onChange={(e) => setContactNote(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<PhoneIcon />}
                    onClick={handleContactClient}
                    disabled={contacting}
                  >
                    {contacting ? 'Enregistrement...' : 'Marquer comme contacté'}
                  </Button>
                </Box>
              </Grid>
              
              {/* Détails de la simulation */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Détails de l'installation
                </Typography>
                
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Puissance installée
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedSimulation.installationSizeKw.toFixed(1)} kWc
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre de panneaux
                    </Typography>
                    <Typography variant="body1">
                      {selectedSimulation.panelsCount} panneaux
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Orientation de la toiture
                    </Typography>
                    <Typography variant="body1">
                      {selectedSimulation.roofOrientation || 'Non précisée'} 
                      {selectedSimulation.roofTilt && ` (${selectedSimulation.roofTilt}°)`}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Production annuelle estimée
                    </Typography>
                    <Typography variant="body1">
                      {selectedSimulation.yearlyEnergyAcKwh.toFixed(0)} kWh/an
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Coût d'installation estimé
                    </Typography>
                    <Typography variant="body1">
                      {selectedSimulation.installationCost.toFixed(0)} €
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Économies annuelles (avec revente)
                    </Typography>
                    <Typography variant="body1" color="success.main" fontWeight="medium">
                      {selectedSimulation.firstYearSavingsWithSell.toFixed(0)} €/an
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Temps de retour sur investissement
                    </Typography>
                    <Typography variant="body1">
                      {selectedSimulation.paybackYears.toFixed(1)} ans
                    </Typography>
                  </Box>
                </Paper>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Localisation
                  </Typography>
                  
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Coordonnées GPS
                      </Typography>
                      <Typography variant="body1">
                        Lat: {selectedSimulation.latitude.toFixed(6)}, Lng: {selectedSimulation.longitude.toFixed(6)}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<HomeIcon />}
                      href={`https://www.google.com/maps?q=${selectedSimulation.latitude},${selectedSimulation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir sur Google Maps
                    </Button>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDetailDialog}>Fermer</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminDashboard;