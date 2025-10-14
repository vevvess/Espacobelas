/**
 * Returns a database info including properties to help field mapping.
 * GET /api/notion/database?id=<database_id>
 */
module.exports = async function (req, res) {
  try {
    const token = getTokenFromCookie(req);
    if (!token) {
      res.status(401).json({ error: "Notion não conectado" });
      return;
    }
    const id = (req.query.id || "").toString().trim();
    if (!id) {
      res.status(400).json({ error: "Parâmetro 'id' obrigatório" });
      return;
    }

    const r = await fetch(`https://api.notion.com/v1/databases/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!r.ok) {
      const msg = await r.text();
      res.status(500).json({ error: `Falha ao obter database: ${msg}` });
      return;
    }

    const j = await r.json();
    const props = j.properties || {};
    const properties = Object.keys(props).map((name) => {
      const p = props[name];
      return {
        name,
        type: p.type,
      };
    });

    res.status(200).json({
      id: j.id,
      title:
        (j.title || [])
          .map((t) => t.plain_text)
          .join("")
          .trim() || "(Sem título)",
      properties,
    });
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