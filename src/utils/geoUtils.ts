export interface LatLng {
  lat: number;
  lng: number;
}

export function parseCoordinates(coordString: string): LatLng | null {
  const parts = coordString.split(',').map(p => parseFloat(p.trim()));
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return { lat: parts[0], lng: parts[1] };
}

// Fórmula de Haversine para distancia entre dos coordenadas
export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const aCalc =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

  return R * c; // distancia en metros
}
