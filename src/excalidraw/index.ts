// DOM shim must be imported before @excalidraw/utils
import "./dom-shim.ts";
import { exportToSvg } from "@excalidraw/utils";

export async function renderExcalidraw(filePath: string): Promise<string> {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return `<div class="excalidraw-error">Excalidraw file not found: ${filePath}</div>`;
  }

  let data: { elements?: unknown[]; files?: Record<string, unknown>; appState?: Record<string, unknown> };
  try {
    data = await file.json();
  } catch {
    return `<div class="excalidraw-error">Invalid Excalidraw file: ${filePath}</div>`;
  }

  const elements = (data.elements ?? []).filter(
    (el: any) => !el.isDeleted,
  );

  const svg = await exportToSvg({
    elements: elements as any,
    files: (data.files ?? null) as any,
    appState: data.appState as any,
    exportPadding: 10,
  });

  return svg.outerHTML;
}
