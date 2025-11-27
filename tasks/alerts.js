// tasks/alerts.js
require("dotenv").config();

const sql = require("mssql");
const nodemailer = require("nodemailer");

// ========== Configuracion de la BD (desde el .env) ==========

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// ========== FUNCIONES PRINCIPALES ==========

// Consulta certificados que vencen en 15 días
async function checkCertificates() {
    const pool = await sql.connect(dbConfig);

    //     const query = `
    //     SELECT
    //       p.PSD_id,
    //       p.PSD_nombre_certificado,
    //       p.PSD_vigencia_certificado,
    //       c.CLI_RFC
    //     FROM dbo.PSD_parametros_seguridad_digital p
    //     INNER JOIN dbo.CLI_clientes c
    //       ON c.CLI_id_cliente = p.PSD_CLI_id_cliente
    //     WHERE p.PSD_vigencia_certificado <= DATEADD(DAY, 30, CAST(GETDATE() AS date))
    //   `;
    const query = `
        SELECT
            p.PSD_id,
            p.PSD_nombre_certificado,
            p.PSD_vigencia_certificado,
            c.CLI_RFC
        FROM dbo.PSD_parametros_seguridad_digital p
            INNER JOIN dbo.CLI_clientes c
            ON c.CLI_id_cliente = p.PSD_CLI_id_cliente
        WHERE p.PSD_vigencia_certificado <= DATEADD(DAY, 30, CAST(GETDATE() AS date))
    `;

    const result = await pool.request().query(query);
    return result.recordset; // array de filas
}

// Envía un correo con la lista de certificados
async function sendAlertEmail({ to, rows }) {
    if (!rows || rows.length === 0) return true;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const lista = rows
        .map(
            (r) =>
                `<li>${r.PSD_nombre_certificado} - RFC: ${r.CLI_RFC} - Vence: ${r.PSD_vigencia_certificado}</li>`
        )
        .join("");

    await transporter.sendMail({
        from: `"Alertas Certificados" <${process.env.SMTP_USER}>`,
        to,
        subject: "Certificados próximos a vencerse",
        html: `
        <p>Se encontraron certificados próximos a vencerse:</p>
        <ul>${lista}</ul>
        `
    });

    return true;
}

// ========== INTEGRACIÓN CON CYPRESS ==========

function registerAlertTasks(on, config) {
    on("task", {
        async checkCertificates() {
            const rows = await checkCertificates();
            return rows;
        },
        async sendAlertEmail(args) {
            await sendAlertEmail(args);
            return true;
        }
    });
}

module.exports = {
    registerAlertTasks,
    checkCertificates,
    sendAlertEmail
};
