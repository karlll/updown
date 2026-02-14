import { describe, test, expect } from "bun:test";
import { startPlantUMLServer } from "../../src/plantuml/server.ts";

describe("startPlantUMLServer", () => {
  test("throws when JAR not found", async () => {
    const original = process.env.PLANTUML_JAR;
    process.env.PLANTUML_JAR = "/nonexistent/plantuml.jar";
    try {
      await expect(startPlantUMLServer()).rejects.toThrow("PlantUML JAR not found");
    } finally {
      if (original !== undefined) {
        process.env.PLANTUML_JAR = original;
      } else {
        delete process.env.PLANTUML_JAR;
      }
    }
  });
});
