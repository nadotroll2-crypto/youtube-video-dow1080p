import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // 1. Analyze Video (Mock for demo)
  app.post("/api/analyze", (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Small delay to simulate processing
    setTimeout(() => {
      res.json({
        title: "Sample Video Discovery",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop",
        formats: [
          { quality: "144p", label: "144p (LD)", type: "free" },
          { quality: "240p", label: "240p (LD)", type: "free" },
          { quality: "360p", label: "360p (SD)", type: "free" },
          { quality: "480p", label: "480p (SD)", type: "free" },
          { quality: "720p", label: "720p (HD)", type: "free" },
          { quality: "1080p", label: "1080p (FHD)", type: "premium" },
        ]
      });
    }, 1500);
  });

  // 2. Download (Mock)
  app.get("/api/download", (req, res) => {
    const { quality, url } = req.query;
    res.json({
      success: true,
      message: `Download started for ${quality} quality.`,
      downloadUrl: "https://example.com/mock-download"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
