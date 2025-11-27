// job_alertas.js

// OPCIONAL - sirve para ejecutar el job sin Cypress, por ejemplo en un cron o en el programador de tareas o en la nube:
require("dotenv").config();

const { checkCertificates, sendAlertEmail } = require("./tasks/alerts");

(async () => {
    try {
        const rows = await checkCertificates();

        if (!rows || rows.length === 0) {
            console.log("No hay certificados próximos a vencerse.");
            process.exit(0);
        }

        await sendAlertEmail({
            to: process.env.ALERT_EMAIL_TO,
            rows
        });

        console.log(`Alerta enviada. Certificados encontrados: ${rows.length}`);
        process.exit(0);
    } catch (err) {
        console.error("Error ejecutando el job de alertas:", err);
        process.exit(1);
    }
})();
