/**
 * Redirects the user to Notion OAuth authorize endpoint.
 * Requires NOTION_CLIENT_ID and NOTION_REDIRECT_URI (optional) envs.
 */
module.exports = async function (req, res) {
  try {
    const clientId = process.env.NOTION_CLIENT_ID;
    if (!clientId) {
      res.status(500).send("NOTION_CLIENT_ID não configurado");
      return;
    }

    // Try to build redirect URI from env or current request
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

    const state = encodeURIComponent(
      JSON.stringify({
        t: Date.now(),
        redirectAfter: req.query.redirectAfter || "/#/clientes?notion=connected",
      })
    );

    const authUrl =
      "https://api.notion.com/v1/oauth/authorize" +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&response_type=code` +
      `&owner=user` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (e) {
    res.status(500).send(`Erro ao iniciar OAuth com Notion: ${e?.message || e}`);
  }
};