// File: components/HuntMap.tsx
'use client';
import * as React from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { ScavengerHuntItem } from '@/lib/schemas/huntItem';

export type HuntMapProps = {
  /** Google Maps API key (if omitted, component will try NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) */
  apiKey?: string;
  /** Items to render as pins */
  items: ScavengerHuntItem[];
  /** Initial zoom if fitBounds can't determine (e.g., single point) */
  fallbackZoom?: number;
  /** Height/width container classes */
  className?: string;
};

function getKey(explicit?: string) {
  const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return explicit || envKey || '';
}

function toNumber(n: string | number): number {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return Number.isFinite(v) ? (v as number) : 0;
}

function useFitBounds(items: ScavengerHuntItem[], fallbackZoom = 12) {
  const map = useMap();
  React.useEffect(() => {
    if (!map || !items?.length) return;
    if (items.length === 1) {
      const { lat, lng } = items[0];
      map.setCenter({ lat: toNumber(lat), lng: toNumber(lng) });
      map.setZoom(fallbackZoom);
      return;
    }
    // Fit bounds to all markers
    const bounds = new google.maps.LatLngBounds();
    for (const it of items) bounds.extend({ lat: toNumber(it.lat), lng: toNumber(it.lng) });
    map.fitBounds(bounds);
  }, [map, items, fallbackZoom]);
}

export default function HuntMap({
  apiKey,
  items,
  fallbackZoom = 12,
  className = 'h-[70vh] w-full rounded-2xl overflow-hidden shadow',
}: HuntMapProps) {
  const key = getKey(apiKey);
  return (
    <APIProvider apiKey={key}>
      <HuntMapInner items={items} fallbackZoom={fallbackZoom} className={className} />
    </APIProvider>
  );
}

function HuntMapInner({ items, fallbackZoom, className }: Omit<HuntMapProps, 'apiKey'>) {
  // Which pin is selected?
  const [activeId, setActiveId] = React.useState<number | null>(null);

  // Start somewhere near the first item, fall back to Raleigh if none
  const initialCenter = React.useMemo(() => {
    if (items?.length) {
      return { lat: toNumber(items[0].lat), lng: toNumber(items[0].lng) };
    }
    return { lat: 35.7796, lng: -78.6382 };
  }, [items]);

  useFitBounds(items, fallbackZoom);

  return (
    <div className={className}>
      <Map
        mapId="de72253cc965ac28fafcffde"
        center={initialCenter}
        zoom={fallbackZoom}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        style={{ width: '100%', height: '100%' }}
      >
        {items.map((it) => {
          const position = { lat: toNumber(it.lat), lng: toNumber(it.lng) };
          const selected = activeId === it.id;
          return (
            <React.Fragment key={it.id}>
              <AdvancedMarker position={position} onClick={() => setActiveId(it.id)}>
                <Pin
                  background={selected ? '#111827' : '#4f46e5'}
                  borderColor={selected ? '#000' : '#4338ca'}
                  glyphColor="#fff"
                />
              </AdvancedMarker>

              {selected && (
                <InfoWindow position={position} onCloseClick={() => setActiveId(null)}>
                  <HuntCard item={it} />
                </InfoWindow>
              )}
            </React.Fragment>
          );
        })}
      </Map>
    </div>
  );
}

function HuntCard({ item }: { item: ScavengerHuntItem }) {
  return (
    <div className="max-w-xs">
      <div className="text-sm font-semibold">{item.title}</div>
      <div className="mt-1 text-xs text-gray-600">{item.description}</div>
      <div className="mt-2 text-xs">
        <span className="font-medium">Clue:</span> {item.hint}
      </div>
      {item.createdAt && (
        <div className="mt-2 text-[11px] text-gray-500">
          Added: {new Date(item.createdAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
