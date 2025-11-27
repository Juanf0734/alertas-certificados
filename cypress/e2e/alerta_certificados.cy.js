// cypress/e2e/alerta_certificados.cy.js

describe("Alertas de certificados próximos a vencerse", () => {
    it("Consulta la BD y envía correo si hay resultados", () => {
        cy.task("checkCertificates").then((rows) => {
            if (rows && rows.length > 0) {
                cy.log(`Se encontraron ${rows.length} certificados próximos a vencerse`);

                return cy.task("sendAlertEmail", {
                    to: process.env.ALERT_EMAIL_TO,
                    rows
                });
            } else {
                cy.log("No hay certificados próximos a vencerse");
            }
        });
    });
});
