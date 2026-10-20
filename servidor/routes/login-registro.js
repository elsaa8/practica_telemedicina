module.exports = function (app) {
    
    var jwt = require('jwt-simple');
    var clave = 'miSecretoMasOscuro';  

    var conexion = require("../conexion_mysql.js")
    
    app.post("/api/gestores/login", function (req, res) {
        var usuarioIngresado = req.body;
        var sql = "SELECT id, nombre, apellidos, login FROM gestores WHERE login = ? AND contrasenya = ?";
        var params = [usuarioIngresado.usuario, usuarioIngresado.contrasenya];

        conexion.query(sql,params, function (err, gestores) {
            if (err){
                res.status(500).json({ error: "Error en la base de datos" });
            }
            else if(gestores.length == 0){
                res.status(401).json({ error: "Credenciales incorrectas" });
            }
            else{
                var gestor = gestores[0];
                
                var contenido = {
                    usuario: gestor.id,
                    expira: Date.now() + 60 * 60 * 1000  
                };

                var token = jwt.encode(contenido, clave);

                res.status(200).json({
                    "id": gestor.id,
                    "nombre": gestor.nombre,
                    "apellidos": gestor.apellidos,
                    "login" : gestor.login,
                    "token": token
                });
            }
        });        
    });

    app.post("/api/gestores", function (req, res) { 
        let gestor = req.body;

        if(!gestor.nombre || !gestor.apellidos || !gestor.login || !gestor.contrasenya){
            res.status(400).json("campos vacíos");
        }else{
            //corroboramos que no exista ya un usuario con esos datos
            var consulta = "SELECT id FROM gestores WHERE login = ?";
            var params = [gestor.login];
            conexion.query(consulta,params, function (err, id) {
                if(err){
                    res.status(500).json({ error: "Error en la base de datos" });
                }
                else if(id.length != 0){
                    res.status(409).json({ error: "Error un usuario con este login ya existe" });
                }
                else{
                    //en caso de que no exista lo insertamos
                    var insertarUsuario = "INSERT INTO gestores (login, contrasenya, nombre, apellidos) VALUES(?, ?, ?, ?)";
                    var paramsUsuario = [gestor.login, gestor.contrasenya, gestor.nombre, gestor.apellidos];
                    conexion.query(insertarUsuario,paramsUsuario, function(err, resultado){
                        if(err){
                            res.status(500).json({ error: "Error en la base de datos" });
                        }
                        else{
                            res.status(201).json("Gestor añadido");
                        }
                    });
                }          
            });
        }
    });


};