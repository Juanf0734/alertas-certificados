// cypress.config.js
require("dotenv").config(); // Carga variables del .env

const { defineConfig } = require("cypress");
const { registerAlertTasks } = require("./tasks/alerts");

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // Registramos las tasks de Node para Cypress
            registerAlertTasks(on, config);
            return config;
        },
        specPattern: "cypress/e2e/**/*.cy.js"
    }
});
