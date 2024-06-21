var mysql = require('mysql2');

// Database Pool Connection
const pool  = mysql.createPool({
    connectionLimit : process.env.POOL_CONNECTION_LIMIT,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_NAME
});
 
// Connecting to database
pool.getConnection((err, connection) => {
});

pool.on('connection', function (connection) {
    console.log("Successfully connected to MySQL!")
});

module.exports = pool;