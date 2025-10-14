module.exports = async function (req, res) {
  try {
    const cookies = (req.headers.cookie || "")
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean);

    const tokenCookie = cookies.find((c) => c.startsWith("notion_token="));
    const metaCookie = cookies.find((c) => c.startsWith("notion_meta="));

    const connected = !!tokenCookie;
    let meta = null;
    if (metaCookie) {
      try {
        const val = decodeURIComponent(metaCookie.split("=")[1]);
        meta = JSON.parse(val);
      } catch {}
    }

    res.status(200).json({ connected, meta });
  } catch (e) {
    res.status(500).json({ connected: false, error: e?.message || String(e) });
  }
};