import { describe, expect, test } from "bun:test";

const CWD = import.meta.dir + "/../..";

async function run(...args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["bun", "src/index.ts", ...args], {
    cwd: CWD,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, PORT: "0" },
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}

describe("CLI argument validation", () => {
  test("-v prints version and exits 0", async () => {
    const { stdout, exitCode } = await run("-v");
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/^\d+\.\d+\.\d+ \(\w+\)\n$/);
  });

  test("--version prints version and exits 0", async () => {
    const { stdout, exitCode } = await run("--version");
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/^\d+\.\d+\.\d+ \(\w+\)\n$/);
  });

  test("-v works without a file argument", async () => {
    const { stdout, exitCode } = await run("-v");
    expect(exitCode).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  test("-h prints help and exits 0", async () => {
    const { stdout, exitCode } = await run("-h");
    expect(exitCode).toBe(0);
    expect(stdout).toContain("updown — render a Markdown file as a slideshow");
    expect(stdout).toContain("--plantuml-jar");
    expect(stdout).toContain("--theme");
  });

  test("--help prints help and exits 0", async () => {
    const { stdout, exitCode } = await run("--help");
    expect(exitCode).toBe(0);
    expect(stdout).toContain("updown — render a Markdown file as a slideshow");
  });

  test("no arguments exits 1 with error and help text", async () => {
    const { stderr, exitCode } = await run();
    expect(exitCode).toBe(1);
    expect(stderr).toContain("missing required argument");
    expect(stderr).toContain("updown — render a Markdown file as a slideshow");
  });

  test("non-markdown extension exits 1 with descriptive error", async () => {
    const { stderr, exitCode } = await run("slides.txt");
    expect(exitCode).toBe(1);
    expect(stderr).toContain("slides.txt");
    expect(stderr).toContain(".md or .markdown");
  });

  test("binary passed as markdown file exits 1 with descriptive error", async () => {
    const { stderr, exitCode } = await run("src/index.ts");
    expect(exitCode).toBe(1);
    expect(stderr).toContain(".md or .markdown");
  });

  test("missing .md file exits 1 with file not found error", async () => {
    const { stderr, exitCode } = await run("nonexistent.md");
    expect(exitCode).toBe(1);
    expect(stderr).toContain("file not found");
    expect(stderr).toContain("nonexistent.md");
  });

  test(".markdown extension is accepted", async () => {
    const { stderr, exitCode } = await run("nonexistent.markdown");
    expect(exitCode).toBe(1);
    // Should fail on file-not-found, not on extension
    expect(stderr).toContain("file not found");
    expect(stderr).not.toContain(".md or .markdown");
  });
});
