'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  useMap,
} from '@vis.gl/react-google-maps';

export type LatLng = { lat: number; lng: number };

function getGoogleMapsKey(explicit?: string): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return explicit || fromEnv;
}

function looksLikePlaceholder(key?: string) {
  return !key || /YOUR_GOOGLE_MAPS_API_KEY/i.test(key);
}

function TroubleshootPanel({ title, details }: { title: string; details?: string }) {
  return (
    <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
      <div className="font-semibold">{title}</div>
      {details ? (
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{details}</div>
      ) : null}
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>
          Verify the API key is correct and not restricted to the wrong websites (HTTP referrers).
        </li>
        <li>
          Enable <span className="font-medium">Maps JavaScript API</span> and{' '}
          <span className="font-medium">Places API</span> in Google Cloud Console.
        </li>
        <li>Add your dev origin (e.g. http://localhost:3000) to key restrictions.</li>
        <li>Changes can take a few minutes to propagate.</li>
        <li>
          Expose as <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> or pass via the <code>apiKey</code>{' '}
          prop.
        </li>
      </ul>
      <div className="text-xs text-gray-600">
        Common Maps error: <code>InvalidKeyMapError</code> means the key is invalid, missing, or not
        permitted for this origin.
      </div>
    </div>
  );
}

function ManualLatLngEntry({
  value,
  onChange,
  onConfirm,
  confirmLabel = 'Use this location',
}: {
  value: LatLng;
  onChange: (next: LatLng) => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-1">
          <span className="text-sm text-gray-600">Latitude</span>
          <input
            aria-label="Latitude"
            type="number"
            step="any"
            value={Number.isFinite(value.lat) ? value.lat : ''}
            onChange={(e) => onChange({ lat: Number(e.target.value), lng: value.lng })}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="e.g. 40.7128"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-gray-600">Longitude</span>
          <input
            aria-label="Longitude"
            type="number"
            step="any"
            value={Number.isFinite(value.lng) ? value.lng : ''}
            onChange={(e) => onChange({ lat: value.lat, lng: Number(e.target.value) })}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="e.g. -74.0060"
          />
        </label>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-500 focus:outline-none"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

// ---- AddressPinPicker (vis.gl) ----
export type AddressPinPickerProps = {
  apiKey?: string; // uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY if omitted
  latField?: string;
  lngField?: string;
  initialPosition?: LatLng;
  className?: string;
  confirmLabel?: string;
  onLocationChange?: (coords: LatLng) => void;
  fallbackManualEntry?: boolean; // default true
  zoom?: number; // default 14
};

export function AddressPinPicker(props: AddressPinPickerProps) {
  const { apiKey } = props;
  const effectiveKey = getGoogleMapsKey(apiKey);
  const keyLooksBad = looksLikePlaceholder(effectiveKey);

  if (keyLooksBad) {
    // No provider — just show troubleshooting + manual fallback so form still works
    return (
      <AddressPinPickerBody
        {...props}
        providerActive={false}
        loadErrorMessage={'Missing or placeholder API key.'}
      />
    );
  }

  // Provide the Maps context with the Places library enabled
  return (
    <APIProvider apiKey={effectiveKey!} libraries={['places']}>
      <AddressPinPickerBody {...props} providerActive={true} />
    </APIProvider>
  );
}

export function AddressPinPickerBody({
  apiKey,
  latField = 'lat',
  lngField = 'lng',
  initialPosition,
  className = 'h-96 w-full rounded-2xl overflow-hidden shadow',
  confirmLabel = 'Use this location',
  onLocationChange,
  fallbackManualEntry = true,
  zoom = 14,
}: AddressPinPickerProps & { providerActive: boolean; loadErrorMessage?: string }) {
  const { setValue, getValues } = useFormContext();
  const [mapZoom, setMapZoom] = useState(zoom);

  const effectiveKey = getGoogleMapsKey(apiKey);
  const keyLooksBad = looksLikePlaceholder(effectiveKey);

  // Default center from RHF values or prop or NYC fallback
  const defaultCenter = useMemo<LatLng>(() => {
    const lat = getValues(latField);
    const lng = getValues(lngField);
    if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
    return initialPosition ?? { lat: 40.7128, lng: -74.006 };
  }, [getValues, latField, lngField, initialPosition]);

  const [markerPos, setMarkerPos] = useState<LatLng>(defaultCenter);
  const [placesReady, setPlacesReady] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | undefined>();

  // vis.gl hooks
  const map = useMap(); // available only inside <APIProvider>
  const placesLib = useMapsLibrary('places');

  // Autocomplete wiring when places library becomes available
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    try {
      const ac = new placesLib.Autocomplete(inputRef.current as HTMLInputElement, {
        fields: ['geometry', 'formatted_address', 'name'],
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        const loc = place?.geometry?.location;
        if (!loc) return;
        const next = { lat: loc.lat(), lng: loc.lng() };
        setMarkerPos(next);
        onLocationChange?.(next);
        // pan & zoom if map is present
        map?.panTo?.(next);
        map?.setZoom?.(16);
      });
      setPlacesReady(true);
    } catch (e: unknown) {
      // If the Places API isn't enabled or key is invalid, we'll show fallback UI
      setLoadErrorMessage((e as Error)?.message || String(e));
    }
  }, [placesLib, map, onLocationChange]);

  const commitLocation = useCallback(() => {
    setValue(latField, markerPos.lat, { shouldDirty: true, shouldValidate: true });
    setValue(lngField, markerPos.lng, { shouldDirty: true, shouldValidate: true });
  }, [markerPos, setValue, latField, lngField]);

  const onMarkerDragEnd = useCallback(
    (ev: google.maps.MapMouseEvent) => {
      const { latLng } = ev || {};
      // vis.gl AdvancedMarker emits event with detail.latLng { lat(): number, lng(): number }
      if (latLng?.lat && latLng?.lng) {
        const next = { lat: latLng.lat(), lng: latLng.lng() } as LatLng;
        setMarkerPos(next);
        onLocationChange?.(next);
      }
    },
    [onLocationChange]
  );

  // ---- Render states when key is bad/missing ----
  if (keyLooksBad) {
    return (
      <div className="space-y-4">
        <TroubleshootPanel
          title="Google Maps couldn’t start: missing or placeholder API key."
          details={`Pass a valid key via the \"apiKey\" prop or set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.\nExample (.env.local): NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...`}
        />
        {fallbackManualEntry && (
          <ManualLatLngEntry
            value={markerPos}
            onChange={setMarkerPos}
            onConfirm={commitLocation}
            confirmLabel={confirmLabel}
          />
        )}
      </div>
    );
  }

  // We render APIProvider even if Places fails; map can still show.
  return (
    <APIProvider
      apiKey={effectiveKey!}
      libraries={['places']}
      onError={(e: unknown) => setLoadErrorMessage((e as Error)?.message || String(e))}
    >
      <div className="space-y-3">
        {/* Search input using Places Autocomplete when available */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search address or place…"
          className="w-full rounded-xl border px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />

        {/* If the API load failed (e.g., InvalidKeyMapError), show help & optional fallback */}
        {loadErrorMessage && (
          <div className="space-y-4">
            <TroubleshootPanel
              title="Failed to load Google Maps or Places."
              details={loadErrorMessage}
            />
            {fallbackManualEntry && (
              <ManualLatLngEntry
                value={markerPos}
                onChange={setMarkerPos}
                onConfirm={commitLocation}
                confirmLabel={confirmLabel}
              />
            )}
          </div>
        )}

        {/* Map + draggable AdvancedMarker */}
        {!loadErrorMessage && (
          <div className={className}>
            <Map
              mapId="de72253cc965ac28fafcffde"
              center={markerPos}
              zoom={mapZoom}
              onZoomChanged={(ev) => {
                const newZoom = (ev?.detail?.zoom as number) ?? mapZoom;
                setMapZoom(newZoom);
              }}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
            >
              <AdvancedMarker position={markerPos} draggable={true} onDragEnd={onMarkerDragEnd}>
                <Pin background={'#4f46e5'} borderColor={'#4338ca'} glyphColor={'#fff'} />
              </AdvancedMarker>
            </Map>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <div>
              <span className="font-medium">Lat:</span>{' '}
              {Number.isFinite(markerPos.lat) ? markerPos.lat.toFixed(6) : '—'}
            </div>
            <div>
              <span className="font-medium">Lng:</span>{' '}
              {Number.isFinite(markerPos.lng) ? markerPos.lng.toFixed(6) : '—'}
            </div>
          </div>
          <button
            type="button"
            onClick={commitLocation}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-500 focus:outline-none"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </APIProvider>
  );
}
