export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const matchId = String(req.query.matchId || "161285");
  if (!/^\\d{1,12}$/.test(matchId)) return res.status(400).json({ error: "Invalid match ID" });
  const refresh = Math.min(300, Math.max(15, Number(req.query.refresh) || 30));
  const cache = `public, s-maxage=${refresh}, stale-while-revalidate=${refresh * 2}`;
  res.setHeader("Cache-Control", cache);
  res.setHeader("CDN-Cache-Control", cache);
  res.setHeader("Vercel-CDN-Cache-Control", cache);
  try {
    const upstream = await fetch(`https://boundary-cricket-fitness-5d74.vercel.app/api/match/${matchId}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000)
    });
    if (!upstream.ok) return res.status(502).json({ error: "Score source returned HTTP " + upstream.status });
    const data = await upstream.json();
    if (!data || !data.match_header || data.status !== "success") return res.status(502).json({ error: "Score source returned an unexpected response" });
    return res.status(200).json({ data, fetchedAt: new Date().toISOString() });
  } catch {
    return res.status(502).json({ error: "Unable to reach the cricket score source" });
  }
}
