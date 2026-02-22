'use client';

import { useEffect, useMemo, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

function toNumber(n: string | number | null | undefined): number | null {
  if (n == null) return null;
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return Number.isFinite(v) ? (v as number) : null;
}

function useFitBoundsOnce(
  itemLat: number | null,
  itemLng: number | null,
  submissionLat: number | null,
  submissionLng: number | null,
  fallbackZoom: number
) {
  const map = useMap();
  const didFit = useRef(false);
  useEffect(() => {
    if (!map || didFit.current) return;
    const points: { lat: number; lng: number }[] = [];
    if (itemLat != null && itemLng != null) points.push({ lat: itemLat, lng: itemLng });
    if (submissionLat != null && submissionLng != null)
      points.push({ lat: submissionLat, lng: submissionLng });
    if (points.length === 0) return;
    didFit.current = true;
    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(fallbackZoom);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds);
  }, [map, itemLat, itemLng, submissionLat, submissionLng, fallbackZoom]);
}

function getKey(apiKey?: string) {
  return apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
}

export type SubmissionLocationMapProps = {
  /** Item (target) location */
  itemLat: string | number | null;
  itemLng: string | number | null;
  /** Submission (user) location - optional if not reported */
  submissionLat?: string | number | null;
  submissionLng?: string | number | null;
  apiKey?: string;
  fallbackZoom?: number;
  className?: string;
};

function SubmissionLocationMapInner({
  itemLat,
  itemLng,
  submissionLat,
  submissionLng,
  fallbackZoom = 14,
  className,
}: SubmissionLocationMapProps & { fallbackZoom: number }) {
  const iLat = toNumber(itemLat);
  const iLng = toNumber(itemLng);
  const sLat = toNumber(submissionLat ?? null);
  const sLng = toNumber(submissionLng ?? null);

  // Fit bounds once on mount so both markers are visible; map uses defaultCenter/defaultZoom
  // so it stays uncontrolled and zoom/pan controls work.
  useFitBoundsOnce(iLat, iLng, sLat, sLng, fallbackZoom);

  const defaultCenter = useMemo(() => {
    if (iLat != null && iLng != null) return { lat: iLat, lng: iLng };
    return { lat: 35.7796, lng: -78.6382 };
  }, [iLat, iLng]);

  const hasSubmissionLocation = sLat != null && sLng != null;

  return (
    <div className="flex flex-col gap-2">
      <div className={className}>
        <Map
          mapId="de72253cc965ac28fafcffde"
          defaultCenter={defaultCenter}
          defaultZoom={fallbackZoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          scaleControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          style={{ width: '100%', height: '100%' }}
        >
        {/* Item (target) location - indigo pin */}
        {iLat != null && iLng != null && (
          <AdvancedMarker position={{ lat: iLat, lng: iLng }}>
            <Pin background="#4f46e5" borderColor="#4338ca" glyphColor="#fff" />
          </AdvancedMarker>
        )}

        {/* Submission location - green pin */}
        {hasSubmissionLocation && (
          <AdvancedMarker position={{ lat: sLat, lng: sLng }}>
            <Pin background="#10b981" borderColor="#059669" glyphColor="#fff" />
          </AdvancedMarker>
        )}
      </Map>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#4f46e5]" aria-hidden /> Item location (target)
        </span>
        {hasSubmissionLocation && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#10b981]" aria-hidden /> Submission location
          </span>
        )}
      </div>
    </div>
  );
}

export default function SubmissionLocationMap(props: SubmissionLocationMapProps) {
  const { apiKey, className = 'h-[400px] w-full rounded-lg overflow-hidden border', fallbackZoom = 14 } = props;
  const key = getKey(apiKey);

  if (!key) {
    return (
      <div className={className + ' flex items-center justify-center bg-muted text-muted-foreground'}>
        Google Maps API key not configured
      </div>
    );
  }

  return (
    <APIProvider apiKey={key}>
      <SubmissionLocationMapInner {...props} fallbackZoom={fallbackZoom} className={className} />
    </APIProvider>
  );
}
