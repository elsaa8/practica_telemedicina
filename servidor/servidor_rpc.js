//Es necesario instalar en la carpeta del servidor los modulos cors y express
//>npm i express cors
//>npm i express
//>npm i mysql
//>npm i ws

var rpc = require("./rpc.js"); //incorporamos la libreria
var conexion = require('./conexion_mysql.js'); // conexión a la base de datos


function loginSanitario(usuario, contrasenya, callback){
    if (!usuario || !contrasenya) return callback([null,"No puede haber campos vacíos"]);
    
    var sql = "SELECT id FROM sanitarios WHERE usuario = ? AND password = ?;";
    var params = [usuario, contrasenya];
    conexion.query(sql,params, function(err, idSanitario){
        if(err){
            console.log("Error en la consulta login sanitario");
            return callback([null,"Error en la consulta login sanitario"]);
        }else if(idSanitario.length == 0){
            console.log("Sanitario no encontrado");
            return callback([null,"Sanitario no encontrado"]);
        }else{
            return callback([true,idSanitario[0].id]);
        }
    });
}

function obtenerSanitario(idSanitario, callback){
    var sql = "SELECT id, nombre, apellidos, usuario FROM sanitarios WHERE id = ?";
    var params = [idSanitario];

    conexion.query(sql,params, function(err, sanitario){
        if(err){
            console.log("Error en la consulta login sanitario");
            return callback([null,"Error en la consulta login sanitario"]);
        }else if(sanitario.length == 0){
            console.log("Sanitario no encontrado");
            return callback([null,"Sanitario no encontrado"]);
        }else{
            sanitario = sanitario[0];
            return callback([true,sanitario]);
        }
    });

}

function crearSanitario(datosSanitarios, callback){
    //si hay campos vacíos damos error y se lo decimos
    if(!datosSanitarios.nombre||!datosSanitarios.apellidos||!datosSanitarios.usuario||!datosSanitarios.password){
        return callback([null,"No puede haber campos vacíos"]);
    }

    //corroboramos que no haya otro sanitario ya con ese usuario
    var insertarSanitario = "SELECT * FROM sanitarios WHERE usuario = ?";
    var paramsInsertarSanitario = [datosSanitarios.usuario];
    conexion.query(insertarSanitario,paramsInsertarSanitario, function(err, coincidencias){
        if(err){
            return callback([null, "Error en la petición a la base de datos"]);
        }

        else if(coincidencias.length != 0){
            return callback([null, "Ya hay un sanitario con ese usuario"]);
        }else{
            // si no hay coincidencias si lo introducimos
            var sql = "INSERT INTO sanitarios (nombre, apellidos, usuario, password) VALUES(?, ?, ?, ?)";
            var params = [datosSanitarios.nombre, datosSanitarios.apellidos, datosSanitarios.usuario, datosSanitarios.password];
            conexion.query(sql,params, function(err, respuesta){
                if(err){
                    return callback([null, "Error en la petición a la base de datos"]);
                }else{
                    datosSanitarios.id = respuesta.insertId;
                    return callback([datosSanitarios,"Registrado correctamente"]);
                }
            });
        }
    });
}

function obtenerReservas(idSanitario, callback){
    var sql = "SELECT * FROM reservas WHERE sanitario = ?";
    var params = [idSanitario];
    conexion.query(sql, params, function(err, reservas){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback([]);
        }else{
            traducirReservas(reservas, function(traducidas){
                return callback(traducidas);
            });
        }
    });
}

//dado un array de reservas, las devuelve con los id's traducidos
function traducirReservas(reservas, callback){
    var traducidas = [];
    if(reservas.length == 0){
        return callback(traducidas);
    }

    var pendientes = reservas.length;
    for(let i = 0; i < reservas.length; i++){
        let reserva = {...reservas[i]};
        var sql = "SELECT nombre, apellidos FROM sanitarios WHERE id = ?";
        var params = [reserva.sanitario];
        conexion.query(sql, params, function(err, sanitario){
            if(err){
                console.log("Error en la consulta a la base de datos");
            }else{
                sanitario = sanitario[0];
                reserva.sanitario = sanitario.nombre + " " + sanitario.apellidos;
                traducidas.push(reserva);
            }
            pendientes--;
            if(pendientes == 0){
                return callback(traducidas);
            }
        });
    }
}

