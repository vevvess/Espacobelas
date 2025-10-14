/**
 * Returns normalized clients from a Notion database.
 * GET /api/notion/clients?dbid=...&name=Name&phone=Phone&birth=Birthday
 */
module.exports = async function (req, res) {
  try {
    const token = getTokenFromCookie(req);
    if (!token) {
      res.status(401).json({ error: "Notion não conectado" });
      return;
    }
    const dbid = (req.query.dbid || "").toString().trim();
    const nameProp = (req.query.name || "").toString().trim();
    const phoneProp = (req.query.phone || "").toString().trim();
    const birthProp = (req.query.birth || "").toString().trim();

    if (!dbid || !nameProp) {
      res.status(400).json({ error: "Parâmetros obrigatórios: dbid e name" });
      return;
    }

    // Pagination loop
    let start_cursor = undefined;
    let all = [];
    for (let i = 0; i < 25; i++) {
      const body = {
        page_size: 100,
        start_cursor,
      };
      const r = await fetch(`https://api.notion.com/v1/databases/${dbid}/query`, {
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
        res.status(500).json({ error: `Query falhou: ${msg}` });
        return;
      }
      const j = await r.json();
      all = all.concat(j.results || []);
      if (j.has_more && j.next_cursor) start_cursor = j.next_cursor;
      else break;
    }

    // Extract helpers
    const getTitle = (prop) => {
      try {
        return (prop?.title || []).map((t) => t.plain_text).join("").trim();
      } catch {
        return "";
      }
    };
    const getText = (prop) => {
      try {
        if (!prop) return "";
        if (prop.type === "phone_number") return prop.phone_number || "";
        if (prop.type === "rich_text") return (prop.rich_text || []).map((t) => t.plain_text).join(" ").trim();
        if (prop.type === "title") return getTitle(prop);
        if (typeof prop === "string") return prop;
        return "";
      } catch {
        return "";
      }
    };
    const getDate = (prop) => {
      try {
        return (prop?.date?.start || "").slice(0, 10);
      } catch {
        return "";
      }
    };

    const items = all.map((p) => {
      const props = p.properties || {};
      const name = props[nameProp] ? getTitle(props[nameProp]) || getText(props[nameProp]) : "";
      const phone = phoneProp && props[phoneProp] ? getText(props[phoneProp]) : "";
      const birth = birthProp && props[birthProp] ? getDate(props[birthProp]) : "";
      return {
        id: p.id,
        name,
        phone,
        birthdate: birth,
      };
    }).filter((x) => x.name);

    res.status(200).json({ items, total: items.length });
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