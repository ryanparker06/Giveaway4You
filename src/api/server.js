const express = require("express");
const cors = require("cors");

module.exports = function startApi(client) {
  const app = express();

  // ==========================================
  // CORS CONFIGURATION
  // Allows your Vercel dashboard, custom domain,
  // localhost, and all Vercel preview deployments
  // ==========================================
  const allowedOrigins = [
    process.env.DASHBOARD_URL ||
      "https://v0-giveaway4you-website-design.vercel.app",
    "https://v0-giveaway4you-website-design.vercel.app",
    "https://giveaway4you.com",
    "https://www.giveaway4you.com",
    "http://localhost:3000",
    "http://localhost:3001"
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin
        // (Postman, curl, health checks, server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        // Allow exact matches from the whitelist
        if (allowedOrigins.includes(origin)) {
          console.log(`✅ Allowed by CORS: ${origin}`);
          return callback(null, true);
        }

        // Allow all Vercel deployments automatically
        if (origin.endsWith(".vercel.app")) {
          console.log(
            `✅ Allowed dynamic Vercel origin: ${origin}`
          );
          return callback(null, true);
        }

        // Allow Giveaway4You domains and subdomains
        if (
          origin.includes("giveaway4you.com") ||
          origin.includes("giveaway4you")
        ) {
          console.log(
            `✅ Allowed Giveaway4You origin: ${origin}`
          );
          return callback(null, true);
        }

        // Block everything else
        console.log(`❌ Blocked by CORS: ${origin}`);
        return callback(
          new Error("Not allowed by CORS")
        );
      },
      credentials: true,
      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
      ],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With"
      ]
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

    // Special handling for CORS errors
    if (err.message === "Not allowed by CORS") {
      return res.status(403).json({
        success: false,
        error: "Origin not allowed by CORS",
        origin: req.headers.origin || null
      });
    }

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
    console.log(`Dashboard API running on port ${port}`);
    console.log("Allowed CORS origins:");

    allowedOrigins.forEach((origin) => {
      console.log(` - ${origin}`);
    });

    console.log(" - Any *.vercel.app deployment");
    console.log(" - Any Giveaway4You custom domain");
  });
};
