import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import cors from "cors";

const app = express();

// Configure CORS
app.use(cors({
  origin: [
    'https://design-flow-engine-6ne1b0o1p-jsphbrs-6905s-projects.vercel.app',
    'https://design-flow-engine-gdvugpe8n-jsphbrs-6905s-projects.vercel.app',
    'https://design-flow-engine-gl3v6tpgh-jsphbrs-6905s-projects.vercel.app',
    'https://design-flow-engine-9528lzdcp-jsphbrs-6905s-projects.vercel.app',
    'https://design-flow-engine-blqyv610x-jsphbrs-6905s-projects.vercel.app',
    'https://design-flow-engine-od6s48tvm-jsphbrs-6905s-projects.vercel.app',
    'https://design-flow-engine-gmx46x4wt-jsphbrs-6905s-projects.vercel.app',
    'https://design-flow-engine-3e1er5b7f-jsphbrs-6905s-projects.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize server
const server = createServer(app);

// Register API routes
registerRoutes(app).catch(err => {
  console.error('Failed to register routes:', err);
  process.exit(1);
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Serve static files and handle SPA routing
if (app.get("env") === "development") {
  setupVite(app, server).catch(err => {
    console.error('Failed to setup Vite:', err);
    process.exit(1);
  });
} else {
  // Serve static files from the dist/public directory
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  app.use(express.static(distPath));
  
  // Handle all other routes by serving index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(port, () => {
  log(`Server running on port ${port}`);
});
