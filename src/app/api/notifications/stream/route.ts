// SSE Route Handler (src/app/api/notifications/stream/route.ts)

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Example: Polling the DB or a Redis Pub/Sub for new notifications
      const interval = setInterval(() => {
        const data = JSON.stringify({ message: "New update available", time: new Date() });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }, 5000);

      req.signal.onabort = () => {
        clearInterval(interval);
        controller.close();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}