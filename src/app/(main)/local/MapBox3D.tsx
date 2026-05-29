"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapBox3D({ lat, lng, token }: { lat: number; lng: number; token: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [lng, lat],
      zoom: 15.5,
      pitch: 60,
      bearing: -20,
      antialias: true,
    });

    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      new mapboxgl.Marker({ color: "#C98418" })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    return () => map.remove();
  }, [lat, lng, token]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
