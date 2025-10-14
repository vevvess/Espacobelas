/**
 * Handles Notion OAuth callback, exchanges code for access token,
 * stores it in httpOnly cookie and redirects back to app.
 *
 * Env required:
 * - NOTION_CLIENT_ID
 * - NOTION_CLIENT_SECRET
 * - NOTION_REDIRECT_URI (optional; will infer from request if missing)
 */
module.exports = async function (req, res) {
  try {
    const clientId = process.env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      res.status(500).send("NOTION_CLIENT_ID/SECRET não configurados");
      return;
    }

    const { code, state } = req.query;
    if (!code) {
      res.status(400).send("Código OAuth ausente");
      return;
    }

    const proto =
      req.headers["x-forwarded-proto"] ||
      (req.connection && req.connection.encrypted ? "https" : "http") ||
      "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const defaultRedirect = `${proto}://${host}/api/notion/callback`;
    const redirectUri =
      process.env.NOTION_REDIRECT_URI && process.env.NOTION_REDIRECT_URI.trim().length > 0
        ? process.env.NOTION_REDIRECT_URI
        : defaultRedirect;

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // Exchange code
    const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basic}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const msg = await tokenRes.text();
      res.status(500).send(`Falha ao trocar código por token: ${msg}`);
      return;
    }

    const tokenJson = await tokenRes.json();

    // Store token in HttpOnly cookie (30 days)
    const token = tokenJson?.access_token;
    const workspace_id = tokenJson?.workspace_id || "";
    const bot_id = tokenJson?.bot_id || "";

    if (!token) {
      res.status(500).send("Token não retornado pelo Notion");
      return;
    }

    const cookieParts = [
      `notion_token=${encodeURIComponent(token)}`,
      "HttpOnly",
      "Path=/",
      "SameSite=Lax",
      "Secure",
      "Max-Age=2592000", // 30 days
    ];

    // Also store meta (non-HttpOnly) for quick status UI (optional)
    const metaParts = [
      `notion_meta=${encodeURIComponent(
        JSON.stringify({ workspace_id, bot_id, ts: Date.now() })
      )}`,
      "Path=/",
      "SameSite=Lax",
      "Secure",
      "Max-Age=2592000",
    ];

    res.setHeader("Set-Cookie", [cookieParts.join("; "), metaParts.join("; ")]);

    // Redirect back
    let redirectAfter = "/#/clientes?notion=connected";
    try {
      if (state) {
        const parsed = JSON.parse(decodeURIComponent(state));
        if (parsed?.redirectAfter) redirectAfter = parsed.redirectAfter;
      }
    } catch {}

    res.writeHead(302, { Location: redirectAfter });
    res.end();
  } catch (e) {
    res.status(500).send(`Erro no callback do Notion: ${e?.message || e}`);
  }
};