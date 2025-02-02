const KcAdminClient = require("keycloak-admin").default;

let keycloakAdmin = null;

const initKeycloak = async () => {
  if (keycloakAdmin) {
    return keycloakAdmin;
  }

  keycloakAdmin = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_BASE_URL || "http://localhost:8080",
    realmName: process.env.KEYCLOAK_REALM || "ofppt-internat",
  });

  try {
    console.log("Attempting to authenticate with Keycloak...");
    await keycloakAdmin.auth({
      grantType: "client_credentials",
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    });
    console.log("Keycloak authenticated successfully");
    return keycloakAdmin;
  } catch (error) {
    console.error("Keycloak authentication failed:", error.message);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    console.error("Full error object:", JSON.stringify(error, null, 2));
    throw new Error(`Keycloak authentication failed: ${error.message}`);
  }
};

const getKeycloakAdmin = async () => {
  if (!keycloakAdmin) {
    await initKeycloak();
  }
  return keycloakAdmin;
};

module.exports = { initKeycloak, getKeycloakAdmin };
