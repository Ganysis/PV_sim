import { Box, Typography, Button, Card, CardContent, Grid } from "@mui/material";

export default function Home() {
  return (
    <Box p={4}>
      <Typography variant="h3" align="center" gutterBottom>
        Tableau de bord MUI
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Carte 1</Typography>
              <Typography variant="body2" color="textSecondary">
                Exemple de carte avec du texte.
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                Action
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Carte 2</Typography>
              <Typography variant="body2" color="textSecondary">
                Une autre carte.
              </Typography>
              <Button variant="contained" color="secondary" sx={{ mt: 2 }}>
                Action
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
