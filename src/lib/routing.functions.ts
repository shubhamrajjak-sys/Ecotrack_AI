import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RouteInput = z.object({
  origin: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  originLatLng: z.object({ lat: z.number(), lng: z.number() }).nullable(),
});

export type RouteResult =
  | { status: "not_configured"; provider: "google_routes"; envVar: string }
  | { status: "ok"; distanceKm: number; durationMin: number; provider: string }
  | { status: "error"; message: string };

/**
 * Real routing distance. Architecture-ready for Google Maps Routes API (or any
 * configured provider). Without a key we return an explicit "not configured"
 * state — we never fabricate a distance.
 */
export const getRouteDistance = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RouteInput.parse(input))
  .handler(async ({ data }): Promise<RouteResult> => {
    const apiKey = process.env["GOOGLE_ROUTES_API_KEY"];
    if (!apiKey) {
      return { status: "not_configured", provider: "google_routes", envVar: "GOOGLE_ROUTES_API_KEY" };
    }

    try {
      const res = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
          },
          body: JSON.stringify({
            origin: data.originLatLng
              ? { location: { latLng: { latitude: data.originLatLng.lat, longitude: data.originLatLng.lng } } }
              : { address: data.origin },
            destination: { address: data.destination },
            travelMode: "DRIVE",
          }),
        },
      );

      if (!res.ok) {
        return { status: "error", message: `Routing provider returned ${res.status}` };
      }

      const json = (await res.json()) as {
        routes?: { distanceMeters?: number; duration?: string }[];
      };
      const route = json.routes?.[0];
      if (!route?.distanceMeters) {
        return { status: "error", message: "No route found between those points." };
      }

      return {
        status: "ok",
        distanceKm: Math.round((route.distanceMeters / 1000) * 10) / 10,
        durationMin: Math.round(parseInt(route.duration ?? "0", 10) / 60),
        provider: "Google Maps Routes API",
      };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Routing request failed",
      };
    }
  });
