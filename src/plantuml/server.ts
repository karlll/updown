import { resolve } from "node:path";

export type PlantUMLServer = {
  port: number;
  stop: () => void;
};

const DEFAULT_PORT = 18123;
const STARTUP_TIMEOUT = 15000;
const POLL_INTERVAL = 200;

export async function startPlantUMLServer(jarPath: string): Promise<PlantUMLServer> {
  const port = parseInt(process.env.PLANTUML_PORT ?? String(DEFAULT_PORT), 10);

  const jarFile = Bun.file(jarPath);
  if (!(await jarFile.exists())) {
    throw new Error(`PlantUML JAR not found: ${jarPath}`);
  }

  const proc = Bun.spawn(["java", "-jar", jarPath, `-picoweb:${port}:127.0.0.1`], {
    stdout: "ignore",
    stderr: "ignore",
  });

  // Poll until the server responds or timeout
  const start = Date.now();
  const healthUrl = `http://127.0.0.1:${port}/serverinfo`;

  while (Date.now() - start < STARTUP_TIMEOUT) {
    try {
      const res = await fetch(healthUrl);
      if (res.ok) {
        return {
          port,
          stop() {
            proc.kill();
          },
        };
      }
    } catch {
      // Server not ready yet
    }
    await Bun.sleep(POLL_INTERVAL);
  }

  proc.kill();
  throw new Error(`PlantUML server failed to start within ${STARTUP_TIMEOUT}ms on port ${port}`);
}
