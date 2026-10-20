
module.exports = function (app,supabase) {

    var jwt = require('jwt-simple');
    var clave = 'miSecretoMasOscuro';

    

    // LOGIN DE GESTORES
    app.post("/api/gestores/login", async function (req, res) {

        var usuarioIngresado = req.body;

        const { data: gestores, error } = await supabase
            .from("gestores")
            .select("id, nombre, apellidos, login")
            .eq("login", usuarioIngresado.usuario)
            .eq("contrasenya", usuarioIngresado.contrasenya);

        if (error) {
            console.log("Error en la base de datos", error);
            return res.status(500).json({
                error: "Error en la base de datos"
            });
        }

        if (!gestores || gestores.length === 0) {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        var gestor = gestores[0];

        var contenido = {
            usuario: gestor.id,
            expira: Date.now() + 60 * 60 * 1000
        };

        var token = jwt.encode(contenido, clave);

        res.status(200).json({
            id: gestor.id,
            nombre: gestor.nombre,
            apellidos: gestor.apellidos,
            login: gestor.login,
            token: token
        });

    });


    // REGISTRO DE GESTORES
    app.post("/api/gestores", async function (req, res) {

        let gestor = req.body;

        if (
            !gestor.nombre ||
            !gestor.apellidos ||
            !gestor.login ||
            !gestor.contrasenya
        ) {
            return res.status(400).json("campos vacíos");
        }

        // Comprobamos si ya existe un gestor con ese login
        const { data: gestoresExistentes, error: errorConsulta } = await supabase
            .from("gestores")
            .select("id")
            .eq("login", gestor.login);

        if (errorConsulta) {
            console.log("Error en la base de datos", errorConsulta);
            return res.status(500).json({
                error: "Error en la base de datos"
            });
        }

        if (gestoresExistentes.length !== 0) {
            return res.status(409).json({
                error: "Error un usuario con este login ya existe"
            });
        }

        // Insertamos el nuevo gestor
        const { error: errorInsercion } = await supabase
            .from("gestores")
            .insert({
                login: gestor.login,
                contrasenya: gestor.contrasenya,
                nombre: gestor.nombre,
                apellidos: gestor.apellidos
            });

        if (errorInsercion) {
            console.log("Error al insertar el gestor", errorInsercion);
            return res.status(500).json({
                error: "Error en la base de datos"
            });
        }

        res.status(201).json("Gestor añadido");

    });

};        
