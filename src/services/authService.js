const User = require("../models/userModel")
const { getKeycloakAdmin } = require("../utils/keycloak")

class AuthService {
  constructor() {
    this.userModel = User
    this.keycloakAdmin = null
  }

  async init() {
    this.keycloakAdmin = await getKeycloakAdmin()
  }

  async ensureRoleExists(roleName) {
    try {
      console.log(`Checking if role '${roleName}' exists in Keycloak...`)
      const role = await this.keycloakAdmin.roles.findOneByName({
        realm: "ofppt-internat",
        name: roleName,
      })

      if (!role) {
        console.log(`Role '${roleName}' not found. Creating it...`)
        await this.keycloakAdmin.roles.create({
          realm: "ofppt-internat",
          name: roleName,
          description: `Role for ${roleName}`,
        })
        console.log(`Role '${roleName}' created in Keycloak`)
      } else {
        console.log(`Role '${roleName}' already exists in Keycloak`)
      }
    } catch (error) {
      console.error(`Error ensuring role '${roleName}' exists:`, error)
      throw error
    }
  }

  async addRoleToUser(userId, roleName) {
    try {
      console.log(`Adding role '${roleName}' to user '${userId}'...`)
      const role = await this.keycloakAdmin.roles.findOneByName({
        realm: "ofppt-internat",
        name: roleName,
      })

      if (!role) {
        throw new Error(`Role '${roleName}' not found in Keycloak`)
      }

      await this.keycloakAdmin.users.addRealmRoleMappings({
        realm: "ofppt-internat",
        id: userId,
        roles: [{ id: role.id, name: role.name }],
      })
      console.log(`Role '${roleName}' added to user '${userId}' in Keycloak`)
    } catch (error) {
      console.error(`Error adding role '${roleName}' to user '${userId}':`, error)
      throw error
    }
  }

  async createUser(userData) {
    let newUser = null
    let keycloakUser = null
    try {
      if (!this.keycloakAdmin) {
        await this.init()
      }

      console.log("Creating user in MongoDB...")
      newUser = await this.userModel.create(userData)
      console.log("User created in MongoDB:", newUser._id)

      console.log("Creating user in Keycloak...")
      keycloakUser = await this.keycloakAdmin.users.create({
        realm: "ofppt-internat",
        username: userData.username,
        email: userData.email,
        firstName: userData.firstname,
        lastName: userData.lastname,
        enabled: true,
        credentials: [
          {
            type: "password",
            value: userData.password,
            temporary: false,
          },
        ],
      })
      console.log("User created in Keycloak:", keycloakUser.id)

      console.log("Ensuring role exists in Keycloak...")
      await this.ensureRoleExists(userData.role)

      console.log("Adding role to user in Keycloak...")
      await this.addRoleToUser(keycloakUser.id, userData.role)

      return newUser
    } catch (error) {
      console.error("Error creating user:", error)
      if (error.response) {
        console.error("Keycloak error response:", error.response.data)
      }
      if (newUser && newUser._id) {
        console.log("Deleting user from MongoDB due to error...")
        await this.userModel.findByIdAndDelete(newUser._id)
      }
      if (keycloakUser && keycloakUser.id) {
        console.log("Deleting user from Keycloak due to error...")
        try {
          await this.keycloakAdmin.users.del({
            realm: "ofppt-internat",
            id: keycloakUser.id,
          })
        } catch (deleteError) {
          console.error("Error deleting user from Keycloak:", deleteError)
        }
      }
      throw error
    }
  }
}

module.exports = new AuthService()

