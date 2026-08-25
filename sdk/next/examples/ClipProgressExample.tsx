"use client";

import { useProgress } from "@videooverview/sdk/useProgress";

interface ClipProgressExampleProps {
  eventId: string | null;
}

export function ClipProgressExample({ eventId }: ClipProgressExampleProps) {
  const { progress, message, status, events } = useProgress(eventId, {
    onProgress: (event) => {
      console.log(
        `[${event.data?.stage || "unknown"}] ${event.progress}% - ${event.message}`
      );
    },
  });

  if (!eventId) {
    return <div className="text-gray-500">No event ID provided</div>;
  }

  // Extract clip information from events
  const clipEvents = events.filter((e) => e.data?.stage !== "concatenate");
  const currentClip = clipEvents[clipEvents.length - 1]?.data;
  const clipsCompleted = currentClip?.clipsCompleted || 0;
  const totalClips = currentClip?.totalClips || 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overall Progress */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold">Overall Progress</span>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
      </div>

      {/* Clips Progress */}
      {totalClips > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">
            Clips: {clipsCompleted}/{totalClips}
          </h3>

          <div className="space-y-3">
            {Array.from({ length: totalClips }, (_, i) => {
              const clipIndex = i + 1;
              const clipEvent = events.find(
                (e) => e.data?.clip === clipIndex
              );
              const isCompleted = clipIndex <= clipsCompleted;
              const isCurrent = clipIndex === clipsCompleted + 1;

              return (
                <div key={clipIndex} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Clip {clipIndex}: {clipEvent?.data?.clipTitle || "..."}
                    </span>
                    <span className="text-xs text-gray-500">
                      {isCompleted
                        ? "✓ Complete"
                        : isCurrent
                          ? "Processing..."
                          : "Pending"}
                    </span>
                  </div>

                  {/* Sub-stages */}
                  {isCurrent && (
                    <div className="ml-4 space-y-2 text-xs">
                      {["image", "audio", "combine"].map((stage) => {
                        const stageEvent = events.find(
                          (e) =>
                            e.data?.clip === clipIndex &&
                            e.data?.stage === stage
                        );
                        const isDone = stageEvent !== undefined;

                        return (
                          <div
                            key={stage}
                            className="flex items-center gap-2 text-gray-600"
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${
                                isDone ? "bg-green-500" : "bg-gray-300"
                              }`}
                            />
                            <span className="capitalize">{stage}</span>
                            {stageEvent && (
                              <span className="text-gray-400">
                                ({stageEvent.progress}%)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Progress bar */}
                  <div
                    className={`h-2 rounded-full ${
                      isCompleted
                        ? "bg-green-500"
                        : isCurrent
                          ? "bg-blue-500"
                          : "bg-gray-200"
                    } transition-all`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Log */}
      {events.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Activity Log</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...events].reverse().map((event, idx) => (
              <div key={idx} className="text-xs p-2 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    {event.data?.stage ? `[${event.data.stage.toUpperCase()}]` : ""}{" "}
                    {event.message}
                  </span>
                  <span className="text-gray-500">{event.progress}%</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex gap-4">
        {status === "completed" && (
          <div className="flex-1 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <p className="font-medium">✓ Video generation complete!</p>
          </div>
        )}

        {status === "failed" && (
          <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">✗ Generation failed</p>
          </div>
        )}
      </div>
    </div>
  );
}
