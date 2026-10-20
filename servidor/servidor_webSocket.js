//#region enlazar con BD
//var datos=require("./datos.js");
var sanitarios = [];
var reservas = [];
var recursos = [];
var categorias = [];
var modelos = [];
var ubicaciones = [];
var resenyas = [];
var gestores = [];
//#endregion

// #region crear servidor 
// Crear un servidor HTTP
var http = require("http");
var httpServer = http.createServer();

// Crear servidor WS
// Necesita tener instalado el módulo websocket:
// npm install websocket
var WebSocketServer = require("websocket").server; // instalar previamente: npm install websocket
var wsServer = new WebSocketServer({
	httpServer: httpServer
});

// Iniciar el servidor HTTP en un puerto
var puerto = 4444;
httpServer.listen(puerto, function () {
	console.log("Servidor de WebSocket iniciado en puerto:", puerto);
});
//#endregion
var usuariosConectados = []; // array de los clientes que se conectan

// Esperar a clientes...
wsServer.on("request", function (request) { // este callback se ejecuta cuando llega una nueva conexión de un cliente
	//#region conectarse
	var connection = request.accept("conectarse", request.origin); // aceptar conexión
	var usuario = { // creo un nuevo usuario
		connection: connection,
		id: null,
		tipo: null
	};
	usuariosConectados.push(usuario); // lo añado a la lista de clientes
	console.log("Usuario conectado. Ahora son:", usuariosConectados.length);
	//#endregion

	//atendemos mensajes entrantes
	connection.on("message", function (message) { // mensaje recibido del cliente

		if (message.type === "utf8") { // es un mensaje de texto
			console.log("Mensaje recibido de usuario: " + message.utf8Data);
			var msg = JSON.parse(message.utf8Data); // pasar de cadena a objeto

			var texto="";
			var recurso;
			var modelo;
			var categoria;
			var resenya;
			var nombreUsuario;

			switch (msg.operacion) {
				case "identificarse":
					usuario.id = msg.id;
					usuario.tipo = msg.tipo;
				break;

				case "reservaModificada":
					let reserva = getReserva(msg.reserva);
					if (!reserva) break;

					recurso = getRecurso(reserva.recurso);
					modelo = getModelo(recurso.modelo);
					categoria = getCategoria(modelo.categoria);
					nombreUsuario = getNombreUsuario(usuario.id);

					let sanitariosAvisar = sanitariosActivosConRecurso(recurso.id);
					//me borro a mi mismo así no me aviso a mi mismo
					for(let i = 0; i < sanitariosAvisar.length; i++){
						if(sanitariosAvisar[i].id == usuario.id){
							sanitariosAvisar.splice(i,1);
						}
					}

					if (msg.tipo == "iniciada"){
						texto = "SE HA INICIADO LA RESERVA DEL "+categoria.nombre+" MODELO "+modelo.nombre+" CON CÓDIGO "+recurso.numero_serie;
					}else{
						texto = "SE HA FINALIZADO LA RESERVA DEL "+categoria.nombre+" MODELO "+modelo.nombre+" CON CÓDIGO "+recurso.numero_serie;
					}
					

					for(let i = 0; i < sanitariosAvisar.length; i++){
						sanitariosAvisar[i].connection.sendUTF(JSON.stringify({
							operacion: "reservaModificada",
							origen: nombreUsuario,
							texto: texto,
							fecha: msg.fecha
						}));
					}

				break;

				case "recursoCreado":
					recurso = getRecurso(msg.recurso);
					modelo = getModelo(recurso.modelo);
					categoria = getCategoria(recurso.categoria);
					nombreUsuario = getNombreUsuario(usuario.id, usuario.tipo);

					if (!recurso) break;

					texto = "SE HA CREADO UN NUEVO RECURSO "+categoria.nombre+" MODELO "+modelo.nombre+" CON CÓDIGO "+recurso.numero_serie;

					for(let i = 0; i < usuariosConectados.length; i++){
						if(usuariosConectados[i].tipo == "sanitario"){
							usuariosConectados[i].connection.sendUTF(JSON.stringify({
								operacion: "recursoCreado",
								texto: texto,
								origen: nombreUsuario,
								fecha: msg.fecha
							}));
						}
					}


				break;
				
				case "resenyaCreada":
					resenya = getResenya(msg.resenya);
					recurso = getRecurso(resenya.recurso);
					modelo = getModelo(recurso.modelo);
					categoria = getCategoria(recurso.categoria);
					nombreUsuario = getNombreUsuario(usuario.id);

					if (!resenya) break;

					texto = "SE HA CREADO UNA RESEÑA PARA EL "+categoria.nombre+" MODELO "+modelo.nombre+" CON CÓDIGO "+recurso.numero_serie+" Y PUNTUACIÓN "+resenya.valor;

					for(let i = 0; i < usuariosConectados.length; i++){
						if(usuariosConectados[i].tipo == "gestor"){
							usuariosConectados[i].connection.sendUTF(JSON.stringify({
								operacion: "resenyaCreada",
								texto: texto,
								origen: nombreUsuario,
								fecha: msg.fecha
							}));
						}
					}
				break;
			}
		}
	});
	
});



//#region funciones auxiliares
//le das el id de un recurso y te devuelve una lista de todos los sanitarios con una reserva iniciada en dicho recurso
function sanitariosActivosConRecurso(idRecurso){
	let seleccionados = [];

	for(let i = 0; i < reservas.length; i++){
		if (
            reservas[i].recurso === idRecurso &&
            !reservas[i].fecha_inicio &&
            !reservas[i].fecha_fin
        ){
			seleccionados.push(reservas[i].sanitario);
		}
	}
	//tengo todos los sanitarios con una reserva no finalizada de x recurso

	// convertir IDs → conexiones activas
	let resultado = [];

	for(let i = 0; i < seleccionados.length; i++){
		for(let a = 0; a < usuariosConectados.length; a++){
			if(usuariosConectados[a].id === seleccionados[i] && usuariosConectados[a].tipo == "sanitario"){
				resultado.push(usuariosConectados[a]);
			}
		}
	}

	return resultado;
}

function getReserva(idReserva){
    for(let i = 0; i < reservas.length; i++){
        if (reservas[i].id === idReserva){
            return reservas[i];
        }
    }
    return null;
}

function getRecurso(idRecurso){
    for (let i = 0; i < recursos.length; i++){
        if (recursos[i].id === idRecurso){
            return recursos[i];
        }
    }
    return null;
}

function getModelo(idModelo){
    for (let i = 0; i < modelos.length; i++){
        if (modelos[i].id == idModelo){
            return modelos[i];
        }
    }
    return null;
}

function getCategoria(idCategoria){
    for (let i = 0; i < categorias.length; i++){
        if (categorias[i].id == idCategoria){
            return categorias[i];
        }
    }
    return null;
}

function getResenya(idResenya){
	for(let i = 0; i< resenyas.length; i++){
		if(resenyas[i].id == idResenya){
			return resenyas[i];
		}
	}
	return null;
}

function getNombreUsuario(idUsuario,tipo){
	if(tipo == "gestor"){
		for(let i = 0; i < gestores.length; i++){
			if(gestores[i].id == idUsuario){
				return (gestores[i].nombre+" "+gestores[i].apellidos);
			}
		}
	}else{
		for(let i = 0; i < sanitarios.length; i++){
			if(sanitarios[i].id == idUsuario){
				return (sanitarios[i].nombre+" "+sanitarios[i].apellidos);
			}
		}
	}
}
//#endregion



