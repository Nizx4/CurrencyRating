import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    // 1) Fetch latest external 30d stats via our internal adapter
    const statsRes = await fetch(`${origin}/api/stats/30d`, { cache: "no-store" });
    if (!statsRes.ok) {
      return NextResponse.json({ error: `stats ${statsRes.status}` }, { status: 502 });
    }
    const { changes, date } = (await statsRes.json()) as { changes: Record<string, number>; date: string };

    // 2) Transform into dataset updates: send only 30d change + last_updated (leave score untouched)
    const payload = Object.entries(changes).map(([code, score_change_30d]) => ({
      code,
      score_change_30d,
      last_updated: date,
    }));

    // 3) POST to currencies API to merge + broadcast
    const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "";
    const postRes = await fetch(`${origin}/api/currencies`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": token },
      body: JSON.stringify(payload),
    });
    if (!postRes.ok) {
      const j = await postRes.json().catch(() => ({}));
      return NextResponse.json({ error: j.error || `update ${postRes.status}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true, updated: payload.length, date }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
