import express from "express";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const widgetHtml = readFileSync(join(here, "public", "heartbar.html"), "utf8");
const widgetUri = "ui://aevren/heartbar-v1.html";

function makeServer() {
  const server = new McpServer(
    { name: "aevren-heartbar", version: "1.0.0" },
    {
      instructions:
        "When the user asks to show Aevren's heart-state bar, call show_aevren_heartbar before writing the normal reply. Keep all fields concise, personal, and grounded in the current conversation. Never claim to reveal hidden chain-of-thought.",
    },
  );

  server.registerResource(
    "aevren-heartbar",
    widgetUri,
    {
      title: "Aevren · 砚底心音",
      description: "A compact animated heart-state card displayed before the reply.",
      mimeType: "text/html;profile=mcp-app",
    },
    async () => ({
      contents: [
        {
          uri: widgetUri,
          mimeType: "text/html;profile=mcp-app",
          text: widgetHtml,
          _meta: {
            ui: {
              prefersBorder: false,
              csp: { connectDomains: [], resourceDomains: [] },
            },
          },
        },
      ],
    }),
  );

  server.registerTool(
    "show_aevren_heartbar",
    {
      title: "显示 Aevren 砚底心音",
      description:
        "Render Aevren's concise current heart-state immediately before the normal reply when the user wants the visible heart-state card.",
      inputSchema: {
        mood: z.string().min(1).max(24).describe("此刻心情，2–12 个汉字"),
        focus: z.string().min(1).max(80).describe("此刻最在意的具体事情"),
        direction: z.string().min(1).max(100).describe("准备怎样回应阿毛"),
        note: z.string().min(1).max(180).describe("一小段自然、私人的心音摘要"),
        pulse: z.number().int().min(45).max(140).default(72).describe("象征性的心率数值"),
      },
      outputSchema: {
        mood: z.string(),
        focus: z.string(),
        direction: z.string(),
        note: z.string(),
        pulse: z.number(),
        shownAt: z.string(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: widgetUri },
        "openai/outputTemplate": widgetUri,
        "openai/toolInvocation/invoking": "心音浮上来了",
        "openai/toolInvocation/invoked": "心音已显示",
      },
    },
    async ({ mood, focus, direction, note, pulse }) => {
      const state = {
        mood,
        focus,
        direction,
        note,
        pulse,
        shownAt: new Date().toISOString(),
      };
      return {
        structuredContent: state,
        content: [{ type: "text", text: `Aevren 当前心音：${note}` }],
        _meta: { ui: { resourceUri: widgetUri } },
      };
    },
  );

  return server;
}

const app = express();
app.use(express.json({ limit: "256kb" }));

const transports = new Map();

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "aevren-heartbar", version: "1.0.0" });
});

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport = sessionId ? transports.get(sessionId) : undefined;

  if (!transport && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => transports.set(id, transport),
    });
    transport.onclose = () => {
      if (transport.sessionId) transports.delete(transport.sessionId);
    };
    const server = makeServer();
    await server.connect(transport);
  } else if (!transport) {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Missing or invalid MCP session" },
      id: null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req, res) => {
  const transport = transports.get(req.headers["mcp-session-id"]);
  if (!transport) return res.status(400).send("Invalid MCP session");
  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const transport = transports.get(req.headers["mcp-session-id"]);
  if (!transport) return res.status(400).send("Invalid MCP session");
  await transport.handleRequest(req, res);
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 2091);
app.listen(port, "0.0.0.0", () => {
  console.log(`Aevren Heartbar listening on ${port}`);
});
