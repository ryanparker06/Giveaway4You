const express = require("express");
const cors = require("cors");

module.exports = function startApi(client) {
  const app = express();

  // ==========================================
  // CORS CONFIGURATION
  // Allows your Vercel dashboard to access the API
  // ==========================================
  const allowedOrigins = [
    process.env.DASHBOARD_URL ||
      "https://v0-giveaway4you-website-design.vercel.app",
    "http://localhost:3000"
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (Postman, curl, server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        // Allow any origin in the allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.log(`❌ Blocked by CORS: ${origin}`);
        return callback(
          new Error("Not allowed by CORS")
        );
      },
      credentials: true
    })
  );

  // Parse JSON request bodies
  app.use(express.json());

  // ==========================================
  // HEALTH CHECK
  // ==========================================
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      bot: client.user?.tag || "Starting...",
      servers: client.guilds.cache.size,
      dashboard:
        process.env.DASHBOARD_URL ||
        "https://v0-giveaway4you-website-design.vercel.app",
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // API ROUTES
  // ==========================================
  app.use(
    "/api/guilds",
    require("./routes/guilds")(client)
  );

  app.use(
    "/api/guilds",
    require("./routes/settings")(client)
  );

  app.use(
    "/api/guilds",
    require("./routes/premium")(client)
  );

  app.use(
    "/api/guilds",
    require("./routes/analytics")(client)
  );

  // ==========================================
  // 404 HANDLER
  // ==========================================
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: "API endpoint not found",
      path: req.originalUrl
    });
  });

  // ==========================================
  // ERROR HANDLER
  // ==========================================
  app.use((err, req, res, next) => {
    console.error("API Error:", err);

    res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error"
    });
  });

  // ==========================================
  // START SERVER
  // ==========================================
  const port = process.env.API_PORT || 3001;

  app.listen(port, "0.0.0.0", () => {
    console.log(
      `Dashboard API running on port ${port}`
    );
    console.log(
      `Allowed CORS origins: ${allowedOrigins.join(
        ", "
      )}`
    );
  });
};
