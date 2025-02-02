const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", AuthController.signup.bind(AuthController));

module.exports = router;