function obtenerRecurso(idRecurso, callback){
    var sql = "SELECT * FROM recursos WHERE id = ?";
    var params = [idRecurso];
    conexion.query(sql,params,function(err, recurso){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else if(recurso.length == 0){
            console.log("No existe un recurso con ese id");
            return callback([]);
        }else{
            traducirRecurso(recurso[0], function(traducido){
                return callback (traducido);
            });
        }
    });
}

function traducirRecurso(recursoViejo, callback){
    //{"numero_serie": "454554", "categoria": 1, "modelo": 1, "ubicacion": 2, "estado": 0, "id":1}
    
    var recurso = {...recursoViejo};
    
    var sql = "SELECT nombre FROM categorias WHERE id = ?;SELECT nombre FROM modelos WHERE id = ?;SELECT nombre FROM ubicaciones WHERE id = ?;";
    var params = [recurso.categoria, recurso.modelo,recurso.ubicacion];

    conexion.query(sql,params, function(err,respuestas){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else if(respuestas[0].length == 0 || respuestas[1].length == 0 || respuestas[2].length == 0){
            console.log("Categoria, modelo o ubicacion del recurso no fue encontrada");
            return callback(null);
        }else{
            recurso.categoria = respuestas[0][0].nombre;
            recurso.modelo = respuestas[1][0].nombre;
            recurso.ubicacion = respuestas[2][0].nombre;

            //estado
            switch(recurso.estado){
            case 0:
                recurso.estado = "operativo";
                break;
            case 1:
                recurso.estado = "de baja o defectuoso";
                break;
            case 2:
                recurso.estado = "en mantenimiento";
                break;
            }

            return callback(recurso);
        }
    });
}

function tiempoPendiente(idRecurso, callback){
    var sql = "SELECT horas_estimadas, TIMESTAMPDIFF(SECOND, fecha_inicio, NOW()) AS segundos " +
              "FROM reservas WHERE recurso = ? AND fecha_inicio IS NOT NULL AND fecha_fin IS NULL;";

    conexion.query(sql, [idRecurso], function(err, reservas){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else if(reservas.length == 0){
            return callback(0);
        }

        var restanteSeg = reservas[0].horas_estimadas * 3600 - reservas[0].segundos;
        if(restanteSeg <= 0){
            return callback(0);
        }
        return callback(Math.round((restanteSeg / 3600) * 100) / 100);
    });
}

function actualizarSanitarios(idSanitario,datosSanitario,callback){
    //si hay campos vacíos damos error y se lo decimos
    if(!datosSanitario.nombre||!datosSanitario.apellidos||!datosSanitario.usuario){
        return callback([null,"No puede haber campos vacíos"]);
    }

    //corroboramosque no hay ningún sanitario y con ese mismo login
    var sqlUsuario = "SELECT id FROM sanitarios WHERE usuario = ? AND id <> ?";
    var paramsUsuario = [datosSanitario.usuario,idSanitario];

    conexion.query(sqlUsuario,paramsUsuario, function(err, respuesta){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback([null,"Error en la consulta a la base de datos"]);
        }else if(respuesta.length != 0){
            console.log("Otro sanitario ya tiene ese usuario");
            return callback([null,"Otro sanitario ya tiene ese usuario"]);
        }else{
            //ahora si lo actualizamos
            var sql = "UPDATE sanitarios SET nombre = ?, apellidos = ?, usuario = ? WHERE id = ?;";
            var params = [datosSanitario.nombre, datosSanitario.apellidos, datosSanitario.usuario, idSanitario];
            
            conexion.query(sql,params, function(err, respuesta){
                if(err){
                    console.log("Error en la consulta a la base de datos");
                    return callback([null,"Error en la consulta a la base de datos"]);
                }else if(respuesta.affectedRows == 0){
                    console.log("No se encontró ningún sanitario con ese id");
                    return callback([null,"No se encontró ningún sanitario con ese id"]);
                }else{
                    return callback([true,"Usuario actualizado"]);
                }
            });
        }
    });

    
}

function obtenerCategorias(callback){
    var sql = "SELECT * FROM categorias;";
    
    conexion.query(sql, function(err, categorias){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else if(categorias.length == 0){
            console.log("No sé encontró ninguna categoria");
            return callback(null);
        }else{
            return callback(categorias);
        }
    });
}

