export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const matchId = String(req.query.matchId || "161285");
  if (!/^[0-9]{1,12}$/.test(matchId)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({ error: "Invalid match ID" });
  }
  const refresh = Math.min(300, Math.max(15, Number(req.query.refresh) || 30));
  try {
    const headers = { Accept: "application/json" };
    if (process.env.CRICKET_API_BYPASS_SECRET) headers["x-vercel-protection-bypass"] = process.env.CRICKET_API_BYPASS_SECRET;
    if (process.env.CRICKET_API_TOKEN) headers.Authorization = "Bearer " + process.env.CRICKET_API_TOKEN;
    const upstream = await fetch(`https://boundary-cricket-fitness-5d74.vercel.app/api/match/${matchId}`, {
      headers,
      signal: AbortSignal.timeout(12000)
    });
    if (!upstream.ok) {
      res.setHeader("Cache-Control", "no-store");
      if (upstream.status === 401 || upstream.status === 403) {
        return res.status(502).json({ error: "The cricket score API requires access authorization. Make the endpoint public or configure CRICKET_API_BYPASS_SECRET / CRICKET_API_TOKEN in BoundaryLive's Vercel environment." });
      }
      return res.status(502).json({ error: "Score source returned HTTP " + upstream.status });
    }
    const data = await upstream.json();
    if (!data || !data.match_header || data.status !== "success") {
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "Score source returned an unexpected response" });
    }
    const cache = `public, s-maxage=${refresh}, stale-while-revalidate=${refresh * 2}`;
    res.setHeader("Cache-Control", cache);
    res.setHeader("CDN-Cache-Control", cache);
    res.setHeader("Vercel-CDN-Cache-Control", cache);
    return res.status(200).json({ data, fetchedAt: new Date().toISOString() });
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "Unable to reach the cricket score source" });
  }
}
