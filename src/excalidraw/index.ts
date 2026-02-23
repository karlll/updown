// DOM shim must be imported before @excalidraw/utils
import "./dom-shim.ts";
import { exportToSvg } from "@excalidraw/utils";
import { decompressFromBase64 } from "lz-string";

export async function parseExcalidrawMd(text: string): Promise<{ elements?: unknown[]; files?: Record<string, unknown>; appState?: Record<string, unknown> }> {
  const obsidianBlock = text.match(/%%\s*([\s\S]*?)\s*%%/);
  if (!obsidianBlock) {
    throw new Error("No Obsidian comment block (%% ... %%) found");
  }
  const compressedMatch = obsidianBlock[1]!.match(/```compressed-json\s*([\s\S]*?)\s*```/);
  if (!compressedMatch) {
    throw new Error("No compressed-json fence found in Obsidian block");
  }
  const decompressed = decompressFromBase64(compressedMatch[1]!.replace(/[\n\r]/g, ""));
  if (!decompressed) {
    throw new Error("Failed to decompress Excalidraw data");
  }
  return JSON.parse(decompressed);
}

export async function renderExcalidraw(filePath: string): Promise<string> {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return `<div class="excalidraw-error">Excalidraw file not found: ${filePath}</div>`;
  }

  let data: { elements?: unknown[]; files?: Record<string, unknown>; appState?: Record<string, unknown> };
  try {
    if (filePath.endsWith(".excalidraw.md")) {
      const text = await file.text();
      data = await parseExcalidrawMd(text);
    } else {
      data = await file.json();
    }
  } catch {
    return `<div class="excalidraw-error">Invalid Excalidraw file: ${filePath}</div>`;
  }

  const elements = (data.elements ?? []).filter(
    (el: any) => !el.isDeleted,
  );

  const svg = await exportToSvg({
    elements: elements as any,
    files: (data.files ?? null) as any,
    appState: { ...data.appState, viewBackgroundColor: "transparent" } as any,
    exportPadding: 10,
  });

  return svg.outerHTML;
}
