# Crawler NestJS

A modular web crawler and API built with NestJS, supporting MCP (Model Context Protocol), TypeORM/PostgreSQL, and automatic Swagger documentation.

---

## Table of Contents
- [Crawler NestJS](#crawler-nestjs)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Architecture](#architecture)
  - [Installation \& Run](#installation--run)
  - [Environment Variables](#environment-variables)
  - [API \& Swagger](#api--swagger)
  - [MCP Server](#mcp-server)
  - [Example: Full MCP Workflow](#example-full-mcp-workflow)
  - [Testing](#testing)
  - [Notes](#notes)

---

## Description

This project provides:
- A modular web crawler with depth control and task queue
- REST API for managing and storing webpage data (CRUD)
- MCP server for integration with external LLMs/agents via HTTP
- API documentation and validation via Swagger and class-validator
- Unit test coverage

---

## Architecture

- **src/crawler/** — crawling logic, controller, service, utilities, DTOs
- **src/webpage/** — API for working with webpages, service, controller, DTOs, entity
- **src/app.module.ts** — main module, DI, TypeORM
- **mcp/index.ts** — MCP server, interacts with API via HTTP only

---

## Installation & Run

```bash
npm install
npm run start:dev
```

- The app runs at http://localhost:3000
- Swagger UI is available at http://localhost:3000/api

---

## Environment Variables

- `BASE_API` — base URL for the MCP server (default: http://localhost:3000/api/v1)
- For PostgreSQL connection, use TypeORM environment variables or edit parameters in `app.module.ts`

---

## API & Swagger

- **Swagger UI:** http://localhost:3000/api
- All endpoints are validated and documented with parameters/responses.
- Examples:
  - `GET /api/v1/webpages?url=https://example.com` — get a webpage
  - `POST /api/v1/webpages` — add/update a webpage (see schema in Swagger)
  - `GET /crawl?url=https://example.com` — crawl a single page

---

## MCP Server

- Code: `mcp/index.ts`
- Uses the `BASE_API` environment variable to access the API
- **Available resources/tools for MCP clients:**
  - `crawl` — crawl a webpage by URL (calls `/crawl?url=...`)
  - `get_webpage_from_database` — get a webpage from the database by URL (calls `/api/v1/webpages?url=...`)
  - `check_webpage_exists_in_database` — check if a webpage exists in the database (calls `/api/v1/webpages/exists?url=...`)
  - `add_webpage_to_database` — add or update a webpage in the database (calls `/api/v1/webpages` POST)
  - `return_full_webpage_html` — get the full HTML of a webpage from the database (calls `/api/v1/webpages?url=...`)

---

## Example: Full MCP Workflow

A typical MCP client workflow might look like:

1. **Check if a webpage exists in the database:**
   - Tool: `check_webpage_exists_in_database` with `{ url: 'https://example.com' }`
   - If result is `does not exist`, proceed to step 2.
2. **Crawl the webpage:**
   - Resource: `crawl://https://example.com`
   - Get the crawled data from the response.
3. **Add the crawled webpage to the database:**
   - Tool: `add_webpage_to_database` with the crawled data (fields: url, title, description, category, text, ...)
   - **Note:** The field must be named `url` (not `uri`) in the payload for correct operation.
4. **Summarize the result:**
   - Tool: `return_full_webpage_html` with `{ url: 'https://example.com' }`
   - Use the returned HTML/text for further processing or LLM summarization.

This workflow allows an agent to:
- Check if a page is already indexed
- Crawl and persist new content if needed
- Always get the latest summary or full HTML for downstream tasks

---

## Testing

- Unit tests: `npm run test`
---

## Notes
- To extend the API, use DTOs with class-validator and Swagger decorators
- The MCP server has no direct DB access, only via HTTP API

---
