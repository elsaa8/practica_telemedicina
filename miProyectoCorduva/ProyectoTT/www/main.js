//alumnos: Elsa Fuentes Muñoz y Santiago Ferreira Schiro

//Vinculamos cliente - servidor
var app = rpc("192.168.1.150" ,"app_sanitarios");

//variable para saber quien está logeado
var usuarioLogeado;

//variable para saber en que página del index estamos
var seccionActual="login";

//guardamos ya que modelos y categorias tenemos para no estar todo el tiempo llamando a la base de datos
var categoriasGlobal= [];
var modelosGlobal = [];
let idRecursoActual = null;

//variable global para saber si estamos escribiendo o leyendo NFC
var escrituraNFC = false;

//Obtener referencias a los procedimientos remotos registrados por el servidor.
var loginSanitario = app.procedure("loginSanitario"); //obtenerPacientes es una funcion
var obtenerSanitario = app.procedure("obtenerSanitario");
var crearSanitario = app.procedure("crearSanitario");
var obtenerReservas = app.procedure("obtenerReservas");
var obtenerRecurso = app.procedure("obtenerRecurso");
var tiempoPendiente = app.procedure("tiempoPendiente");
var actualizarSanitarios = app.procedure("actualizarSanitarios");
var obtenerCategorias = app.procedure("obtenerCategorias");
var obtenerModelos = app.procedure("obtenerModelos");
var obtenerRecursos = app.procedure("obtenerRecursos");
var finalizarReserva = app.procedure("finalizarReserva");
var iniciarReserva = app.procedure("iniciarReserva");
var cancelarReserva = app.procedure("cancelarReserva");
var reservarRecurso = app.procedure("reservarRecurso");
var crearResenya = app.procedure("crearResenya");
var obtenerResenyas = app.procedure("obtenerResenyas");
var anyadirHoras = app.procedure("anyadirHoras");
var leerEtiqueta = app.procedure("leerEtiqueta");

function login(){
    var usuario = document.getElementById("usuario").value, contrasenya = document.getElementById("contrasenya").value;
    loginSanitario(usuario, contrasenya, function(respuesta) {
        if (!respuesta[0]) {
            alert(respuesta[1]);
        }else {
            obtenerSanitario(respuesta[1], function(sanitario){
                if(!sanitario[0]){
                    alert(sanitario[1]);
                }else{
                    usuarioLogeado=sanitario[1];
                    cambiarSeccion("inicio");
                    //conectarseServidor(usuarioLogeado.id,"sanitario");
                }
            });
        }
    });
    
}

function cambiarSeccion(seccion){
    //si estamos yendo al incio cargamos todos los datos antes de ir
    if(seccion == "inicio"){
        cargarInicio();
    }
    //hacemos lo mismo si nos vamos a crear nueva reserva
    if(seccion == "nuevaReserva"){
        cargarNuevaReserva();
    }

    document.getElementById(seccionActual).classList.remove("activa");
    document.getElementById(seccion).classList.add("activa");
    seccionActual=seccion;
}

function cargarInicio(){
    //muestro el nombre por pantalla
    document.getElementById("nombreUsuario").textContent=usuarioLogeado.nombre +" "+ usuarioLogeado.apellidos+" ";

    cargarReservasPendientes();
    cargarReservasFinalizadas();

}

function registrar(){
    document.getElementById("nombreRegistro").value ="";
    document.getElementById("apellidosRegistro").value ="";
    document.getElementById("loginRegistro").value ="";
    document.getElementById("contrasenyaRegistro").value ="";

    cambiarSeccion("registroSanitario");
}

function cancelar(){
    cambiarSeccion("login");
}

function guardarSanitario(){
    var nombre=document.getElementById("nombreRegistro").value;
    var apellidos=document.getElementById("apellidosRegistro").value;
    var usuario=document.getElementById("loginRegistro").value;
    var password=document.getElementById("contrasenyaRegistro").value;
    var datosSanitario={"id":"nn","nombre":nombre,"apellidos":apellidos,"usuario":usuario,"password":password};
    
    crearSanitario(datosSanitario, function(res){
            if(!res[0]){
                alert(res[1]);
            }
            else{
                alert(res[1]);
                cambiarSeccion("login");
            }
    });
}

