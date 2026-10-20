
module.exports = function (app) {

    const supabase = require("../conexion_supabase.js");

    // GET: OBTENER TODOS LOS RECURSOS
    app.get("/api/recursos", async function (req, res) {

        const { data: recursos, error } = await supabase
            .from("recursos")
            .select("*");

        if (error) {
            console.log(error);
            return res.status(500).json("Error al realizar la consulta");
        }

        res.status(200).json(recursos);
    });


    // DELETE: BORRAR UN RECURSO
    app.delete("/api/recursos/:id", async function (req, res) {

        const id = parseInt(req.params.id);

        // Comprobamos si existe el recurso
        const { data: recurso, error: errorBusqueda } = await supabase
            .from("recursos")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        if (errorBusqueda) {
            console.log(errorBusqueda);
            return res.status(500).json("Error al realizar la consulta");
        }

        if (!recurso) {
            return res.status(404).json({
                error: "Recurso no encontrado"
            });
        }

        // Borramos primero las reservas
        const { error: errorReservas } = await supabase
            .from("reservas")
            .delete()
            .eq("recurso", id);

        if (errorReservas) {
            console.log(errorReservas);
            return res.status(500).json("Error al realizar la consulta");
        }

        // Borramos después las reseñas
        const { error: errorResenyas } = await supabase
            .from("resenyas")
            .delete()
            .eq("recurso", id);

        if (errorResenyas) {
            console.log(errorResenyas);
            return res.status(500).json("Error al realizar la consulta");
        }

        // Finalmente, borramos el recurso
        const { error: errorBorrado } = await supabase
            .from("recursos")
            .delete()
            .eq("id", id);

        if (errorBorrado) {
            console.log(errorBorrado);
            return res.status(500).json("Error al realizar la consulta");
        }

        // Devolvemos la lista actualizada
        const { data: recursos, error: errorLista } = await supabase
            .from("recursos")
            .select("*");

        if (errorLista) {
            console.log(errorLista);
            return res.status(500).json("Error al realizar la consulta");
        }

        res.status(200).json(recursos);
    });


    // PUT: ACTUALIZAR UN RECURSO
    app.put("/api/recursos/:id", async function (req, res) {

        let datosNuevos = req.body;
        let id = parseInt(req.params.id);

        const { data: recursoActualizado, error } = await supabase
            .from("recursos")
            .update({
                categoria: datosNuevos.categoria,
                modelo: datosNuevos.modelo,
                numero_serie: datosNuevos.numero_serie,
                ubicacion: datosNuevos.ubicacion,
                estado: datosNuevos.estado
            })
            .eq("id", id)
            .select();

        if (error) {
            console.log(error);
            return res.status(500).json("Error al realizar la consulta");
        }

        if (!recursoActualizado || recursoActualizado.length === 0) {
            return res.status(404).json("Error recurso no encontrado");
        }

        // Devolvemos todos los recursos actualizados
        const { data: recursos, error: errorLista } = await supabase
            .from("recursos")
            .select("*");

        if (errorLista) {
            console.log(errorLista);
            return res.status(500).json("Error al realizar la consulta");
        }

        res.status(200).json(recursos);
    });


    // POST: CREAR UN RECURSO
    app.post("/api/recursos", async function (req, res) {

        let recurso = req.body;

        const { data: recursoInsertado, error: errorInsercion } = await supabase
            .from("recursos")
            .insert({
                numero_serie: recurso.numero_serie,
                categoria: recurso.categoria,
                modelo: recurso.modelo,
                ubicacion: recurso.ubicacion,
                estado: recurso.estado
            })
            .select()
            .single();

        if (errorInsercion) {
            console.log(errorInsercion);
            return res.status(500).json("Error al realizar la consulta");
        }

        // Obtenemos todos los recursos
        const { data: recursos, error: errorLista } = await supabase
            .from("recursos")
            .select("*");

        if (errorLista) {
            console.log(errorLista);
            return res.status(500).json("Error al realizar la consulta");
        }

        let respuestaAlCliente = [recursoInsertado, recursos];

        res.status(200).json(respuestaAlCliente);
    });


    // GET: OBTENER LAS RESERVAS DE UN RECURSO
    app.get("/api/recursos/:id/reservas", async function (req, res) {

        let id = parseInt(req.params.id);

        const { data: reservas, error } = await supabase
            .from("reservas")
            .select("*")
            .eq("recurso", id);

        if (error) {
            console.log(error);
            return res.status(500).json("Error al realizar la consulta");
        }

        const reservasTraducidas = await traducirReservas(reservas);

        res.status(200).json(reservasTraducidas);
    });


    // GET: OBTENER LAS RESEÑAS DE UN RECURSO
    app.get("/api/recursos/:id/resenyas", async function (req, res) {

        let id = parseInt(req.params.id);

        const { data: resenyas, error } = await supabase
            .from("resenyas")
            .select("*")
            .eq("recurso", id);

        if (error) {
            console.log(error);
            return res.status(500).json("Error al realizar la consulta");
        }

        const resenyasTraducidas = await traducirReservas(resenyas);

        res.status(200).json(resenyasTraducidas);
    });


    // FUNCIONES PARA TRADUCIR LOS NOMBRES DE LOS SANITARIOS

    async function traducirReservas(registros) {

        if (!registros || registros.length === 0) {
            return registros || [];
        }

        const ids = [
            ...new Set(
                registros
                    .map(registro => registro.sanitario)
                    .filter(id => id !== null && id !== undefined)
            )
        ];

        if (ids.length === 0) {
            return registros;
        }

        const { data: sanitarios, error } = await supabase
            .from("sanitarios")
            .select("id, nombre, apellidos")
            .in("id", ids);

        if (error) {
            console.log("Error al buscar los sanitarios", error);
            return registros;
        }

        // Creamos un mapa de identificadores y nombres
        const nombres = new Map();

        for (const sanitario of sanitarios) {
            nombres.set(
                sanitario.id,
                sanitario.nombre + "&" + sanitario.apellidos
            );
        }

        // Sustituimos el ID por el nombre, como hacía el código original
        return registros.map(registro => ({
            ...registro,
            sanitario: nombres.has(registro.sanitario)
                ? nombres.get(registro.sanitario)
                : registro.sanitario
        }));
    }

};

