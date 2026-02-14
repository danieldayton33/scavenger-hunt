// File: components/HuntMap.tsx
'use client';
import { useEffect, useState, useRef, useMemo, Fragment } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { ScavengerHuntItem } from '@/lib/schemas/huntItem';
import { createRandomizedCircle } from '@/lib/utils/mapUtils';
import { BASE_CIRCLE_CONFIG } from '@/lib/constants/mapConstants';

export type ItemWithSubmissionStatus = ScavengerHuntItem & {
  submissionStatus?: 'not_submitted' | 'submitted' | 'pending' | 'approved' | 'rejected';
  submissionId?: number;
};

export type HuntMapProps = {
  /** Google Maps API key (if omitted, component will try NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) */
  apiKey?: string;
  /** Items to render as pins */
  items: ItemWithSubmissionStatus[];
  /** Initial zoom if fitBounds can't determine (e.g., single point) */
  fallbackZoom?: number;
  /** Height/width container classes */
  className?: string;
  /** Whether this is participant view (enables submission button and map movement) */
  isParticipantView?: boolean;
  /** Hunt slug for creating submissions */
  huntSlug?: string;
  /** Whether the current user is a participant (required to show submission button) */
  isParticipant?: boolean;
};

function getKey(explicit?: string) {
  const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return explicit || envKey || '';
}

function toNumber(n: string | number): number {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return Number.isFinite(v) ? (v as number) : 0;
}

function useFitBounds(items: ScavengerHuntItem[], fallbackZoom = 12, enabled = true) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !map || !items?.length) return;
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
  }, [map, items, fallbackZoom, enabled]);
}

export default function HuntMap({
  apiKey,
  items,
  fallbackZoom = 12,
  className = 'h-[70vh] w-full rounded-2xl overflow-hidden shadow',
  isParticipantView = false,
  huntSlug,
  isParticipant = false,
}: HuntMapProps) {
  const key = getKey(apiKey);
  return (
    <APIProvider apiKey={key}>
      <HuntMapInner
        items={items}
        fallbackZoom={fallbackZoom}
        className={className}
        isParticipantView={isParticipantView}
        huntSlug={huntSlug}
        isParticipant={isParticipant}
      />
    </APIProvider>
  );
}