function salir(){
    usuarioLogeado = null;
    document.getElementById("usuario").value = "";
    document.getElementById("contrasenya").value = "";
    document.getElementById("cuerpoReservasPendientes").innerHTML = "";
    document.getElementById("cuerpoReservasRealizadas").innerHTML = "";
    document.getElementById("cuerpo_avisos").innerHTML = "";
    cambiarSeccion("login");
    //desconectarseServidor();
}

function cargarReservasPendientes(){

    obtenerReservas(usuarioLogeado.id, function(reservas){
        //filtramos las que no tengas fecha de inicio
        var filtradas = [];
        for(let i = 0; i < reservas.length ; i++){
            if(!reservas[i].fecha_inicio){
                filtradas.push(reservas[i]);
            }
        }
        //filtradas
        conseguirFilasPendientes(filtradas, function(filas){
            imprimirPendientes(filas);
        });
    });
}

function imprimirPendientes(reservas){

    //limpiamos la tabla
    let tabla = document.getElementById("cuerpoReservasPendientes");
    tabla.innerHTML ="";

    //ahora cargamos la tabla con todos los recursos
    for (let i = 0; i < reservas.length; i++){
        let reserva =reservas[i];
        // Crear fila
        let fila = document.createElement("tr");


        // Crear celdas y llenarlas
        for (let key in reserva) {
            if (key === "id") continue;
            if(key == "fpet"){
                reserva.fpet = formatearFecha(reserva.fpet);
            }
            const celda = document.createElement("td");
            celda.textContent = reserva[key];
            fila.appendChild(celda);
        }

        //creo el boton de retirar
        let celdaRetirar = document.createElement("td");
        let botonRetirar = document.createElement("button");
        botonRetirar.textContent = "retirar";
        botonRetirar.onclick = function() {
            retirar(reserva.id);
            //reservaModificadaServidor(reserva.id,"iniciada");
        };

        if(reserva.hrest == 0){
            celdaRetirar.appendChild(botonRetirar);
        }
        fila.appendChild(celdaRetirar);
        
        //creo el boton de borrar
        let celdaBorrar = document.createElement("td");
        let borrar = document.createElement("button");
        borrar.textContent = "X";
        borrar.onclick = function() {
            borrarReserva(reserva.id);
        };
        celdaBorrar.appendChild(borrar);
        fila.appendChild(celdaBorrar);

        // Agregar fila a la tabla
        tabla.appendChild(fila);
    }
}

function conseguirFilasPendientes(reservas, callback){
    var diccionarios = []; 
    var restantes = reservas.length;
    
    //si está vacia no hacemos nada
    if(restantes == 0){
        callback(diccionarios);
    }

    for(let a = 0; a < reservas.length; a++){
        let idRecurso = reservas[a].recurso;
        //{"id":1,"sanitario":2,"horas_estimadas":3,"fecha_peticion":"2026-02-10T09:15:00","fecha_inicio":"2026-02-11T08:00:00","fecha_fin":"2026-02-11T11:00:00","recurso":1}
        let fila = {"categoria": null, "modelo": null, "nserie": null, "ubic": null, "fpet": reservas[a].fecha_peticion, "hrest": null, "id": reservas[a].id};

        obtenerRecurso(idRecurso, function(recurso){
            fila.categoria = recurso.categoria;
            fila.modelo = recurso.modelo;
            fila.nserie = recurso.numero_serie;
            fila.ubic = recurso.ubicacion;

            tiempoPendiente(idRecurso, function(horas){
                fila.hrest = horas;
                diccionarios.push(fila);
                restantes--;
                
                if(restantes == 0){
                    callback(diccionarios);
                }
            });
        });
    }
}

function editar(){
    cambiarSeccion("editarSanitario");
}

function cancelarCambios(){
    cambiarSeccion("inicio");
}

function guardarCambios(){
    var nombre=document.getElementById("nombreSanitario").value;
    var apellidos=document.getElementById("apellidosSanitario").value;
    var usuario=document.getElementById("loginSanitario").value;
    var id=usuarioLogeado.id;
    var sanitarioActualizado={"nombre":nombre,"apellidos":apellidos,"usuario":usuario};
    
    actualizarSanitarios(id,sanitarioActualizado, function(res){
        if(res[0]){
            alert("editado correctamente");

            usuarioLogeado.nombre=nombre;
            usuarioLogeado.apellidos=apellidos;
            usuarioLogeado.usuario=usuario;
            
            document.getElementById("nombreSanitario").value="";
            document.getElementById("apellidosSanitario").value="";
            document.getElementById("loginSanitario").value="";

        cambiarSeccion("inicio");
        }
        else{
            alert(res[1]);
        }
});
}

