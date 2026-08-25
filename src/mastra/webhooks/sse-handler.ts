/**
 * Server-Sent Events (SSE) handler for real-time progress updates
 */

import type { Request, Response } from "express";
import { progressTracker, type ProgressEvent } from "./progress-tracker";

export function setupSSEEndpoint(app: any) {
  // SSE endpoint for subscribing to progress updates
  app.get("/api/progress/:eventId", (req: Request, res: Response) => {
    const { eventId } = req.params;

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    console.log(`[SSE] Client connected for event: ${eventId}`);

    // Send initial connection message
    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        message: "Connected to progress stream",
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    // Get progress history and send immediately
    const history = progressTracker.getHistory(eventId);
    history.forEach((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    // Subscribe to future updates
    const unsubscribe = progressTracker.subscribe(eventId, (progress) => {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    });

    // Handle client disconnect
    req.on("close", () => {
      unsubscribe();
      console.log(`[SSE] Client disconnected for event: ${eventId}`);
    });

    // Handle errors
    req.on("error", () => {
      unsubscribe();
    });
  });

  // REST endpoint to get progress
  app.get("/api/progress/:eventId/status", (req: Request, res: Response) => {
    const { eventId } = req.params;
    const lastEvent = progressTracker.getLastEvent(eventId);

    if (!lastEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(lastEvent);
  });

  // REST endpoint to get history
  app.get("/api/progress/:eventId/history", (req: Request, res: Response) => {
    const { eventId } = req.params;
    const history = progressTracker.getHistory(eventId);

    res.json({
      eventId,
      events: history,
      latest: history[history.length - 1] || null,
    });
  });

  // REST endpoint to list active events
  app.get("/api/progress/active", (_req: Request, res: Response) => {
    const active = progressTracker.getActive();
    const events = Array.from(active.values());

    res.json({
      count: events.length,
      events,
    });
  });

  console.log("[SSE] Progress endpoints registered:");
  console.log("  GET  /api/progress/:eventId (SSE stream)");
  console.log("  GET  /api/progress/:eventId/status");
  console.log("  GET  /api/progress/:eventId/history");
  console.log("  GET  /api/progress/active");
}
