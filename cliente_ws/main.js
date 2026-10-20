var conexion = null;

function conectarseServidor(id, tipoUsuario) {

    conexion = new WebSocket("ws://localhost:4444", "conectarse");

    // conexión realizada
    conexion.addEventListener("open", function () {

        console.log("Ya estoy conectado con el servidor");

        // nos identificamos
        conexion.send(JSON.stringify({
            operacion: "identificarse",
            id: id,
            tipo: tipoUsuario
        }));

    

        // atendemos mensajes entrantes
        conexion.addEventListener("message", function (msg) {

            msg = JSON.parse(msg.data);

            //refreso todo
            cargarInicio();

            let tabla = document.getElementById("cuerpo_avisos");
            let fila = document.createElement("tr");

            let celdaFecha = document.createElement("td");
            celdaFecha.textContent = msg.fecha;
            fila.appendChild(celdaFecha);

            let celdaOrigen = document.createElement("td");
            celdaOrigen.textContent = msg.origen;
            fila.appendChild(celdaOrigen);

            let celdaTexto = document.createElement("td");
            celdaTexto.textContent = msg.texto;
            fila.appendChild(celdaTexto);

            //depende de que operación asignamos el color
            switch(msg.operacion){
                case "reservaModificada":
                    fila.style.setProperty("background-color", "red", "important");
                break;
                    
                case "recursoCreado":
                    fila.style.setProperty("background-color", "blue", "important");
                break;

                case "resenyaCreada":
                    fila.style.setProperty("background-color", "green", "important");
                break;

            }

            tabla.appendChild(fila);

        });
    });
}

function reservaModificadaServidor(idReserva,tipo){
    conexion.send(JSON.stringify({
        operacion: "reservaModificada",
        reserva: idReserva,
        tipo: tipo,
        fecha: obtenerFechaActual()
    }));
}

function recursoCreadoWS(idRecurso){
    conexion.send(JSON.stringify({
        operacion: "recursoCreado",
        recurso: idRecurso,
        fecha: obtenerFechaActual()
    }));
}

function resenyaCreadaWS(idResenya){
    conexion.send(JSON.stringify({
        operacion: "resenyaCreada",
        resenya: idResenya,
        fecha: obtenerFechaActual()
    }));
}

function desconectarseServidor(){
    conexion.close();
    document.getElementById("cuerpo_avisos").innerHTML = "";
    console.log("Me he desconectado del servidor");
}

function obtenerFechaActual() {
    let fecha = new Date();

    let dia = String(fecha.getDate()).padStart(2, '0');
    let mes = String(fecha.getMonth() + 1).padStart(2, '0');
    let anio = String(fecha.getFullYear()).slice(-2);

    return `${dia}/${mes}/${anio}`;
}