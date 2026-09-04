"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
type View = Point & { zoom: number };
type DragState = { startX: number; startY: number; origin: Point; moved: boolean };

export default function MapView({ listings, title }: { listings: Listing[]; title: string }) {
  const pins = useMemo(
    () => listings.filter((l) => typeof l.latitude === "number" && typeof l.longitude === "number"),
    [listings]
  );

  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  // Null until the visitor pans or zooms; the view is derived from the pins
  // until then, so there is no state to synchronise when the box is measured.
  const [userView, setUserView] = useState<View | null>(null);
  const drag = useRef<DragState | null>(null);
  const teardown = useRef<(() => void) | null>(null);

  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    const measure = () => setSize({ w: node.clientWidth, h: node.clientHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Drop any in-flight drag listeners if the map unmounts mid-gesture.
  useEffect(() => () => teardown.current?.(), []);

  // The view that frames every pin inside the measured box.
  const fitted = useMemo<View | null>(() => {
    if (!pins.length || !size || size.w < 50) return null;
    const lats = pins.map((p) => p.latitude as number);
    const lngs = pins.map((p) => p.longitude as number);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    let zoom = MIN_ZOOM;
    for (let z = MAX_ZOOM; z >= MIN_ZOOM; z--) {
      const spanX = Math.abs(lngToWorldX(maxLng, z) - lngToWorldX(minLng, z));
      const spanY = Math.abs(latToWorldY(minLat, z) - latToWorldY(maxLat, z));
      if (spanX < size.w * 0.82 && spanY < size.h * 0.72) {
        zoom = z;
        break;
      }
    }
    return {
      zoom,
      x: lngToWorldX((minLng + maxLng) / 2, zoom),
      y: latToWorldY((minLat + maxLat) / 2, zoom),
    };
  }, [pins, size]);

  const view = userView ?? fitted;
  const ready = view !== null && size !== null;

  const changeZoom = (delta: number) => {
    if (!view) return;
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.zoom + delta));
    if (next === view.zoom) return;
    const scale = 2 ** (next - view.zoom);
    setUserView({ zoom: next, x: view.x * scale, y: view.y * scale });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!view) return;
    // The zoom buttons keep their own clicks.
    if ((e.target as Element).closest(".map-controls")) return;

    const state = {
      startX: e.clientX,
      startY: e.clientY,
      origin: { x: view.x, y: view.y },
      moved: false,
    };
    drag.current = state;

    // Listening on the window rather than capturing the pointer keeps the
    // gesture alive while tiles are replaced, and leaves pin clicks intact.
    const onMove = (event: PointerEvent) => {
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) state.moved = true;
      setUserView({ zoom: view.zoom, x: state.origin.x - dx, y: state.origin.y - dy });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      teardown.current = null;
      // Cleared after the click event, so a drag that ends on a pin does not
      // navigate to that listing.
      window.setTimeout(() => {
        if (drag.current === state) drag.current = null;
      }, 0);
    };

    teardown.current = onUp;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const box = size ?? { w: 800, h: 420 };
  const zoom = view?.zoom ?? MIN_ZOOM;
  const originX = (view?.x ?? 0) - box.w / 2;
  const originY = (view?.y ?? 0) - box.h / 2;
  const worldTiles = 2 ** zoom;

  const tiles: { key: string; left: number; top: number; url: string }[] = [];
  if (ready) {
    const firstX = Math.floor(originX / TILE);
    const lastX = Math.floor((originX + box.w) / TILE);
    const firstY = Math.floor(originY / TILE);
    const lastY = Math.floor((originY + box.h) / TILE);
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
        onClickCapture={onClickCapture}
        onDragStart={(event) => event.preventDefault()}
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
            if (left < -120 || top < -60 || left > box.w + 120 || top > box.h + 60) return null;
            return (
              <Link
                key={pin.slug}
                className="map-pin"
                href={`/partners/${pin.slug}`}
                style={{ left, top }}
                draggable={false}
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
