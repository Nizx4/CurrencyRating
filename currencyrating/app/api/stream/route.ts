import { NextResponse } from "next/server";
import { makeSSEStream } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET() {
  const stream = makeSSEStream();
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      Connection: "keep-alive",
    },
  });
}
