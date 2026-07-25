import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Spot, SpotCategory, Stadium } from "@/api/types";
import { CATEGORY_META, formatDistance, formatPrice } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * Builds a map pin as a styled HTML element.
 *
 * Leaflet's default marker is a PNG referenced by a relative path, which a
 * bundler rewrites — the classic "markers are invisible in production" bug.
 * A `divIcon` sidesteps it entirely, and because the markup lives in the same
 * document it can use the theme's CSS variables: pins re-colour on the
 * dark/light toggle with no JavaScript involved.
 */
function createSpotPin(category: SpotCategory, inPlan: boolean): L.DivIcon {
  const meta = CATEGORY_META[category];
  const ring = inPlan
    ? "3px solid var(--acid)"
    : "2px solid rgba(255,255,255,0.85)";

  return L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
    html: `<div style="
      width:26px;height:26px;display:grid;place-items:center;
      border-radius:50%;background:${meta.colour};color:#0B0D0C;
      font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:600;
      border:${ring};box-shadow:0 3px 10px rgba(0,0,0,.5)
    ">${meta.initial}</div>`,
  });
}

const GROUND_PIN = L.divIcon({
  className: "",
  iconSize: [46, 46],
  iconAnchor: [23, 23],
  popupAnchor: [0, -23],
  html: `<div style="
    width:46px;height:46px;display:grid;place-items:center;
    background:var(--acid);color:var(--acid-ink);
    font-family:Anton,sans-serif;font-size:15px;
    box-shadow:0 6px 20px rgba(0,0,0,.45)
  ">GND</div>`,
});

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
    // The panels float over the map, so the map is wider than the visible
    // area — a slightly generous box keeps the circle clear of them.
    const bounds = L.latLng(latitude, longitude).toBounds(radius * 2.5);
    map.fitBounds(bounds, { animate: false, padding: [20, 20] });
  }, [map, latitude, longitude, radius]);

  return null;
}

type SpotMapProps = {
  stadium: Stadium;
  spots: Spot[];
  radius: number;
  /** Spot ids already in the itinerary — drawn with an accent ring. */
  planStops: string[];
};

export function SpotMap({ stadium, spots, radius, planStops }: SpotMapProps) {
  const { theme } = useTheme();

  // CARTO's basemaps come in matching dark and light designs, which is what
  // lets the map belong to the page instead of sitting on it as a bright
  // rectangle. Standard OSM tiles only exist in one (light) style.
  const tileUrl =
    theme === "light"
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Ten possible pins (five categories × in/out of plan). Building them once
  // avoids Leaflet replacing every marker element on each filter change.
  const pins = useMemo(() => {
    const table = new Map<string, L.DivIcon>();
    for (const category of Object.keys(CATEGORY_META) as SpotCategory[]) {
      table.set(`${category}:true`, createSpotPin(category, true));
      table.set(`${category}:false`, createSpotPin(category, false));
    }
    return table;
  }, []);

  return (
    <MapContainer
      center={[stadium.latitude, stadium.longitude]}
      zoom={15}
      scrollWheelZoom
      zoomControl
      className="size-full"
    >
      <TileLayer
        // Remounting on theme change is the simplest correct way to swap the
        // basemap; the tiles are cached, so it is not a visible reload.
        key={theme}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; CARTO'
        url={tileUrl}
        subdomains="abcd"
        maxZoom={20}
      />

      <FitToRadius
        latitude={stadium.latitude}
        longitude={stadium.longitude}
        radius={radius}
      />

      {/* The search area, drawn so the radius filter is something you see
          rather than a number in a box. */}
      <Circle
        center={[stadium.latitude, stadium.longitude]}
        radius={radius}
        pathOptions={{
          color: "var(--acid)",
          weight: 1,
          dashArray: "4 5",
          fillColor: "var(--acid)",
          fillOpacity: 0.07,
        }}
      />

      <Marker
        position={[stadium.latitude, stadium.longitude]}
        icon={GROUND_PIN}
        zIndexOffset={1000}
      >
        <Popup>
          <strong className="font-display text-sm uppercase">
            {stadium.name}
          </strong>
          <br />
          {stadium.city}, {stadium.country}
        </Popup>
      </Marker>

      {spots.map((spot) => {
        const inPlan = planStops.includes(spot.id);
        const meta = CATEGORY_META[spot.category];

        return (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={pins.get(`${spot.category}:${inPlan}`) ?? GROUND_PIN}
          >
            <Popup>
              <strong className="font-display text-sm uppercase">
                {spot.name}
              </strong>
              <br />
              {meta.label.toUpperCase()} · {formatPrice(spot.priceLevel)}
              {spot.distanceMetres !== undefined
                ? ` · ${formatDistance(spot.distanceMetres)}`
                : ""}
              {spot.description ? (
                <>
                  <br />
                  {spot.description}
                </>
              ) : null}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
