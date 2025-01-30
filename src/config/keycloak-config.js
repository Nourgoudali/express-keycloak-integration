const Keycloak = require("keycloak-connect")
let _keycloak

function initKeycloak(memoryStore) {
  if (_keycloak) {
    console.warn("Trying to init Keycloak again!")
    return _keycloak
  }

  console.log("Initializing Keycloak...")
  _keycloak = new Keycloak(
    { store: memoryStore },
    {
      realm: "ofppt-internat",
      "auth-server-url": "http://localhost:8080/",
      "ssl-required": "external",
      resource: "ofpptInternat",
      "public-client": true,
      "confidential-port": 0,
    },
  )
  return _keycloak
}

function getKeycloak() {
  if (!_keycloak) {
    console.error("Keycloak has not been initialized. Please call init first.")
  }
  return _keycloak
}

module.exports = {
  initKeycloak,
  getKeycloak,
}

