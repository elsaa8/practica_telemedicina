module.exports = function (app) {

    var conexion = require("../conexion_mysql.js")

    app.get("/api/recursos", function (req, res) {
        var sql = "SELECT * FROM recursos";
        conexion.query(sql, function(err,recursos){
            if(err){
                res.status(500).json("Error al realizar la consulta");
            }else{
                res.status(200).json(recursos); 
            }
        }); 
    });

    app.delete("/api/recursos/:id", function (req, res) {
        const id = parseInt(req.params.id);

        //borramos todas las reservas y reseñas del recurso primero y luego el recurso
        var sql = "DELETE FROM reservas WHERE recurso = ?;DELETE FROM resenyas WHERE recurso = ?;DELETE FROM recursos WHERE id = ?;";
        var params = [id,id,id];

        conexion.query(sql, params, function(err, respuesta){
            if(err){
                console.log(err);
                res.status(500).json("Error al realizar la consulta");
            }
            
            //como dimos 3 ordenes, va a haber 3 respuestas, osea respuesta es un array de 3 respuestas para cada orden
            else if(respuesta[2].affectedRows == 0){
                res.status(404).json({ error: "Recurso no encontrado" }); 
            }else{

                var sqlRecursos = "SELECT * FROM recursos";
                conexion.query(sqlRecursos, function(err, recursos){
                    if(err){
                        res.status(500).json("Error al realizar la consulta");
                    }else{
                        res.status(200).json(recursos);
                    }
                });
            }
        });
    });

    app.put("/api/recursos/:id", function (req, res) {

        let datosNuevos = req.body; //OBJETOACTUALIZAR
        let id = req.params.id;

        var params = [datosNuevos.categoria, datosNuevos.modelo, datosNuevos.numero_serie, datosNuevos.ubicacion, datosNuevos.estado, id];
        var sql = "UPDATE recursos SET categoria = ?, modelo = ?, numero_serie = ?, ubicacion = ?, estado = ? WHERE id = ?;SELECT * FROM recursos;";
        conexion.query(sql,params, function(err,respuesta){
            if(err){
                res.status(500).json("Error al realizar la consulta");
            }
            
            else if(respuesta[0].affectedRows == 0){
                res.status(404).json("Error recurso no encontrado");
            }else{
                res.status(200).json(respuesta[1]);
            }
        });
    });

    app.post("/api/recursos", function (req, res) {
        let recurso = req.body;

        var sql = "INSERT INTO recursos (numero_serie, categoria, modelo, ubicacion, estado) VALUES (?, ?, ?, ?, ?);SELECT * FROM recursos;";
        var params = [recurso.numero_serie, recurso.categoria, recurso.modelo, recurso.ubicacion, recurso.estado];
        conexion.query(sql,params, function(err, respuesta){
            if(err){
                res.status(500).json("Error al realizar la consulta");
            }
            else{
                recurso.id= respuesta[0].insertId;
                let respuestaAlCliente = [recurso, respuesta[1]];
                res.status(200).json(respuestaAlCliente);
            }
        });
    });

    app.get("/api/recursos/:id/reservas", function (req, res) {
        let id = req.params.id;

        //encuentro todas las reservas que tengan en recurso el mismo número
        var sql = "SELECT * FROM reservas WHERE recurso = ?";
        var params = [id];
        conexion.query(sql,params, function(err, respuesta){
            if(err){
                res.status(500).json("Error al realizar la consulta");
            }else{
                traducirReservas(respuesta, function(traducidas){
                    res.status(200).json(traducidas);
                });
            }
        });


        //antes acá se traducia el nombre del sanitario antes de enviarlo al cliente, creo que eso daba problemas

    }); 

    app.get("/api/recursos/:id/resenyas", function (req, res) {
        let id = req.params.id;
    
        //encuentro todas las reseñas que tengan en recurso el mismo número
        var sql = "SELECT * FROM resenyas WHERE recurso = ?";
        var params = [id];

        conexion.query(sql,params, function(err, respuesta){
            if(err){
                res.status(500).json("Error al realizar la consulta");
            }else{
                traducirReservas(respuesta, function(traducidas){
                    res.status(200).json(traducidas);
                });
            }
        });
        //acá tambien se hacia lo de traducir el sanitario antes de enviar

    }); 


//#region funciones para traducir reservas
function traducirReservas(reservas, callback){
    
    conseguirNombres(reservas, function(nombres){
        //por cada reserva
        for(let i = 0; i < reservas.length; i++){
            let reserva = reservas[i];
            
            for(let a = 0; a < nombres.length; a++){
                let nombre = nombres[a];
                if(reserva.sanitario == nombre.id){
                    reserva.sanitario = nombre.nombre;
                    break;
                }
            }
        }
        return callback(reservas);
    });
}

function conseguirNombres(reservas, callback){
    //conseguimos los id's
    let ids = [];
    for(let i = 0; i < reservas.length;i++){
        ids.push(reservas[i].sanitario);
    }

    var sql = "SELECT id, nombre, apellidos FROM sanitarios WHERE id IN (?)";
    conexion.query(sql,[ids], function(err, respuesta){
        if(err){
            console.log("Ningún sanitario encontrado");
            return callback([]);
        }
        
        else{
            //creamos la lista de nombres
            var nombres = [];
            for(let i = 0; i < respuesta.length; i++){
                let nombre = {"id":respuesta[i].id, "nombre": respuesta[i].nombre+"&"+respuesta[i].apellidos};
                nombres.push(nombre);
            }
            return callback(nombres);
        }
    });
}
//#endregion
};