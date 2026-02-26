import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Subprocess } from "bun";

let proc: Subprocess;
let baseUrl: string;

beforeAll(async () => {
  const cwd = import.meta.dir + "/../..";
  proc = Bun.spawn(["bun", "src/index.ts", "tests/integration/test.md"], {
    cwd,
    stdout: "pipe",
    stderr: "inherit",
    env: { ...process.env, PORT: "0" },
  });

  // Read stdout until we find the URL
  const stdout = proc.stdout as ReadableStream<Uint8Array>;
  const reader = stdout.getReader();
  let output = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    output += new TextDecoder().decode(value);
    const match = output.match(/http:\/\/\S+/);
    if (match) {
      baseUrl = match[0].replace(/\/$/, "");
      break;
    }
  }
  reader.releaseLock();
  if (!baseUrl) throw new Error(`Could not find URL in server output: ${output}`);
});

afterAll(() => {
  proc.kill();
});

describe("server", () => {
  test("GET / returns 200 with text/html", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  test("GET / body contains id='slideshow'", async () => {
    const res = await fetch(`${baseUrl}/`);
    const body = await res.text();
    expect(body).toContain('id="slideshow"');
  });

  test("GET / body contains front matter attributes from test.md", async () => {
    const res = await fetch(`${baseUrl}/`);
    const body = await res.text();
    expect(body).toContain('data-fm-theme="test"');
  });

  test("GET / body contains navigation script with ArrowLeft/ArrowRight", async () => {
    const res = await fetch(`${baseUrl}/`);
    const body = await res.text();
    expect(body).toContain("<script>");
    expect(body).toContain("ArrowLeft");
    expect(body).toContain("ArrowRight");
  });

  test("GET /slide/1 returns 200 with first slide fragment", async () => {
    const res = await fetch(`${baseUrl}/slide/1`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<h1>Slide One</h1>");
  });

  test("GET /slide/2 (last slide) returns 200", async () => {
    const res = await fetch(`${baseUrl}/slide/2`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<h2>Slide Two</h2>");
  });

  test("GET /slide/0 returns 404", async () => {
    const res = await fetch(`${baseUrl}/slide/0`);
    expect(res.status).toBe(404);
  });

  test("GET /slide/999 returns 404", async () => {
    const res = await fetch(`${baseUrl}/slide/999`);
    expect(res.status).toBe(404);
  });

  test("GET /slide/abc returns 404", async () => {
    const res = await fetch(`${baseUrl}/slide/abc`);
    expect(res.status).toBe(404);
  });

  test("GET /unknown returns 404", async () => {
    const res = await fetch(`${baseUrl}/unknown`);
    expect(res.status).toBe(404);
  });

  test("GET /health returns 200 with application/json", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  test("GET /health returns correct fields", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json() as { status: string; timestamp: string; version: string; commit: string };
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    expect(typeof body.version).toBe("string");
    expect(body.version.length).toBeGreaterThan(0);
    expect(typeof body.commit).toBe("string");
    expect(body.commit.length).toBeGreaterThan(0);
  });

  test("POST /stop responds with stopping and process exits", async () => {
    const cwd = import.meta.dir + "/../..";
    const stopProc = Bun.spawn(["bun", "src/index.ts", "tests/integration/test.md"], {
      cwd,
      stdout: "pipe",
      stderr: "ignore",
      env: { ...process.env, PORT: "0" },
    });

    const stdout = stopProc.stdout as ReadableStream<Uint8Array>;
    const reader = stdout.getReader();
    let output = "";
    let stopUrl = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      output += new TextDecoder().decode(value);
      const match = output.match(/http:\/\/\S+/);
      if (match) {
        stopUrl = match[0].replace(/\/$/, "");
        break;
      }
    }
    reader.releaseLock();
    if (!stopUrl) throw new Error(`Could not find URL in server output: ${output}`);

    const res = await fetch(`${stopUrl}/stop`, { method: "POST" });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("stopping");

    const exitCode = await stopProc.exited;
    expect(exitCode).toBe(0);
  });
});
