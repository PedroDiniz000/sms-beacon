import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Satellite, Copy, Phone } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface GpsTrackerProps {
  onLocationFound: (location: LocationData) => void;
  isAlarmActive: boolean;
}

const GpsTracker = ({ onLocationFound, isAlarmActive }: GpsTrackerProps) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste navegador');
      return;
    }

    setIsTracking(true);
    setError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };

        setLocation(locationData);
        onLocationFound(locationData);
        setIsTracking(false);

        toast({
          title: "📍 Localização Obtida!",
          description: `Precisão: ${Math.round(locationData.accuracy)}m`,
          variant: "default",
        });
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localização';
            break;
          default:
            errorMessage = 'Erro desconhecido';
            break;
        }
        setError(errorMessage);
        setIsTracking(false);

        toast({
          title: "Erro GPS",
          description: errorMessage,
          variant: "destructive",
        });
      },
      options
    );
  };

  const copyLocationToClipboard = async () => {
    if (!location) return;

    const locationText = `Localização do celular:
Latitude: ${location.latitude}
Longitude: ${location.longitude}
Google Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}
Precisão: ${Math.round(location.accuracy)}m
Horário: ${location.timestamp.toLocaleString('pt-BR')}`;

    try {
      await navigator.clipboard.writeText(locationText);
      toast({
        title: "📋 Copiado!",
        description: "Localização copiada para a área de transferência",
        variant: "default",
      });
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const openInMaps = () => {
    if (!location) return;
    
    const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    
    // Tenta abrir diretamente
    const newWindow = window.open(url, '_blank');
    
    // Se bloqueado pelo navegador, oferece alternativa
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Copia o link para o clipboard como fallback
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "🚫 Pop-up Bloqueado",
          description: "Link do Google Maps copiado! Cole no navegador para abrir.",
          variant: "default",
        });
      });
    } else {
      toast({
        title: "🗺️ Abrindo Google Maps",
        description: "Nova aba aberta com sua localização",
        variant: "default",
      });
    }
  };

  // Ativar GPS automaticamente quando o alarme for ativo
  useEffect(() => {
    if (isAlarmActive && !location) {
      getCurrentLocation();
    }
  }, [isAlarmActive, location]);

  return (
    <Card className={`transition-all duration-300 ${
      location ? 'border-success bg-success/5' : 'border-border'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="h-5 w-5" />
          Rastreamento GPS
        </CardTitle>
        <CardDescription>
          Encontre seu celular através da localização GPS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={getCurrentLocation} 
            disabled={isTracking}
            className="flex-1"
          >
            {isTracking ? (
              <>
                <Navigation className="h-4 w-4 mr-2 animate-spin" />
                Localizando...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Obter Localização
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {location && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-success text-success-foreground">
                GPS Ativo
              </Badge>
              <span className="text-xs text-muted-foreground">
                Precisão: {Math.round(location.accuracy)}m
              </span>
            </div>
            
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Coordenadas:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLocationToClipboard}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
              </div>
              <div className="text-sm font-mono">
                <div>Lat: {location.latitude.toFixed(6)}</div>
                <div>Lng: {location.longitude.toFixed(6)}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {location.timestamp.toLocaleString('pt-BR')}
              </div>
            </div>

            <Button 
              onClick={openInMaps} 
              variant="outline" 
              className="w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Abrir no Google Maps
            </Button>
          </div>
        )}

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Dica:</strong> Quando o SMS com palavra-chave for recebido, 
            o GPS será ativado automaticamente para localizar o celular.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GpsTracker;