import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const mod = await import("./dist/server/server.js");
const fetchHandler = mod.default?.fetch ?? mod.fetch;

const clientDir = join(process.cwd(), "dist", "client");

const MIME_TYPES = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const port = parseInt(process.env.PORT || "8080", 10);
const host = process.env.HOST || "0.0.0.0";

async function serveStatic(urlPath) {
  const filePath = join(clientDir, urlPath);
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      const data = await readFile(filePath);
      const ext = extname(filePath);
      return new Response(data, {
        status: 200,
        headers: {
          "content-type": MIME_TYPES[ext] || "application/octet-stream",
          "cache-control": ext === ".js" || ext === ".css"
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600",
        },
      });
    }
  } catch {}
  return null;
}

const server = createServer(async (req, res) => {
  res.on("error", () => {});
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const headers = Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v])
    );

    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks);
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const response = await fetchHandler(request);

    if (response.status === 404) {
      const staticResponse = await serveStatic(url.pathname);
      if (staticResponse) {
        res.writeHead(staticResponse.status, Object.fromEntries(staticResponse.headers.entries()));
        const body = await staticResponse.arrayBuffer();
        res.end(Buffer.from(body));
        return;
      }
    }

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        res.end();
      }
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Server error:", err);
    if (!res.headersSent) res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Frontend listening on http://${host}:${port}`);
});
