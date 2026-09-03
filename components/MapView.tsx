"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Listing } from "@/lib/listings";

const TILE = 256;
const MIN_ZOOM = 4;
const MAX_ZOOM = 17;

function lngToWorldX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * TILE * 2 ** zoom;
}

function latToWorldY(lat: number, zoom: number) {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const rad = (clamped * Math.PI) / 180;
  const y = Math.log(Math.tan(rad) + 1 / Math.cos(rad));
  return (1 - y / Math.PI) / 2 * TILE * 2 ** zoom;
}

type Point = { x: number; y: number };

export default function MapView({ listings, title }: { listings: Listing[]; title: string }) {
  const pins = useMemo(
    () => listings.filter((l) => typeof l.latitude === "number" && typeof l.longitude === "number"),
    [listings]
  );

  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 420 });
  const [zoom, setZoom] = useState(9);
  const [center, setCenter] = useState<Point>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const drag = useRef<{ startX: number; startY: number; origin: Point } | null>(null);

  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    const measure = () => setSize({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Fit the viewport to the listings the first time we know the box size.
  useEffect(() => {
    if (ready || !pins.length || size.w < 50) return;
    const lats = pins.map((p) => p.latitude as number);
    const lngs = pins.map((p) => p.longitude as number);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    let best = MIN_ZOOM;
    for (let z = MAX_ZOOM; z >= MIN_ZOOM; z--) {
      const spanX = Math.abs(lngToWorldX(maxLng, z) - lngToWorldX(minLng, z));
      const spanY = Math.abs(latToWorldY(minLat, z) - latToWorldY(maxLat, z));
      if (spanX < size.w * 0.82 && spanY < size.h * 0.72) {
        best = z;
        break;
      }
    }
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    setZoom(best);
    setCenter({ x: lngToWorldX(midLng, best), y: latToWorldY(midLat, best) });
    setReady(true);
  }, [pins, size, ready]);

  const changeZoom = useCallback(
    (delta: number) => {
      setZoom((z) => {
        const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta));
        if (next === z) return z;
        setCenter((c) => ({ x: c.x * 2 ** (next - z), y: c.y * 2 ** (next - z) }));
        return next;
      });
    },
    []
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, origin: center };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setCenter({ x: drag.current.origin.x - dx, y: drag.current.origin.y - dy });
  };

  const endDrag = () => {
    drag.current = null;
  };

  const originX = center.x - size.w / 2;
  const originY = center.y - size.h / 2;
  const worldTiles = 2 ** zoom;

  const tiles: { key: string; left: number; top: number; url: string }[] = [];
  if (ready) {
    const firstX = Math.floor(originX / TILE);
    const lastX = Math.floor((originX + size.w) / TILE);
    const firstY = Math.floor(originY / TILE);
    const lastY = Math.floor((originY + size.h) / TILE);
    for (let x = firstX; x <= lastX; x++) {
      for (let y = firstY; y <= lastY; y++) {
        if (y < 0 || y >= worldTiles) continue;
        const wrappedX = ((x % worldTiles) + worldTiles) % worldTiles;
        tiles.push({
          key: `${zoom}-${x}-${y}`,
          left: x * TILE - originX,
          top: y * TILE - originY,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        });
      }
    }
  }

  if (!pins.length) {
    return (
      <div className="map-panel">
        <p className="map-credit">No map coordinates are available for these listings yet.</p>
      </div>
    );
  }

  return (
    <div className="map-panel">
      <div
        className="map-canvas"
        ref={boxRef}
        role="application"
        aria-label={`Map of ${title}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            className="map-tile"
            src={tile.url}
            alt=""
            width={TILE}
            height={TILE}
            loading="lazy"
            draggable={false}
            style={{ left: tile.left, top: tile.top }}
            onError={(event) => {
              // A tile that fails to load should stay invisible rather than
              // showing a broken image icon over the map.
              event.currentTarget.style.visibility = "hidden";
            }}
          />
        ))}

        {ready &&
          pins.map((pin, index) => {
            const left = lngToWorldX(pin.longitude as number, zoom) - originX;
            const top = latToWorldY(pin.latitude as number, zoom) - originY;
            if (left < -120 || top < -60 || left > size.w + 120 || top > size.h + 60) return null;
            return (
              <Link
                key={pin.slug}
                className="map-pin"
                href={`/partners/${pin.slug}`}
                style={{ left, top }}
                title={`${pin.name} — ${pin.fullAddress}`}
              >
                {index + 1}. {pin.name.length > 26 ? `${pin.name.slice(0, 26)}…` : pin.name}
              </Link>
            );
          })}

        <div className="map-controls">
          <button type="button" onClick={() => changeZoom(1)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => changeZoom(-1)} aria-label="Zoom out">&minus;</button>
        </div>
      </div>
      <p className="map-credit">
        Map data &copy;{" "}
        <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer" target="_blank">
          OpenStreetMap
        </a>{" "}
        contributors. Drag to pan, use the buttons to zoom, and select a pin to open that listing.
      </p>
    </div>
  );
}
