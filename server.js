// Streamer Reader palīgprogramma. Vajadzīgs Node.js 22 vai jaunāks.
// Run:  node server.js   then open http://localhost:3000
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const PORT = process.env.PORT || 3000;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

async function postJson(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "user-agent": UA }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${url} answered ${r.status}`);
  return r.json();
}
async function getToken(clientId) {
  const j = await postJson("https://web.kick.com/api/v1/realtime/auth/connection", { client_id: clientId });
  return j.data.token;
}
async function bootstrap() {
  const clientId = crypto.randomUUID();
  const j = await postJson("https://web.kick.com/api/v1/realtime/connection", {
    client: { id: clientId, type: "web" }, capabilities: { accepted_providers: [{ provider: "centrifugo" }] },
  });
  const url = j.data.connections[0].credentials.url;
  return { clientId, url, token: await getToken(clientId) };
}

// One Kick connection per browser tab. Calls send(obj) for status and chat events.
function followChat(room, send, isAlive) {
  let ws = null, timers = [], nextId = 3;
  const clear = () => { timers.forEach(clearTimeout); timers = []; };

  async function start() {
    if (!isAlive()) return;
    send({ type: "status", text: "Savienojas ar Kick…" });
    let b;
    try { b = await bootstrap(); }
    catch (e) { send({ type: "status", level: "bad", text: `Neizdevās sasniegt Kick (${e.message}). Mēģina vēlreiz…` }); return retry(); }

    ws = new WebSocket(b.url);                        // Node sends no Origin header, which Kick accepts
    let lastFrame = Date.now();
    const watchdog = setInterval(() => { if (Date.now() - lastFrame > 45000) ws.close(); }, 10000);

    ws.onopen = () => ws.send(JSON.stringify({ connect: { token: b.token, name: "js" }, id: 1 }));
    ws.onmessage = async ev => {
      lastFrame = Date.now();
      for (const line of String(ev.data).split("\n")) {
        if (!line.trim()) continue;
        if (line.trim() === "{}") { ws.send("{}"); continue; }   // answer the server ping
        let m; try { m = JSON.parse(line); } catch { continue; }
        if (m.id === 1 && m.connect) {
          ws.send(JSON.stringify({ subscribe: { channel: `chatrooms.${room}.v2` }, id: 2 }));
          const ttl = (m.connect.ttl || 2700) * 800;     // refresh at 80% of token life
          timers.push(setTimeout(refresh, ttl));
        } else if (m.id === 2 && m.subscribe) {
          send({ type: "status", level: "ok", text: `Savienots. Gaida čata ziņas…` });
        } else if (m.error) {
          send({ type: "status", level: "bad", text: `Kick noraidīja pieprasījumu: ${JSON.stringify(m.error)}` });
        } else if (m.push && m.push.pub && m.push.pub.data) {
          const d = m.push.pub.data;
          if (d.event === "App\\Events\\ChatMessageEvent") {
            try { send({ type: "chat", data: typeof d.data === "string" ? JSON.parse(d.data) : d.data }); } catch {}
          }
        }
      }
    };
    async function refresh() {
      if (!isAlive() || !ws || ws.readyState !== 1) return;
      try {
        const token = await getToken(b.clientId);
        ws.send(JSON.stringify({ refresh: { token }, id: nextId++ }));
        timers.push(setTimeout(refresh, 2700 * 800));
      } catch { ws.close(); }
    }
    ws.onclose = () => { clearInterval(watchdog); clear(); if (isAlive()) { send({ type: "status", level: "bad", text: "Savienojums pārtrūka. Savienojas vēlreiz…" }); retry(); } };
    ws.onerror = () => {};
  }
  function retry() { timers.push(setTimeout(start, 3000)); }
  start();
  return () => { clear(); if (ws) { ws.onclose = null; try { ws.close(); } catch {} } };
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);
  if (u.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(fs.readFileSync(path.join(__dirname, "index.html")));
  }
  if (u.pathname === "/lookup") {
    try {
      const r = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(u.searchParams.get("slug"))}`, { headers: { "user-agent": UA, accept: "application/json" } });
      const j = await r.json();
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ id: j && j.chatroom && j.chatroom.id }));
    } catch { res.writeHead(200, { "content-type": "application/json" }); return res.end("{}"); }
  }
  if (u.pathname === "/tts") {
    // Online text to speech so Latvian works in any browser (uses Google Translate's public voice, unofficial)
    try {
      const text = (u.searchParams.get("q") || "").slice(0, 200);
      const lang = (u.searchParams.get("lang") || "lv").replace(/[^a-z-]/gi, "");
      const r = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`, { headers: { "user-agent": UA } });
      if (!r.ok) throw new Error("tts " + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      res.writeHead(200, { "content-type": "audio/mpeg", "content-length": buf.length });
      return res.end(buf);
    } catch { res.writeHead(502); return res.end(); }
  }
  if (u.pathname === "/events") {
    const room = (u.searchParams.get("room") || "").replace(/\D/g, "");
    if (!room) { res.writeHead(400); return res.end(); }
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
    let alive = true;
    const stop = followChat(room, o => res.write(`data: ${JSON.stringify(o)}\n\n`), () => alive);
    req.on("close", () => { alive = false; stop(); });
    return;
  }
  res.writeHead(404); res.end();
});

function start(port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, () => resolve(server.address().port));
  });
}
module.exports = { start };
if (require.main === module) {
  start(PORT).then(p => console.log(`Streamer Reader darbojas. Atver http://localhost:${p} pārlūkā Chrome vai Edge.`));
}
