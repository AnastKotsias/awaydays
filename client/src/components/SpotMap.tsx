import { useEffect, useMemo } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Spot, Stadium } from "@/api/types";
import { CATEGORY_META, formatDistance, formatPrice } from "@/lib/format";

/**
 * Builds a map pin as a styled HTML element.
 *
 * Leaflet's default marker is a PNG referenced by a relative path, which
 * breaks under a bundler (the classic "markers are invisible in production"
 * bug). A `divIcon` sidesteps the problem entirely and lets each category
 * carry its own colour.
 */
function createPin(colour: string, icon: string, size: number): L.DivIcon {
  return L.divIcon({
    // Blank className removes Leaflet's default white box styling.
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        display:grid;place-items:center;
        border-radius:9999px;
        background:${colour};
        border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 2px 6px rgba(0,0,0,0.5);
        font-size:${Math.round(size * 0.5)}px;
        line-height:1;
      ">${icon}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const STADIUM_PIN = createPin("#10b981", "🏟️", 40);

/**
 * Keeps the viewport framed around the search circle.
 *
 * Has to be a child component because `useMap()` only works inside
 * <MapContainer> — that is how react-leaflet exposes the underlying map.
 */
function FitToRadius({
  latitude,
  longitude,
  radius,
}: {
  latitude: number;
  longitude: number;
  radius: number;
}) {
  const map = useMap();

  useEffect(() => {
    // toBounds takes the full width of the square, hence radius * 2, plus a
    // little margin so the circle is not flush against the edges.
    const bounds = L.latLng(latitude, longitude).toBounds(radius * 2.4);
    map.fitBounds(bounds, { animate: true });
  }, [map, latitude, longitude, radius]);

  return null;
}

type SpotMapProps = {
  stadium: Stadium;
  spots: Spot[];
  radius: number;
};

export function SpotMap({ stadium, spots, radius }: SpotMapProps) {
  // Rebuilding a DivIcon on every render would make Leaflet replace every
  // marker element each time the radius moves.
  const pins = useMemo(() => {
    return Object.fromEntries(
      Object.entries(CATEGORY_META).map(([category, meta]) => [
        category,
        createPin(meta.colour, meta.icon, 30),
      ]),
    );
  }, []);

  return (
    <MapContainer
      center={[stadium.latitude, stadium.longitude]}
      zoom={15}
      scrollWheelZoom
      className="h-[28rem] w-full rounded-xl border border-white/10 lg:h-[34rem]"
    >
      {/* OpenStreetMap tiles: free, no API key, attribution required. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToRadius
        latitude={stadium.latitude}
        longitude={stadium.longitude}
        radius={radius}
      />

      {/* The search area, drawn so the radius filter is visible, not abstract. */}
      <Circle
        center={[stadium.latitude, stadium.longitude]}
        radius={radius}
        pathOptions={{
          color: "#10b981",
          weight: 1.5,
          fillColor: "#10b981",
          fillOpacity: 0.08,
        }}
      />

      <Marker
        position={[stadium.latitude, stadium.longitude]}
        icon={STADIUM_PIN}
        zIndexOffset={1000}
      >
        <Popup>
          <strong>{stadium.name}</strong>
          <br />
          {stadium.city}, {stadium.country}
        </Popup>
      </Marker>

      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.latitude, spot.longitude]}
          icon={pins[spot.category] ?? STADIUM_PIN}
        >
          <Popup>
            <strong>{spot.name}</strong>
            <br />
            {CATEGORY_META[spot.category].label} · {formatPrice(spot.priceLevel)}
            {spot.distanceMetres !== undefined ? (
              <> · {formatDistance(spot.distanceMetres)} away</>
            ) : null}
            {spot.description ? (
              <>
                <br />
                {spot.description}
              </>
            ) : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
