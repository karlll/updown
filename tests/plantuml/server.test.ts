import { describe, test, expect } from "bun:test";
import { startPlantUMLServer } from "../../src/plantuml/server.ts";

describe("startPlantUMLServer", () => {
  test("throws when JAR not found", async () => {
    await expect(startPlantUMLServer("/nonexistent/plantuml.jar")).rejects.toThrow("PlantUML JAR not found");
  });
});