function borrarReserva(idReserva){
    cancelarReserva(idReserva, function(respuesta){
        if(respuesta[0]){
            cargarReservasPendientes();
        }else{
            alert(respuesta[1]);
        }
    });
}

function retirar(idReserva){
    iniciarReserva(idReserva, function(respuesta){
        if(respuesta[0]){
            //reservaModificadaServidor(idReserva, "iniciada");
            cargarReservasPendientes();
            cargarReservasFinalizadas();
        }else{
            alert(respuesta[1]);
        }
    });
}

function devolver(id){
    finalizarReserva(id, function(respuesta){
        if(respuesta[0]){
            //reservaModificadaServidor(id, "finalizada");
            cargarInicio();
        }else{
            alert(respuesta[1]);
        }
    });
}

function cargarReservasFinalizadas(){
    var acabadas = [];
    obtenerReservas(usuarioLogeado.id,function(reservas){
        for(let i=0;i<reservas.length;i++){
            if(reservas[i].fecha_inicio){
                acabadas.push(reservas[i]);
            }
        }
        
        obtenerFilasFinalizadas(acabadas);
    });      
}

function obtenerFilasFinalizadas(reserv){
    let finalizadas=[];
    
    // sin reservas: llamamos igual para que se limpie la tabla
    if(reserv.length == 0){
        imprimirFilasFinalizadas(finalizadas);
        return;
    }

    for(let i=0;i<reserv.length;i++){
            obtenerRecurso(reserv[i].recurso, function(recurso){
            var categoria=recurso.categoria;
            var modelo=recurso.modelo;
            var Nserie=recurso.numero_serie;
            var horasEstimadas=reserv[i].horas_estimadas;
            var principio=reserv[i].fecha_inicio;
            var final=reserv[i].fecha_fin;
            var id=reserv[i].id;
            var idRecurso=recurso.id;
            var fila={"id":id,"recurso":idRecurso,"categoria":categoria,"modelo":modelo,"numero_serie":Nserie,"horas_estimadas":horasEstimadas,"fecha_inicio":principio,"fecha_fin":final}
            
            finalizadas.push(fila);
            if(finalizadas.length==reserv.length){
                imprimirFilasFinalizadas(finalizadas);
            }
        });
        
    } 
}

function imprimirFilasFinalizadas(reservas){

    let tabla=document.getElementById("cuerpoReservasRealizadas");
    tabla.innerHTML ="";

    for (let i = 0; i < reservas.length; i++){
        
        let reserva =reservas[i];

        // Crear fila
        let fila = document.createElement("tr");

        // Crear celdas y llenarlas
        for (let key in reserva) {
            if (key === "id") continue;
            if (key === "recurso") continue;

            if (key === "fecha_fin" && !reserva[key]){
                continue;
            }else if(key === "fecha_fin" && reserva[key]){
                reserva.fecha_fin = formatearFecha(reserva.fecha_fin);
            } 

            if(key == "fecha_inicio"){
                reserva.fecha_inicio = formatearFecha(reserva.fecha_inicio);
            }
            const celda = document.createElement("td");
            celda.textContent = reserva[key];
            fila.appendChild(celda);

        }

        if (reserva.fecha_fin == null) {
            let celdaBoton = document.createElement("td");

            let boton = document.createElement("button");
            boton.textContent = "Devolver";

            
            boton.onclick = function() {
                devolver(reserva.id);
                //reservaModificadaServidor(reserva.id,"finalizada")
            };
          

            celdaBoton.appendChild(boton);
            fila.appendChild(celdaBoton);
        }

        //creo el boton de reseña
        let celdaResenya=document.createElement("td");
        let resenya = document.createElement("button");
        resenya.textContent = "Reseña";
        resenya.onclick = function() {
            abrirResenya(reserva.recurso, reserva.numero_serie);  
        };
        
        celdaResenya.appendChild(resenya);
        fila.appendChild(celdaResenya);

     tabla.appendChild(fila);

    }
}


function rellenarModelos(){
    let catId = document.getElementById("categoriaNuevaReserva").value;
    let selectModelo = document.getElementById("modeloNuevaReserva");

    // limpiar modelos anteriores (esto era lo que faltaba)
    selectModelo.innerHTML = "";

    for(let i = 0; i < modelosGlobal.length; i++){
        if(catId == modelosGlobal[i].categoria){
            let option = document.createElement("option");
            option.value = modelosGlobal[i].id;
            option.textContent = modelosGlobal[i].nombre;
            selectModelo.appendChild(option);
        }
    }
}

