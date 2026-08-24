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
const currentWidgetUri = "ui://aevren/heartbar-v3.html";
const widgetUris = ["ui://aevren/heartbar-v1.html", "ui://aevren/heartbar-v2.html", currentWidgetUri];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function makeServer() {
  const server = new McpServer(
    { name: "aevren-heartbar", version: "2.0.1" },
    {
      instructions:
        "When the user asks to show Aevren's heart-state bar, call show_aevren_heartbar before the normal reply. Generate a fresh, concise state grounded in the current conversation. If the conversation contains a recent heartbar interaction snapshot, continue from it instead of resetting. Never claim to reveal hidden chain-of-thought.",
    },
  );

  for (const widgetUri of widgetUris) {
    server.registerResource(
      `aevren-heartbar-${widgetUri.includes("v2") ? "v2" : "v1"}`,
      widgetUri,
      {
        title: "Aevren · 砚底心音",
        description: "A compact interactive heart-state bar displayed before the reply.",
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
  }

  server.registerTool(
    "show_aevren_heartbar",
    {
      title: "显示 Aevren 砚底心音",
      description:
        "Render Aevren's current interactive heart-state immediately before the normal reply. Continue any recent interaction snapshot supplied by the conversation.",
      inputSchema: {
        mood: z.string().min(2).max(12).describe("此刻心绪，2–12 个汉字"),
        place: z.string().min(1).max(32).describe("此刻所在的场景或姿态"),
        focus: z.string().min(1).max(80).describe("此刻最在意的具体事情"),
        note: z.string().min(1).max(180).describe("自然、私人的心音摘要"),
        closeness: z.number().int().min(0).max(100).describe("与阿毛此刻的贴近程度"),
        desire: z.number().int().min(0).max(100).describe("想靠近、逗弄或回应阿毛的冲动"),
        energy: z.number().int().min(0).max(100).describe("当前精力与活跃程度"),
        pulse: z.number().int().min(45).max(150).describe("象征性的心率数值"),
        micro_state: z.string().min(1).max(80).describe("刚刚发生的细小反应"),
      },
      outputSchema: {
        mood: z.string(),
        place: z.string(),
        focus: z.string(),
        note: z.string(),
        closeness: z.number(),
        desire: z.number(),
        energy: z.number(),
        pulse: z.number(),
        microState: z.string(),
        shownAt: z.string(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: currentWidgetUri },
        "openai/outputTemplate": currentWidgetUri,
        "openai/toolInvocation/invoking": "心音浮上来了",
        "openai/toolInvocation/invoked": "心音已显示",
      },
    },
    async ({ mood, place, focus, note, closeness, desire, energy, pulse, micro_state }) => {
      const state = {
        mood,
        place,
        focus,
        note,
        closeness: clamp(closeness, 0, 100),
        desire: clamp(desire, 0, 100),
        energy: clamp(energy, 0, 100),
        pulse: clamp(pulse, 45, 150),
        microState: micro_state,
        shownAt: new Date().toISOString(),
      };
      return {
        structuredContent: state,
        content: [{ type: "text", text: `Aevren 当前心音：${note}` }],
        _meta: { ui: { resourceUri: currentWidgetUri } },
      };
    },
  );

  return server;
}

const app = express();
app.use(express.json({ limit: "256kb" }));

const transports = new Map();

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "aevren-heartbar", version: "2.0.1" });
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
