/**
 * Lists databases available to the authorized Notion integration (via cookie token).
 */
module.exports = async function (req, res) {
  try {
    const token = getTokenFromCookie(req);
    if (!token) {
      res.status(401).json({ error: "Notion não conectado" });
      return;
    }

    const body = {
      page_size: 100,
      filter: { property: "object", value: "database" },
      sort: { direction: "ascending", timestamp: "last_edited_time" },
    };

    const r = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const msg = await r.text();
      res.status(500).json({ error: `Falha ao buscar databases: ${msg}` });
      return;
    }

    const j = await r.json();
    const items = (j.results || [])
      .filter((x) => x.object === "database")
      .map((db) => ({
        id: db.id,
        title:
          (db.title || [])
            .map((t) => t.plain_text)
            .join("")
            .trim() || "(Sem título)",
        last_edited_time: db.last_edited_time,
      }));

    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) });
  }
};

function getTokenFromCookie(req) {
  const cookies = (req.headers.cookie || "")
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean);
  const tokenCookie = cookies.find((c) => c.startsWith("notion_token="));
  if (!tokenCookie) return null;
  try {
    return decodeURIComponent(tokenCookie.split("=")[1]);
  } catch {
    return null;
  }
}