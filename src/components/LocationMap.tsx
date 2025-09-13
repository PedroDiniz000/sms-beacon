import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Map, MapPin, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface LocationMapProps {
  location: LocationData | null;
}

const LocationMap = ({ location }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [map, setMap] = useState<any>(null);
  const { toast } = useToast();

  const initializeMap = async () => {
    if (!mapboxToken || !location || !mapContainer.current) return;

    try {
      // Importa dinamicamente o Mapbox GL JS
      const mapboxgl = await import('mapbox-gl');
      await import('mapbox-gl/dist/mapbox-gl.css');

      mapboxgl.default.accessToken = mapboxToken;

      const newMap = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [location.longitude, location.latitude],
        zoom: 15
      });

      // Adiciona marcador na localização
      new mapboxgl.default.Marker({ color: '#ef4444' })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new mapboxgl.default.Popup().setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">Celular Encontrado!</h3>
            <p style="margin: 0; font-size: 12px;">
              Precisão: ${Math.round(location.accuracy)}m<br>
              ${location.timestamp.toLocaleString('pt-BR')}
            </p>
          </div>
        `))
        .addTo(newMap);

      // Adiciona controles de navegação
      newMap.addControl(new mapboxgl.default.NavigationControl());

      setMap(newMap);

      toast({
        title: "🗺️ Mapa Carregado!",
        description: "Localização do celular marcada no mapa",
        variant: "default",
      });

    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
      toast({
        title: "Erro no Mapa",
        description: "Verifique se o token do Mapbox está correto",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (mapboxToken && location) {
      initializeMap();
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mapboxToken, location]);

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Token Necessário",
        description: "Insira seu token público do Mapbox",
        variant: "destructive",
      });
      return;
    }
    initializeMap();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Mapa de Localização
        </CardTitle>
        <CardDescription>
          Visualize a localização do celular no mapa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!mapboxToken && (
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Para exibir o mapa, você precisa de um token público do Mapbox.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://mapbox.com/', '_blank')}
              >
                Obter Token do Mapbox
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                type={showTokenInput ? "text" : "password"}
                placeholder="Cole seu token público do Mapbox aqui"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowTokenInput(!showTokenInput)}
              >
                {showTokenInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button onClick={handleTokenSubmit}>
                Carregar
              </Button>
            </div>
          </div>
        )}

        {location && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-success text-success-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                Localizado
              </Badge>
              <span className="text-xs text-muted-foreground">
                {location.timestamp.toLocaleString('pt-BR')}
              </span>
            </div>

            <div 
              ref={mapContainer} 
              className="w-full h-64 rounded-lg bg-muted flex items-center justify-center"
            >
              {!mapboxToken ? (
                <div className="text-center text-muted-foreground">
                  <Map className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Configure o token do Mapbox para ver o mapa</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm mt-2">Carregando mapa...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!location && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Obtenha a localização GPS primeiro para visualizar no mapa
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationMap;