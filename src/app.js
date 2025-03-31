  const express = require("express")
  const session = require("express-session")
  const path = require("path")
  const mongoose = require("mongoose")
  const cors = require("cors")
  //const keycloakConfig = require("./config/keycloak-config")
  //const { initKeycloak } = require("./utils/keycloak")
  require("dotenv").config()

  const app = express()
  
  // Configurer CORS
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Origines autorisées
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
    credentials: true // Permettre les cookies pour les requêtes authentifiées
  }))
  
  const memoryStore = new session.MemoryStore()
  
  // Middleware pour parser JSON - doit être AVANT multer
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Configuration de multer - APRÈS json parser
  const multer = require('multer');
  const upload = multer({ storage: multer.memoryStorage() });
  
  // Middleware personnalisé pour déboguer le corps des requêtes
  app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.url}`);
    console.log('Request headers:', req.headers);
    
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('Request body:', req.body);
    }
    
    // Ajouter un intercepteur pour la réponse
    const originalSend = res.send;
    res.send = function(data) {
      console.log(`Response to ${req.method} ${req.url}:`, 
        typeof data === 'string' ? data.substring(0, 200) + (data.length > 200 ? '...' : '') : 'Non-string response');
      return originalSend.apply(res, arguments);
    }
    
    next();
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
  
  // Servir les fichiers uploadés (images de factures, etc.)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

  // Routes
  const authRoutes = require("./routes/authRoutes")
  const chambreRoutes = require("./routes/chambreRoutes")
  const articleRoutes = require('./routes/articleRoutes');
  const achatRoutes = require('./routes/achatRoutes');
  const consommationRoutes = require('./routes/consommationRoutes');
  const fournisseurRoutes = require('./routes/fournisseurRoutes');
  const factureRoutes = require('./routes/factureRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');
  const anneeScolaireRoutes = require('./routes/anneeScolaireRoutes');
  app.use("/api/auth", authRoutes)
  app.use('/api/articles', articleRoutes);
  app.use('/api/achats', achatRoutes);
  app.use('/api/consommations', consommationRoutes);
  app.use('/api/fournisseurs', fournisseurRoutes);
  app.use("/api/chambres", chambreRoutes)
  app.use("/api/factures", factureRoutes);
  app.use('/api/notifications',notificationRoutes);
  app.use('/api/annees-scolaires', anneeScolaireRoutes);
  
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
    res.status(500).json({ status: "error", message: "Internal server error", error: err.message })
  })

  const startServer = async () => {
    try {
      console.log("Starting server initialization...")

      // Initialize Keycloak
      console.log("Initializing Keycloak...")
      //const keycloak = await initKeycloak(memoryStore)
      console.log("Keycloak initialized successfully")

      // Connect to MongoDB
      console.log("Connecting to MongoDB...")
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ofppt-internat")
      console.log("✅ Connected to MongoDB: ofppt-internat")

      // Initialize and verify the active school year
      console.log("Initializing school year...")
      const AnneeScolaire = require('./models/anneeScolaireModel')
      const activeYear = await AnneeScolaire.getActiveYear()
      console.log(`✅ Active school year: ${activeYear.annee}`)

      console.log("Routes initialized")

      // Start the server
      const PORT = process.env.PORT || 5000
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`)
      })
    } catch (error) {
      console.error("Failed to start server:", error)
      process.exit(1)
    }
  }

  startServer()

