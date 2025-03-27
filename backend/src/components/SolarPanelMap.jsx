import React, { useState, useEffect } from 'react';
import { GoogleMap, Polygon, useJsApiLoader } from '@react-google-maps/api';

// Style pour les panneaux solaires
const panelStyle = {
  fillColor: '#2196F3',
  fillOpacity: 0.7,
  strokeColor: '#0D47A1',
  strokeOpacity: 1,
  strokeWeight: 1
};

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const API_KEY = 'VOTRE_CLE_API_GOOGLE_MAPS'; // Remplacez par votre clé API Google Maps

const SolarPanelMap = ({ panelCoordinates, latitude, longitude }) => {
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris par défaut
  const [zoom, setZoom] = useState(20); // Zoom élevé pour voir les détails du toit

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY
  });

  useEffect(() => {
    // Utiliser les coordonnées fournies si disponibles
    if (latitude && longitude) {
      setCenter({ 
        lat: typeof latitude === 'string' ? parseFloat(latitude) : latitude, 
        lng: typeof longitude === 'string' ? parseFloat(longitude) : longitude 
      });
    }
  }, [latitude, longitude]);

  const renderPanels = () => {
    if (!panelCoordinates || !Array.isArray(panelCoordinates) || panelCoordinates.length === 0) {
      return null;
    }

    return panelCoordinates.map((panel, index) => {
      // Si nous avons les coins du panneau
      if (panel.corners && Array.isArray(panel.corners) && panel.corners.length >= 3) {
        return (
          <Polygon
            key={panel.id || `panel_${index}`}
            paths={panel.corners}
            options={{
              ...panelStyle,
              zIndex: 1000 + index, // Assure que les panneaux sont au-dessus de la carte
            }}
          />
        );
      }
      
      // Si nous n'avons que le centre, créer un carré approximatif
      if (panel.center && panel.center.lat && panel.center.lng) {
        // Créer un carré approximatif autour du centre
        const offset = 0.00005; // Environ 5-6 mètres à latitude moyenne
        const corners = [
          { lat: panel.center.lat - offset, lng: panel.center.lng - offset },
          { lat: panel.center.lat - offset, lng: panel.center.lng + offset },
          { lat: panel.center.lat + offset, lng: panel.center.lng + offset },
          { lat: panel.center.lat + offset, lng: panel.center.lng - offset }
        ];
        
        return (
          <Polygon
            key={panel.id || `panel_${index}`}
            paths={corners}
            options={{
              ...panelStyle,
              zIndex: 1000 + index,
            }}
          />
        );
      }
      
      return null;
    });
  };

  // Afficher un message de chargement jusqu'à ce que l'API Google Maps soit chargée
  if (!isLoaded) {
    return <div>Chargement de la carte...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      mapTypeId="satellite"
      options={{
        tilt: 0, // Vue du dessus pour mieux voir les toits
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {renderPanels()}
    </GoogleMap>
  );
};

export default SolarPanelMap;