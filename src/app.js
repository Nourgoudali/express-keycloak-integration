  const express = require("express")
  const session = require("express-session")
  const path = require("path")
  const mongoose = require("mongoose")
  const keycloakConfig = require("./config/keycloak-config")
  const { initKeycloak } = require("./utils/keycloak")
  require("dotenv").config()

  const app = express()
  const memoryStore = new session.MemoryStore()
  const multer = require('multer');
  app.use(multer({ storage: multer.memoryStorage() }).any());
  // Middleware for JSON parsing
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.url}`)
    next()
  })

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "some secret",
      resave: false,
      saveUninitialized: true,
      store: memoryStore,
    }),
  )

  // Serve static files
  app.use(express.static(path.join(__dirname, "public")))

  // Routes
  const authRoutes = require("./routes/authRoutes")
  const chambreRoutes = require("./routes/chambreRoutes")
  const articleRoutes = require('./routes/articleRoutes');
  const achatRoutes = require('./routes/achatRoutes');
  const consommationRoutes = require('./routes/consommationRoutes');
  const fournisseurRoutes = require('./routes/fournisseurRoutes');
  const factureRoutes = require('./routes/factureRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use("/api/auth", authRoutes)
  app.use('/api/articles', articleRoutes);
  app.use('/api/achats', achatRoutes);
  app.use('/api/consommations', consommationRoutes);
  app.use('/api/fournisseurs', fournisseurRoutes);
  app.use("/api/chambres", chambreRoutes)
  app.use("/api/factures", factureRoutes);
  app.use('/api/notifications',notificationRoutes);
  
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
  })

  // Logout route
  app.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/")
  })

  // 404 Handler
  app.use((req, res) => {
    console.log(`🚫 No route found for ${req.method} ${req.url}`)
    res.status(404).send("Not Found")
  })

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error("🔥 Error:", err)
    res.status(500).json({ status: "error", message: "Internal server error" })
  })

  const startServer = async () => {
    try {
      console.log("Starting server initialization...")

      // Initialize Keycloak
      console.log("Initializing Keycloak...")
      const keycloak = await initKeycloak(memoryStore)
      console.log("Keycloak initialized successfully")

      // Connect to MongoDB
      console.log("Connecting to MongoDB...")
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ofppt-internat")
      console.log("✅ Connected to MongoDB: ofppt-internat")

      console.log("Routes initialized")

      // Start the server
      const PORT = process.env.PORT || 3000
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`)
      })
    } catch (error) {
      console.error("Failed to start server:", error)
      process.exit(1)
    }
  }

  startServer()

