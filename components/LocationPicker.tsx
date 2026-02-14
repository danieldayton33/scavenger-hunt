'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Button } from './ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { BASE_CIRCLE_CONFIG } from '@/lib/constants/mapConstants';

export type LatLng = { lat: number; lng: number };

function getGoogleMapsKey(explicit?: string): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return explicit || fromEnv;
}

type LocationPickerProps = {
  apiKey?: string;
  latField?: string;
  lngField?: string;
  accuracyField?: string;
  initialPosition?: LatLng;
  randomizedCircle?: {
    center: { lat: number; lng: number };
    radius: number;
  } | null;
  className?: string;
};

export function LocationPicker(props: LocationPickerProps) {
  const { apiKey, initialPosition, randomizedCircle, ...restProps } = props;
  const effectiveKey = getGoogleMapsKey(apiKey);

  if (!effectiveKey) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Google Maps API key is required for location picker.
      </div>
    );
  }

  return (
    <APIProvider apiKey={effectiveKey}>
      <LocationPickerBody
        {...restProps}
        initialPosition={initialPosition}
        randomizedCircle={randomizedCircle}
      />
    </APIProvider>
  );
}

function LocationPickerBody({
  latField = 'lat',
  lngField = 'lng',
  accuracyField = 'accuracyMeters',
  initialPosition,
  randomizedCircle: randomizedCircleProp,
  className = 'h-96 w-full rounded-2xl overflow-hidden shadow',
}: Omit<LocationPickerProps, 'apiKey'>) {
  const { setValue, getValues } = useFormContext();
  const [mapZoom, setMapZoom] = useState(14);
  const [markerPos, setMarkerPos] = useState<LatLng | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  // Use the randomized circle from props (calculated on server) - stable across renders
  const randomizedCircle = randomizedCircleProp;

  // Default center from form values, randomized circle, or fallback
  const defaultCenter = useMemo<LatLng>(() => {
    const lat = getValues(latField);
    const lng = getValues(lngField);
    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
    // Use randomized circle center if available, otherwise fallback
    if (randomizedCircle) {
      return randomizedCircle.center;
    }
    return initialPosition ?? { lat: 35.7796, lng: -78.6382 };
  }, [getValues, latField, lngField, initialPosition, randomizedCircle]);

  const map = useMap();

  // Create circle on map if we have a randomized position
  useEffect(() => {
    if (!map || !randomizedCircle) {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      return;
    }

    // Clean up existing circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // Create circle with randomized center
    const position = new google.maps.LatLng(
      randomizedCircle.center.lat,
      randomizedCircle.center.lng
    );
    const circle = new google.maps.Circle({
      ...BASE_CIRCLE_CONFIG,
      map: map,
      center: position,
      radius: randomizedCircle.radius,
      clickable: false,
    });

    circleRef.current = circle;

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, randomizedCircle]);

  const onMarkerDragEnd = useCallback(
    (ev: google.maps.MapMouseEvent) => {
      const { latLng } = ev || {};
      if (latLng?.lat && latLng?.lng) {
        const next = { lat: latLng.lat(), lng: latLng.lng() };
        setMarkerPos(next);
        setValue(latField, next.lat, { shouldDirty: true, shouldValidate: true });
        setValue(lngField, next.lng, { shouldDirty: true, shouldValidate: true });
        setLocationError(null);
      }
    },
    [setValue, latField, lngField]
  );

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setMarkerPos(location);
        setValue(latField, latitude, { shouldDirty: true, shouldValidate: true });
        setValue(lngField, longitude, { shouldDirty: true, shouldValidate: true });
        if (accuracyField && accuracy) {
          setValue(accuracyField, accuracy, { shouldDirty: true, shouldValidate: true });
        }
        if (map) {
          map.setCenter(location);
          map.setZoom(16);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        setLocationError(
          error.message || 'Failed to get your location. Please allow location access.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [setValue, latField, lngField, accuracyField, map]);

  // Watch for map clicks to move marker (only set marker on click, not initially)
  const handleMapClick = useCallback(
    (ev: MapMouseEvent) => {
      const { detail } = ev || {};
      const { latLng } = detail || {};
      if (latLng?.lat && latLng?.lng) {
        const next = { lat: latLng.lat, lng: latLng.lng };
        setMarkerPos(next);
        setValue(latField, next.lat, { shouldDirty: true, shouldValidate: true });
        setValue(lngField, next.lng, { shouldDirty: true, shouldValidate: true });
        setLocationError(null);
      }
    },
    [setValue, latField, lngField]
  );

  // Use marker position if set, otherwise use default center (for map centering)
  const currentPos = markerPos || defaultCenter;
  // Only show coordinates if marker is set to avoid hydration mismatch with randomized circle
  const displayPos = markerPos || (randomizedCircle ? null : defaultCenter);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {displayPos ? (
              <>
                <span>
                  <span className="font-medium">Lat:</span>{' '}
                  {Number.isFinite(displayPos.lat) ? displayPos.lat.toFixed(6) : '—'}
                </span>
                <span>
                  <span className="font-medium">Lng:</span>{' '}
                  {Number.isFinite(displayPos.lng) ? displayPos.lng.toFixed(6) : '—'}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Click on the map to set your location</span>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
        >
          <Navigation className="mr-2 h-4 w-4" />
          {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
        </Button>
      </div>

      {locationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {locationError}
        </div>
      )}

      <div className={className}>
        <Map
          mapId="de72253cc965ac28fafcffde"
          center={currentPos}
          zoom={mapZoom}
          onZoomChanged={(ev) => {
            const newZoom = (ev?.detail?.zoom as number) ?? mapZoom;
            setMapZoom(newZoom);
          }}
          onClick={handleMapClick}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          {markerPos && (
            <AdvancedMarker position={markerPos} draggable={true} onDragEnd={onMarkerDragEnd}>
              <Pin background={'#4f46e5'} borderColor={'#4338ca'} glyphColor={'#fff'} />
            </AdvancedMarker>
          )}
        </Map>
      </div>

      <p className="text-xs text-gray-500">
        Click on the map or drag the pin to set your location. You can also use your current
        location.
      </p>
    </div>
  );
}