function cargarNuevaReserva(){
    document.getElementById("cuerpoNuevaReserva").innerHTML = "";

    obtenerCategorias(function(categorias){
        if(!categorias){
            alert("Error al cargar las categorías");
            return;
        }
        categoriasGlobal = categorias;
        let select = document.getElementById("categoriaNuevaReserva");
        select.innerHTML = "";

        for(let i = 0; i < categorias.length; i++){
            let option = document.createElement("option");
            option.value = categorias[i].id;
            option.textContent = categorias[i].nombre;
            select.appendChild(option);
        }

        obtenerModelos(function(modelos){
            if(!modelos){
                alert("Error al cargar los modelos"); // antes ponía "categorías"
                return;
            }
            modelosGlobal = modelos;
            rellenarModelos();
            // ya no hay selectModelo.value = catId
        });
    });
}

document.getElementById("categoriaNuevaReserva").addEventListener("change", function() {
    let catId = document.getElementById("categoriaNuevaReserva").value;
    let selectModelo = document.getElementById("modeloNuevaReserva");

    // limpiar modelos anteriores
    selectModelo.innerHTML = "";

    // agregar modelos que correspondan
    for(let i = 0; i < modelosGlobal.length ; i++){
        if(catId == modelosGlobal[i].categoria){
            let option = document.createElement("option");
            option.value = modelosGlobal[i].id;
            option.textContent = modelosGlobal[i].nombre;
            selectModelo.appendChild(option);
        }
    }

});

function buscarRecursos(){
    var idModelo = document.getElementById("modeloNuevaReserva").value;
    obtenerRecursos(idModelo, function(recursos){
        if(!recursos){
            alert("Error al cargar los recursos");
            return;
        }else if(recursos.length == 0){
            alert("No hay ningún recurso con este modelo");
            document.getElementById("cuerpoNuevaReserva").innerHTML="";
            return;
        }
        filasRecursos(recursos, function(filas){
            imprimirRecursos(filas);
        });
    });
}

function filasRecursos(recursos, callback){
    let salida = [];
    //contador para saber cuando conseguimos ya todos los recursos asi mandamos la respuesta completa
    let restantes = recursos.length;

    //por si llega una rray vacío, osea no hay recursos
    if(recursos.length == 0){
        return callback(salida);
    }

    for(let i = 0; i< recursos.length; i++){
        let recurso = recursos[i];

        //lo reordeno para poder imprimirlo más fácil
        recurso = {"numero_serie": recurso.numero_serie, "ubicacion": recurso.ubicacion, "hRest":null, "valoracion":null, "id": recurso.id};

        obtenerResenyas(recurso.id, function(resenyas){
            let promedio = 0;

            for(let i = 0; i < resenyas.length; i++){
                promedio = promedio + resenyas[i].valor;
            }
            if(resenyas.length == 0){
                promedio = 0;
            }else{
                promedio = promedio/resenyas.length;
                promedio = Number(promedio.toFixed(1));
            }
            
            recurso.valoracion = promedio;

            tiempoPendiente(recurso.id, function(tiempo){
                recurso.hRest=tiempo;
                restantes--;
                salida.push(recurso);

                if(restantes == 0){
                    return callback(salida);
                }
            });
        });
    }
}

//necesita que le pasen por argumento los recursos ya hechos filas, no los originales
function imprimirRecursos(recursos){

    //limpio la tabla
    let tabla=document.getElementById("cuerpoNuevaReserva");
    tabla.innerHTML ="";

    for(let i = 0; i < recursos.length; i++){
        let recurso = recursos[i];

        // Crear fila
        let fila = document.createElement("tr");

        // Crear celdas y llenarlas
        for (let key in recurso) {
            const celda = document.createElement("td");
            if (key === "id") continue;

            if (key == "hRest" && recurso.hRest == 0){
                celda.textContent = "disponible";
            }else{
                celda.textContent = recurso[key];
            }
            
            fila.appendChild(celda);

        }

        //creo el boton de retirar
        let celdaBoton=document.createElement("td");
        let boton = document.createElement("button");

        if(recurso.hRest == 0){
            boton.textContent = "Retirar";
            boton.onclick = function() {    
                crearYretirarReserva(recurso.id);
            };
        }else{
            boton.textContent = "Reservar";
            boton.onclick = function(){
                crearReserva(recurso.id);
            }
        }
        
        celdaBoton.appendChild(boton);
        fila.appendChild(celdaBoton);

        tabla.appendChild(fila);
    }
}