function HuntMapInner({
  items,
  fallbackZoom,
  className,
  isParticipantView = false,
  huntSlug,
  isParticipant = false,
}: Omit<HuntMapProps, 'apiKey'>) {
  // Which pin is selected?
  const [activeId, setActiveId] = useState<number | null>(null);
  const map = useMap();
  const circlesRef = useRef<google.maps.Circle[]>([]);

  // Start somewhere near the first item, fall back to Raleigh if none
  const initialCenter = useMemo(() => {
    if (items?.length) {
      return { lat: toNumber(items[0].lat), lng: toNumber(items[0].lng) };
    }
    return { lat: 35.7796, lng: -78.6382 };
  }, [items]);

  // Only fit bounds on initial load for admin view, allow free movement for participants
  useFitBounds(items, fallbackZoom, !isParticipantView);

  // Type guard to check if item has submission status
  const hasSubmissionStatus = (
    item: ScavengerHuntItem | ItemWithSubmissionStatus
  ): item is ItemWithSubmissionStatus => {
    return 'submissionStatus' in item;
  };

  // Get circle colors based on submission status
  const getCircleColors = (status?: string) => {
    switch (status) {
      case 'approved':
        return {
          strokeColor: '#10b981', // green-500
          fillColor: '#10b981',
        };
      case 'rejected':
        return {
          strokeColor: '#ef4444', // red-500
          fillColor: '#ef4444',
        };
      case 'submitted':
      case 'pending':
        return {
          strokeColor: '#f59e0b', // amber-500
          fillColor: '#f59e0b',
        };
      default:
        return {
          strokeColor: BASE_CIRCLE_CONFIG.strokeColor,
          fillColor: BASE_CIRCLE_CONFIG.fillColor,
        };
    }
  };

  // Create circles for participant view (300 meter radius with randomized center)
  useEffect(() => {
    if (!isParticipantView || !map) {
      // Clean up circles if switching to admin view
      circlesRef.current.forEach((circle) => circle.setMap(null));
      circlesRef.current = [];
      return;
    }

    // Clean up existing circles
    circlesRef.current.forEach((circle) => circle.setMap(null));
    circlesRef.current = [];

    // Create circles for each item with randomized center
    items.forEach((it) => {
      const itemLat = toNumber(it.lat);
      const itemLng = toNumber(it.lng);
      const circleConfig = createRandomizedCircle(itemLat, itemLng, 750, 200);

      const submissionStatus = hasSubmissionStatus(it) ? it.submissionStatus : undefined;
      const colors = getCircleColors(submissionStatus);

      const position = new google.maps.LatLng(circleConfig.center.lat, circleConfig.center.lng);
      const circle = new google.maps.Circle({
        ...BASE_CIRCLE_CONFIG,
        ...colors,
        map: map,
        center: position,
        radius: circleConfig.radius,
        clickable: true,
      });

      circle.addListener('click', () => {
        setActiveId(it.id);
      });

      circlesRef.current.push(circle);
    });

    return () => {
      circlesRef.current.forEach((circle) => circle.setMap(null));
      circlesRef.current = [];
    };
  }, [isParticipantView, map, items]);

  return (
    <div
      className={
        isParticipantView
          ? `grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 ${className}`
          : className
      }
    >
      {isParticipantView && (
        <div className="flex-shrink-0 border-r bg-white">
          <div className="border-b p-4">
            <h3 className="text-lg font-semibold">Hunt Items</h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 73px)' }}>
            <ul className="divide-y">
              {items.map((it) => {
                const isSelected = activeId === it.id;
                const submissionStatus = hasSubmissionStatus(it) ? it.submissionStatus : undefined;
                const statusBadge =
                  submissionStatus === 'approved' ? (
                    <span className="ml-2 text-xs text-green-600">✓ Approved</span>
                  ) : submissionStatus === 'rejected' ? (
                    <span className="ml-2 text-xs text-red-600">✗ Rejected</span>
                  ) : submissionStatus === 'submitted' || submissionStatus === 'pending' ? (
                    <span className="ml-2 text-xs text-yellow-600">⏳ Pending</span>
                  ) : null;

                return (
                  <li key={it.id}>
                    <button
                      onClick={() => setActiveId(it.id)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{it.title}</div>
                      {it.description && (
                        <div className="mt-1 text-xs opacity-80">{it.description}</div>
                      )}
                      {statusBadge}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      <div className={isParticipantView ? 'flex-1 lg:col-span-2 xl:col-span-3' : 'flex-grow'}>
        <Map
          mapId="de72253cc965ac28fafcffde"
          center={initialCenter}
          zoom={fallbackZoom}
          gestureHandling={isParticipantView ? 'greedy' : 'cooperative'}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
        >
          {!isParticipantView &&
            items.map((it) => {
              const position = { lat: toNumber(it.lat), lng: toNumber(it.lng) };
              const selected = activeId === it.id;
              return (
                <Fragment key={it.id}>
                  <AdvancedMarker position={position} onClick={() => setActiveId(it.id)}>
                    <Pin
                      background={selected ? '#111827' : '#4f46e5'}
                      borderColor={selected ? '#000' : '#4338ca'}
                      glyphColor="#fff"
                    />
                  </AdvancedMarker>

                  {selected && (
                    <InfoWindow position={position} onCloseClick={() => setActiveId(null)}>
                      <HuntCard
                        item={it}
                        isParticipantView={isParticipantView}
                        huntSlug={huntSlug}
                        isParticipant={isParticipant}
                      />
                    </InfoWindow>
                  )}
                </Fragment>
              );
            })}
          {isParticipantView &&
            items.map((it) => {
              const position = { lat: toNumber(it.lat), lng: toNumber(it.lng) };
              const selected = activeId === it.id;
              return (
                selected && (
                  <InfoWindow
                    key={it.id}
                    position={position}
                    onCloseClick={() => setActiveId(null)}
                  >
                    <HuntCard
                      item={it}
                      isParticipantView={isParticipantView}
                      huntSlug={huntSlug}
                      isParticipant={isParticipant}
                    />
                  </InfoWindow>
                )
              );
            })}
        </Map>
      </div>
    </div>
  );
}

function HuntCard({
  item,
  isParticipantView = false,
  huntSlug,
  isParticipant = false,
}: {
  item: ScavengerHuntItem | ItemWithSubmissionStatus;
  isParticipantView?: boolean;
  huntSlug?: string;
  isParticipant?: boolean;
}) {
  // Type guard to check if item has submission status
  const hasSubmissionStatus = (
    item: ScavengerHuntItem | ItemWithSubmissionStatus
  ): item is ItemWithSubmissionStatus => {
    return 'submissionStatus' in item;
  };

  const submissionStatus = hasSubmissionStatus(item) ? item.submissionStatus : undefined;
  const submissionId = hasSubmissionStatus(item) ? item.submissionId : undefined;
  const hasSubmission = submissionStatus && submissionStatus !== 'not_submitted' && submissionId;

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
      {isParticipantView && huntSlug && isParticipant && (
        <div className="mt-3">
          {hasSubmission ? (
            <a
              href={`/scavenger-hunt/${huntSlug}/submission/${submissionId}/edit`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Edit Submission
            </a>
          ) : (
            <a
              href={`/scavenger-hunt/${huntSlug}/submission/create?itemId=${item.id}`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Create Submission
            </a>
          )}
        </div>
      )}
    </div>
  );
}
