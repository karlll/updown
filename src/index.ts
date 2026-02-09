const controller = Bun.serve({
  async fetch(req) {
    const path = new URL(req.url).pathname;
    if (path === "/") return new Response("Welcome to Bun!");
    return new Response("Page not found", { status: 404 });
  },
});

console.log(`updown listening on ${controller.url}`);
