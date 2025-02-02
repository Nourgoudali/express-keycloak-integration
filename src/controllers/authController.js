const AuthService = require("../services/authService")

class AuthController {
  async signup(req, res) {
    console.log("AuthController: signup method called")
    try {
      const { firstname, lastname, username, email, password, role } = req.body
      console.log("Received user data:", { firstname, lastname, username, email, role })

      console.log("Creating user...")
      const newUser = await AuthService.createUser({ firstname, lastname, username, email, password, role })
      console.log("User created successfully:", newUser._id)

      res.status(201).json({
        status: "success",
        data: {
          user: {
            _id: newUser._id,
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
          },
        },
      })
    } catch (error) {
      console.error("Error in signup:", error)
      res.status(400).json({
        status: "fail",
        message: error.message,
      })
    }
  }


}

module.exports = new AuthController()