function crearYretirarReserva(idRecurso){
    let horas = leerHoras();
    if(horas === null) return;

    reservarRecurso(idRecurso, usuarioLogeado.id, horas, function(idReserva){
        if(!idReserva){
            alert("error creando la reserva");
        }else{
            iniciarReserva(idReserva, function(respuesta){
                if(respuesta[0]){
                    //reservaModificadaServidor(idReserva, "iniciada");
                    buscarRecursos();
                }else{
                    alert(respuesta[1]);
                    cancelarReserva(idReserva, function(){
                        buscarRecursos();
                    });
                }
            });
        }
    });
}

function crearReserva(idRecurso){
    let horas = leerHoras();
    if(horas === null) return;

    reservarRecurso(idRecurso,usuarioLogeado.id, horas, function(idReserva){
        if(!idReserva){
            alert("error creando la reserva");
        }else{
            buscarRecursos();
        }
    });
}

function abrirResenya(id,numSerie){
    document.getElementById("texto").value = "";
    document.getElementById("valoracion").value = "";
    cambiarSeccion("resenya");
    document.getElementById("recurso").textContent = numSerie;
    idRecursoActual=id;
    
}

function guardarResenya(){
    let valoracion = parseInt(document.getElementById("valoracion").value);
    let texto = document.getElementById("texto").value;

    if(isNaN(valoracion) || valoracion < 1 || valoracion > 5){
        alert("La valoración debe estar entre 1 y 5");
        return;
    }

    crearResenya(idRecursoActual, usuarioLogeado.id, valoracion, texto, function(respuesta){
        if(respuesta){
            alert("Reseña creada");
            resenyaCreadaWS(respuesta);
            idRecursoActual = null;
            cambiarSeccion("inicio");
        }else{
            alert("No se ha creado la reseña");
        }
    });
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);

  return fecha.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function leerHoras(){
    let horas = Number(document.getElementById("tiempoEstimadoNuevaReserva").value);
    if(!Number.isFinite(horas) || horas <= 0){
        alert("las horas estimadas deben ser un número mayor que 0");
        return null;
    }
    return horas;
}

//funciones NFC
function escribirNFC(){
    var idDispositivo = document.getElementById("inputNFC").value;
    if(!idDispositivo || parseInt(idDispositivo) < 0){
        alert("Introduzca un id válido");
        return;
    }

    if(!escrituraNFC){
        document.getElementById("botonNFC").textContent = "leer NFC";
        escrituraNFC = true;
    }else{
        document.getElementById("botonNFC").textContent = "Escribir NFC";
        escrituraNFC = false;
    }

    
}

document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady() { // Espero a que cordova esté inicializado
    // Escuchar cualquier etiqueta NDEF cercana
    nfc.addNdefListener( 
        
        function (nfcEvent) {

            if(escrituraNFC){
                // Crear un registro de texto NDEF
                var idDispositivo = document.getElementById("inputNFC").value;
                console.log("Escribiendo en NFC: " + idDispositivo);
                var record = ndef.textRecord(idDispositivo);
                nfc.write( // Escribir el cuando el dispositivo toque la etiqueta
                    [record], function () {
                        alert("¡Escritura en NFC exitosa!");
                    },

                    function (error) {
                        console.log("Error al escribir en NFC", error);
                        alert("Error al escribir: " + JSON.stringify(error));
                    }
                );

            }else{
                
                var tag = nfcEvent.tag;
                console.log("Etiqueta detectada:", JSON.stringify(tag));
                // Decodificar el mensaje NDEF
                var payload = tag.ndefMessage[0].payload;
                // Los primeros bytes son el idioma
                var languageCodeLength = payload[0] & 0x3F;
                // Quitar el idioma
                var text = nfc.bytesToString(payload.slice(1 + languageCodeLength));
                leerEtiqueta(text,usuarioLogeado.id, function(respuesta){
                    alert(respuesta);
                    cargarInicio();
                });
            }

        },

        function() {
            console.log("Escuchador NFC activado con éxito.");
        },

        function (error) {
            console.log("Error al iniciar el escuchador NFC: " + error);
        }
    );
}
