const express = require("express")
const session = require("express-session")
const path = require("path")
const keycloakConfig = require("./config/keycloak-config")

const app = express()
const memoryStore = new session.MemoryStore()

// Session middleware
app.use(
  session({
    secret: "some secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  }),
)

// Initialize Keycloak
const keycloak = keycloakConfig.initKeycloak(memoryStore)

// Keycloak middleware
app.use(keycloak.middleware())

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// Add this before the user routes
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`)
  next()
})

// Require and use the user routes after Keycloak is initialized
const userRoutes = require("./routes/userRoutes")
app.use("/api/user", userRoutes)

// Add this after all your routes
app.use((req, res) => {
  console.log(`No route found for ${req.method} ${req.url}`)
  res.status(404).send("Not Found")
})

// Public route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy()
  res.redirect("/")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

