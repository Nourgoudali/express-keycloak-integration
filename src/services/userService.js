class UserService {
    getAdminMessage() {
      return "This is a secret message for administrators only!"
    }
  
    getStagiaireMessage() {
      return "Welcome, stagaire! This message is for you."
    }
  }
  
  module.exports = new UserService()
  
  