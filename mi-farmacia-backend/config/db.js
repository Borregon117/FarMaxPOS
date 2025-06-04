const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10, //Esto es ajustable a necesidad
    queueLimit: 0,
});


pool.getConnection() 
  .then(connection => {
    console.log('Conectado a la base de datos MySQL como id ' + connection.threadId);
    connection.release(); // Liberar la conexión de prueba
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });

module.exports = pool;

/*
pool.getConnection() 
    .then(connection => {
        console.log('Conectando a la base de datos MySQL como id ' + connection.threadId ); 
        connection.release(); //Liberar la conexion de prueba
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos MySQL: ', err);
    });

    module.exports = pool;

    */