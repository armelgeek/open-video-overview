"use client";

import { useProgress } from "@videooverview/sdk/useProgress";

interface ProgressExampleProps {
  eventId: string | null;
}

export function ProgressExample({ eventId }: ProgressExampleProps) {
  const { progress, message, status, isProcessing, isFailed, events } =
    useProgress(eventId, {
      onProgress: (event) => {
        console.log(`Progress: ${event.progress}% - ${event.message}`);
      },
      onComplete: (event) => {
        console.log("Completed!", event.data);
      },
      onError: (error) => {
        console.error("Failed:", error.message);
      },
    });

  if (!eventId) {
    return <div className="text-gray-500">No event ID provided</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isFailed
                ? "bg-red-500"
                : isProcessing
                  ? "bg-blue-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`${
              isFailed
                ? "text-red-600"
                : isProcessing
                  ? "text-blue-600"
                  : "text-green-600"
            }`}
          >
            {status}
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>

      {/* Event Timeline */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Activity</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {events.map((event, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-sm p-2 bg-gray-50 rounded"
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    event.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : event.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {event.progress}%
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate">{event.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      {events.length > 0 && events[events.length - 1].data && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Details</h3>
          <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-auto max-h-32">
            {JSON.stringify(events[events.length - 1].data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
