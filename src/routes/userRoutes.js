const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const keycloakConfig = require("../config/keycloak-config")

const keycloak = keycloakConfig.getKeycloak()

router.get("/admin", keycloak.protect("realm:administrateur"), userController.getAdminMessage)

router.get("/stagaire", keycloak.protect("realm:Stagiaire"), userController.getStagiaireMessage)

module.exports = router

