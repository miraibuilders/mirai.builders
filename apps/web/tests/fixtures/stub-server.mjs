import { readFileSync } from "node:fs";
import http from "node:http";

const mode = process.argv[2];

function json(res, status, value) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(value));
}

if (mode === "indexnow") {
  let hits = [];
  http
    .createServer((req, res) => {
      if (req.method === "GET" && req.url === "/_health") {
        json(res, 200, { ok: true });
        return;
      }
      if (req.method === "GET" && req.url === "/_hits") {
        json(res, 200, hits);
        return;
      }
      if (req.method === "POST" && req.url === "/_reset") {
        hits = [];
        json(res, 200, { ok: true });
        return;
      }
      if (req.method === "POST" && req.url === "/indexnow") {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
          try {
            hits.push(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch {
            hits.push({ raw: Buffer.concat(chunks).toString("utf8") });
          }
          json(res, 202, { ok: true });
        });
        return;
      }
      json(res, 404, { error: "not found" });
    })
    .listen(4010, "127.0.0.1");
} else if (mode === "scanner") {
  const html = readFileSync("state/fixtures/hardening/scanner-target.html", "utf8");
  http
    .createServer((req, res) => {
      if (req.method === "GET" && (req.url === "/" || req.url?.startsWith("/?"))) {
        res.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "x-powered-by": "PHP/7.4.33",
        });
        res.end(html);
        return;
      }
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
    })
    .listen(4020, "127.0.0.1");
} else {
  process.stderr.write("usage: stub-server.mjs indexnow|scanner\n");
  process.exit(1);
}
