
const mysql = require("mysql2/promise");

const connectionOptions = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Use SSL when connecting to the Aiven database.
if (process.env.DB_SSL_CA) {
    connectionOptions.ssl = {
        ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n"),
        rejectUnauthorized: true
    };
}

const pool = mysql.createPool(connectionOptions);

module.exports = pool;