function obtenerModelos(callback){
    var sql = "SELECT * FROM modelos;";
    
    conexion.query(sql, function(err, modelos){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else if(modelos.length == 0){
            console.log("No sé encontró ningun modelo");
            return callback(null);
        }else{
            return callback(modelos);
        }
    });
}

function obtenerRecursos(idModelo, callback){
    var sql = "SELECT * FROM recursos WHERE modelo = ? AND estado = 0;";
    var params = [idModelo];

    conexion.query(sql,params, function(err, recursos){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else if(recursos.length == 0){
            console.log("No sé encontró ningun recurso");
            return callback([]);
        }else{
            return callback(recursos);
        }
    });
}

function iniciarReserva(idReserva, callback){
    var sqlReserva = "SELECT recurso, fecha_inicio FROM reservas WHERE id = ?";

    conexion.query(sqlReserva, [idReserva], function(err, reservas){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback([null, "Error en la consulta a la base de datos"]);
        }else if(reservas.length == 0){
            return callback([null, "No se encontró ninguna reserva con ese id"]);
        }else if(reservas[0].fecha_inicio != null){
            return callback([null, "Esa reserva ya está iniciada"]);
        }

        // ¿hay otra reserva iniciada y sin finalizar del mismo recurso?
        var sqlEnUso = "SELECT id FROM reservas WHERE recurso = ? AND fecha_inicio IS NOT NULL AND fecha_fin IS NULL";
        conexion.query(sqlEnUso, [reservas[0].recurso], function(err, enUso){
            if(err){
                console.log("Error en la consulta a la base de datos");
                return callback([null, "Error en la consulta a la base de datos"]);
            }else if(enUso.length != 0){
                return callback([null, "El recurso está en uso ahora mismo"]);
            }

            var sql = "UPDATE reservas SET fecha_inicio = NOW() WHERE id = ? AND fecha_inicio IS NULL";
            conexion.query(sql, [idReserva], function(err, respuesta){
                if(err){
                    console.log("Error en la consulta a la base de datos");
                    return callback([null, "Error en la consulta a la base de datos"]);
                }else if(respuesta.affectedRows == 0){
                    return callback([null, "No se pudo iniciar la reserva"]);
                }
                return callback([true, "Reserva Iniciada"]);
            });
        });
    });
}

function finalizarReserva(idReserva, callback){
    // solo se finaliza si está iniciada y no finalizada
    var sql = "UPDATE reservas SET fecha_fin = NOW() WHERE id = ? AND fecha_inicio IS NOT NULL AND fecha_fin IS NULL";

    conexion.query(sql, [idReserva], function(err, respuesta){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback([null, "Error en la consulta a la base de datos"]);
        }else if(respuesta.affectedRows == 0){
            return callback([null, "La reserva no existe, no está iniciada o ya está finalizada"]);
        }
        return callback([true, "Reserva finalizada"]);
    });
}

function cancelarReserva(idReserva, callback){
    var sql = "DELETE FROM reservas WHERE id = ?";
    var params = [idReserva];

    conexion.query(sql, params, function(err, respuesta){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback([null, "Error en la consulta a la base de datos"]);
        }else if(respuesta.affectedRows == 0){
            console.log("No se encontró ninguna reserva con ese id");
            return callback([null, "No se encontró ninguna reserva con ese id"]);
        }else{
            return callback([true, "Reserva eliminada"]);
        }
    });
}

function reservarRecurso(idRecurso, idSanitario, horasEstimadas, callback){

    horasEstimadas = Number(horasEstimadas);
    if(!Number.isFinite(horasEstimadas) || horasEstimadas <= 0){
        return callback(null);
    }

    var sql = "INSERT INTO reservas (sanitario, horas_estimadas, fecha_inicio, fecha_fin, recurso) VALUES (?, ?, NULL, NULL, ?)";
    var params = [idSanitario, horasEstimadas, idRecurso];

    conexion.query(sql, params, function(err, respuesta){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else{
            return callback(respuesta.insertId);
        }
    });
}

