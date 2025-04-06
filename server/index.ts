import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer, type Server } from "http";

const app = express();
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

// Setup error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error(err);
});

// First startup the server quickly to signal port is ready
const httpServer = createServer(app);
const port = 5000;

// Register the basic routes synchronously before server starts to reduce startup time
// Add minimal middleware first
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Add a middleware to handle database not ready errors
app.use((req, res, next) => {
  // Continue with the request for non-API endpoints
  if (!req.path.startsWith('/api') || req.path === '/api/health') {
    return next();
  }
  
  // For API endpoints, we might need the database, so check its state
  try {
    next();
  } catch (error) {
    console.error('Database error:', error);
    res.status(503).json({ message: "Database initialization in progress. Please try again." });
  }
});

// ALWAYS serve the app on port 5000
// this serves both the API and the client.
// It is the only port that is not firewalled.
httpServer.listen({
  port,
  host: "0.0.0.0",
  reusePort: true,
}, () => {
  console.log(`Server is now listening on port ${port}`);
  log(`serving on port ${port}`);
  
  // Only after server is listening, finish setting up routes asynchronously
  (async () => {
    try {
      // importantly only setup vite in development and after
      // setting up all the other routes so the catch-all route
      // doesn't interfere with the other routes
      if (app.get("env") === "development") {
        await setupVite(app, httpServer);
      } else {
        serveStatic(app);
      }
      
      // Register other routes after server is already listening
      await registerRoutes(app, httpServer);
    } catch (error) {
      console.error('Error initializing routes:', error);
    }
  })();
});

httpServer.on('error', (error: Error) => {
  console.error('Server failed to start:', error);
});
