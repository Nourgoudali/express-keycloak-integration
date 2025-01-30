const userService = require("../services/userService")

class UserController {
  getAdminMessage(req, res) {
    const message = userService.getAdminMessage()
    res.json({ message })
  }

  getStagiaireMessage(req, res) {
    const message = userService.getStagiaireMessage()
    res.json({ message })
  }
}

module.exports = new UserController()

