import { type Express } from "express";
import { type Server } from "http";
import { createServer as createViteServer } from "vite";

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
      allowedHosts: true as const,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
} 