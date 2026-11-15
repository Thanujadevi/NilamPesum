import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Layers, Crosshair } from 'lucide-react';

// Fix Leaflet default icon issues in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface FarmlandMapProps {
  centerLat: number;
  centerLon: number;
  zoom?: number;
  boundaryGeojson?: any;
  interactive?: boolean;
  onPolygonChange?: (polygonCoords: [number, number][], acres: number, hectares: number) => void;
  className?: string;
}

// Map Click Listener Component
const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const FarmlandMap: React.FC<FarmlandMapProps> = ({
  centerLat,
  centerLon,
  zoom = 15,
  boundaryGeojson,
  interactive = false,
  onPolygonChange,
  className = 'h-80 w-full rounded-xl overflow-hidden shadow-inner'
}) => {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [mapType, setMapType] = useState<'osm' | 'nasa_gibs'>('osm');

  // Load existing boundary if provided
  useEffect(() => {
    if (boundaryGeojson && boundaryGeojson.coordinates) {
      const ring = boundaryGeojson.coordinates[0];
      if (ring && ring.length >= 3) {
        // GeoJSON is [lon, lat], Leaflet is [lat, lon]
        const leafletCoords: [number, number][] = ring.map((pt: number[]) => [pt[1], pt[0]]);
        setPoints(leafletCoords);
      }
    }
  }, [boundaryGeojson]);

  const handleMapClick = (lat: number, lng: number) => {
    if (!interactive) return;
    const newPoints = [...points, [lat, lng] as [number, number]];
    setPoints(newPoints);

    if (newPoints.length >= 3 && onPolygonChange) {
      // Calculate approximate area
      const acres = calculateAreaAcres(newPoints);
      const ha = acres * 0.404686;
      onPolygonChange(newPoints, round(acres, 2), round(ha, 2));
    }
  };

  const calculateAreaAcres = (coords: [number, number][]): number => {
    if (coords.length < 3) return 2.5;
    let area = 0.0;
    const R = 6378137.0; // Earth radius in meters
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      const lon1 = (p1[1] * Math.PI) / 180;
      const lat1 = (p1[0] * Math.PI) / 180;
      const lon2 = (p2[1] * Math.PI) / 180;
      const lat2 = (p2[0] * Math.PI) / 180;
      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = Math.abs((area * R * R) / 2.0);
    return Math.max(0.1, (area / 10000.0) * 2.47105);
  };

  const round = (val: number, dec: number) => Number(val.toFixed(dec));

  const clearBoundary = () => {
    setPoints([]);
    if (onPolygonChange) onPolygonChange([], 0, 0);
  };

  return (
    <div className="relative">
      <div className={className}>
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          {mapType === 'osm' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (Geographical Base Map Only)'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a> Global Imagery Browse Services'
              url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg"
            />
          )}

          <Marker position={[centerLat, centerLon]}>
            <Popup>
              <div className="text-xs">
                <strong>Farmland Center</strong>
                <br />
                Lat: {centerLat.toFixed(4)}, Lon: {centerLon.toFixed(4)}
              </div>
            </Popup>
          </Marker>

          {points.length >= 3 && (
            <Polygon
              positions={points}
              pathOptions={{
                color: '#2f6a46',
                fillColor: '#7bc863',
                fillOpacity: 0.35,
                weight: 2.5
              }}
            />
          )}

          {interactive && <MapClickHandler onMapClick={handleMapClick} />}
        </MapContainer>
      </div>

      {/* Layer Switcher & Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setMapType(mapType === 'osm' ? 'nasa_gibs' : 'osm')}
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg shadow text-xs font-semibold text-forest-900 border border-slate-200 hover:bg-cream-50"
          title="Toggle NASA GIBS Satellite Overlay"
        >
          <Layers className="w-3.5 h-3.5 text-forest-700" />
          <span>{mapType === 'osm' ? 'NASA GIBS Satellite' : 'Street Map'}</span>
        </button>

        {interactive && points.length > 0 && (
          <button
            onClick={clearBoundary}
            className="bg-white/95 px-2.5 py-1 rounded text-[11px] font-semibold text-rose-700 border border-rose-200 shadow hover:bg-rose-50"
          >
            Clear Boundary ({points.length} pts)
          </button>
        )}
      </div>

      {/* Disclaimer footnote */}
      <div className="text-[10px] text-slate-500 mt-1.5 flex items-center justify-between">
        <span>OpenStreetMap is used strictly as a geographical base map. Environmental data originates from NASA.</span>
        <span>Lat: {centerLat.toFixed(4)}, Lon: {centerLon.toFixed(4)}</span>
      </div>
    </div>
  );
};

