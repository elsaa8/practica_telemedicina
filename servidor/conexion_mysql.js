const mysql = require('mysql');
const database = {
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'telemedicina_2026',
    multipleStatements: true
};

const conexion = mysql.createConnection(database);

conexion.connect(function (err) {
    if (err) {
        console.error('Error en la conexión de la base de datos:',err);
        process.exit();
    }
});

module.exports = conexion;