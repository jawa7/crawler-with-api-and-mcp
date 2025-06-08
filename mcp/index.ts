import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fetch from 'node-fetch';
import { z } from "zod";

const BASE_API = process.env.BASE_API ? process.env.BASE_API + "/api/v1" : "http://localhost:3000/api/v1";

function normalizeUrlParam(url: string | string[]): string {
  return Array.isArray(url) ? url[0] : url;
}

const server = new McpServer({
  name: "Crawl-Summarize Demo",
  version: "1.0.0"
});

// --- Crawl resource ---
server.resource(
  "crawl",
  new ResourceTemplate("crawl://{url}", { list: undefined }),
  { url: z.string().url() },
  async (_uri, { url }) => {
    url = normalizeUrlParam(url);
    const apiUrl = `${BASE_API}/crawl?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Failed to crawl: ${url}`);
    const results = await response.json();
    return {
      contents: Array.isArray(results)
        ? results.map((item: any) => ({ ...item, mimeType: 'text/plain' }))
        : [],
    };
  }
);

// --- Get webpage from database ---
server.resource(
  "get_webpage_from_database",
  new ResourceTemplate("webpage://{url}", { list: undefined }),
  { url: z.string().url() },
  async (_uri, { url }) => {
    url = normalizeUrlParam(url);
    const apiUrl = `${BASE_API}/webpages?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`WebPage with URL ${url} not found`);
    const webpage = await response.json() as {
      url: string;
      title: string;
      description?: string;
      category: string;
      text?: string;
    };
    return {
      contents: [
        {
          uri: webpage.url,
          title: webpage.title,
          description: webpage.description || '',
          category: webpage.category,
          text: webpage.text || '',
          mimeType: 'text/plain',
        }
      ],
    };
  }
);

// --- Check webpage exists ---
server.tool(
  "check_webpage_exists_in_database",
  { url: z.string().url() },
  async ({ url }) => {
    url = normalizeUrlParam(url);
    const apiUrl = `${BASE_API}/webpages/exists?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Failed to check existence for: ${url}`);
    const data = await response.json() as { exists: boolean };
    return {
      content: [
        {
          type: "text",
          text: `WebPage with URL ${url} ${data.exists ? "exists" : "does not exist"}`,
        }
      ]
    };
  }
);

// --- Add or update webpage ---
server.tool(
  "add_webpage_to_database",
  {
    url: z.string().url(),
    title: z.string(),
    description: z.string().optional(),
    category: z.string(),
    text: z.string().optional(),
  },
  async (params) => {
    params.url = normalizeUrlParam(params.url);
    const apiUrl = `${BASE_API}/webpages`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uri: params.url,
        title: params.title,
        description: params.description,
        category: params.category,
        text: params.text,
      })
    });
    if (!response.ok) throw new Error(`Failed to add/update webpage: ${params.url}`);
    const data = await response.json() as { message?: string };
    return {
      content: [
        {
          type: "text",
          text: data.message || `WebPage with URL ${params.url} has been added or updated successfully.`,
        }
      ]
    };
  }
);

// --- Summarize tool (returns text for LLM to summarize) ---
server.tool(
  "return_full_webpage_html",
  { url: z.string().url() },
  async ({ url }) => {
    url = normalizeUrlParam(url);
    const apiUrl = `${BASE_API}/webpages?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`WebPage with URL ${url} not found`);
    }
    const webpage = (await response.json()) as {
      url: string;
      title: string;
      description?: string;
      category: string;
      text?: string;
      wholePage?: string;
    };

    if (!webpage) {
      return {
        content: [{ type: "text", text: `WebPage with URL ${url} not found` }]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: webpage.wholePage ?? `WebPage with URL ${url} does not have a whole page HTML stored.`,
        }
      ]
    };
  }
);

// --- Start MCP server ---
(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
})();