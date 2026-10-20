module.exports = function (app) {

    var conexion = require("../conexion_mysql.js")

    app.put("/api/gestores/:id", function (req, res) {

        let datosNuevos = req.body; //OBJETOACTUALIZAR
        let id = req.params.id;

        //preguntamos a la BD si alguien ya tiene ese login
        let sqlLogin = "SELECT id FROM gestores WHERE login = ? AND id != ?";
        let paramsLogin = [datosNuevos.login, id];
        conexion.query(sqlLogin,paramsLogin, function(err, gestores){
            if (err) {
                return res.status(500).json({ mensaje: "Error al comprobar el login" });
            }
            else if(gestores.length != 0){
                return res.status(404).json({ mensaje: "Otro gestor ya tiene ese Login" });
            }else{
                //si nadie tiene el mismo login actualizamos
                let sqlActualizacion = "UPDATE gestores SET nombre = ?, apellidos = ?, login = ? WHERE id = ?;"
                let paramsActualizacion = [datosNuevos.nombre, datosNuevos.apellidos, datosNuevos.login, id];
                conexion.query(sqlActualizacion,paramsActualizacion,function(err, respuesta){
                    if(err){
                        res.status(500).json("Error al realizar la actualización del gestor");
                    }else if(respuesta.affectedRows == 0){
                        res.status(404).json("Gestor no encontrado");
                    }else{
                        res.status(200).json("Gestor actualizado");
                    }
                });
            }
        });
    });

};
