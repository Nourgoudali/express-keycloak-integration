const Keycloak = require("keycloak-connect");
const session = require("express-session");

let _keycloak;

function initKeycloak() {
  if (_keycloak) {
    console.warn("Trying to init Keycloak again!");
    return _keycloak;
  }

  console.log("Initializing Keycloak...");
  const memoryStore = new session.MemoryStore();
  _keycloak = new Keycloak({ store: memoryStore }, {
    realm: process.env.KEYCLOAK_REALM,
    "auth-server-url": process.env.KEYCLOAK_AUTH_SERVER_URL,
    resource: process.env.KEYCLOAK_CLIENT_ID,
    "public-client": true,
    "confidential-port": 0,
  });

  return _keycloak;
}

function getKeycloak() {
  if (!_keycloak) {
    console.error("Keycloak has not been initialized. Please call init first.");
  }
  return _keycloak;
}

module.exports = { initKeycloak, getKeycloak };
