//importo express y lo llamo app 
var express = require("express");
var app = express();


// que toda la comunicación va a ser en json
app.use(express.json()); 

// siempre que el usuario meta en el buscador el primer argumento, va a devolver el html de la carpeta cliente
app.use("/appCliente", express.static("../cliente")); 
app.use("/ws", express.static("../cliente_ws")); 

// Cargo rutas

// RUTAS PÚBLICAS 
require("./routes/login-registro.js")(app);

//A PARTIR DE AQUI CHECKEA EL TOKEN 
require("./auth.js")(app);

//PRIVADAS, HACE FALTA TOKEN Y TE LO VA A MIRAR 
require("./routes/gestores.js")(app);
require("./routes/categorias.js")(app);
require("./routes/ubicaciones.js")(app);
require("./routes/modelos.js")(app);
require("./routes/recursos.js")(app);

//establezco el puerto
app.listen(3000);
//por si hay que matar al puerto >netstat -ano | findstr :3000
//taskkill /PID NUMERO_DEL_PID /F

