import { generateDirectionsUrl } from '@/services/mapboxService';

interface DirectionsButtonProps {
  lat: number;
  lng: number;
  address: string;
}

export const DirectionsButton = ({ lat, lng, address }: DirectionsButtonProps) => {
  const handleGetDirections = () => {
    const url = generateDirectionsUrl(lat, lng);
    window.open(url, '_blank');
  };

  return {
    handleGetDirections,
    getDirectionsUrl: () => generateDirectionsUrl(lat, lng),
  };
};