function crearResenya(idRecurso, idSanitario, valoracion, descripcion, callback){
    
    valoracion = parseInt(valoracion);
    if(isNaN(valoracion) || valoracion < 1 || valoracion > 5){
        return callback(null);
    }
    
    valoracion = parseInt(valoracion);

    var sql = "INSERT INTO resenyas (sanitario, valor, descripcion, recurso) VALUES (?, ?, ?, ?)";
    var params = [idSanitario, valoracion, descripcion, idRecurso];

    conexion.query(sql, params, function(err, respuesta){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else{
            return callback(respuesta.insertId);
        }
    });
}

function obtenerResenyas(idRecurso, callback){
    var sql = "SELECT * FROM resenyas WHERE recurso = ?";
    var params = [idRecurso];

    conexion.query(sql, params, function(err, resenyas){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }else{
            return callback(resenyas);
        }
    });
}

function formatearFecha(fechaISO) {
    if(!fechaISO){
        return null;
    }

  const fecha = new Date(fechaISO);

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();

  return `${dia}/${mes}/${año}`;
}

function anyadirHoras(idReserva, callback){
    var sqlSelect = "SELECT * FROM reservas WHERE id = ?";
    var paramsSelect = [idReserva];

    conexion.query(sqlSelect, paramsSelect, function(err, reservas){
        if(err){
            console.log("Error en la consulta a la base de datos");
            return callback(0);
        }else if(reservas.length == 0){
            console.log("No se encontró ninguna reserva con ese id");
            return callback(0);
        }else{
            var reserva = reservas[0];

            if(reserva.fecha_fin != null){
                return callback(0);
            }

            var nuevasHoras = reserva.horas_estimadas + 1;
            var sqlUpdate = "UPDATE reservas SET horas_estimadas = ? WHERE id = ?";
            var paramsUpdate = [nuevasHoras, idReserva];

            conexion.query(sqlUpdate, paramsUpdate, function(err, respuesta){
                if(err){
                    console.log("Error al actualizar las horas estimadas");
                    return callback(0);
                }else{
                    return callback(nuevasHoras);
                }
            });
        }
    });
}

function leerEtiqueta(idRecurso, idSanitario, callback) {
    const sql = "SELECT * FROM reservas WHERE recurso = ?;";

    conexion.query(sql, [idRecurso], function (err, reservas) {
        if (err) {
            console.log("Error en la consulta a la base de datos");
            return callback(null);
        }

        // 1. Hay una reserva iniciada y sin terminar -> se finaliza
        const reservaAbierta = reservas.find(r => r.fecha_inicio != null && r.fecha_fin == null);
        if (reservaAbierta) {
            return finalizarReserva(reservaAbierta.id, function (respuesta) {
                console.log(respuesta[1]);
                callback(respuesta[1]);
            });
        }

        // 2. El usuario tiene una reserva pendiente de iniciar -> se inicia
        const reservaSinIniciar = reservas.find(
            r => r.fecha_inicio == null && r.fecha_fin == null && r.sanitario == idSanitario
        );
        if (reservaSinIniciar) {
            return iniciarReserva(reservaSinIniciar.id, function (respuesta) {
                console.log(respuesta[1]);
                callback(respuesta[1]);
            });
        }

        // 3. No hay nada abierto ni pendiente del usuario -> se crea reserva nueva
        reservarRecurso(idRecurso, idSanitario, 5, function (idReserva) {
            iniciarReserva(idReserva, function(respuesta){
                callback("Reserva creada e iniciada con éxito");
            })
        });
    });
}


var servidor = rpc.server(); // crear el servidor RPC en el puerto 3501 por defecto
var app = servidor.createApp("app_sanitarios"); // crear aplicación de RPC

//Registramos los procedimientos
app.registerAsync(loginSanitario);
app.registerAsync(obtenerSanitario);
app.registerAsync(crearSanitario);
app.registerAsync(obtenerReservas);
app.registerAsync(obtenerRecurso);
app.registerAsync(tiempoPendiente);
app.registerAsync(actualizarSanitarios);
app.registerAsync(obtenerCategorias);
app.registerAsync(obtenerModelos);
app.registerAsync(finalizarReserva);
app.registerAsync(obtenerRecursos);
app.registerAsync(iniciarReserva);
app.registerAsync(cancelarReserva);
app.registerAsync(reservarRecurso);
app.registerAsync(crearResenya);
app.registerAsync(obtenerResenyas);
app.registerAsync(anyadirHoras);
app.registerAsync(leerEtiqueta);

