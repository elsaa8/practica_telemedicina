
module.exports = function (app) {

    const supabase = require("../conexion_supabase.js");

    app.put("/api/gestores/:id", async function (req, res) {

        let datosNuevos = req.body;
        let id = req.params.id;

        // Comprobamos si otro gestor ya tiene ese login
        const { data: gestores, error: errorLogin } = await supabase
            .from("gestores")
            .select("id")
            .eq("login", datosNuevos.login)
            .neq("id", id);

        if (errorLogin) {
            return res.status(500).json({
                mensaje: "Error al comprobar el login"
            });
        }

        if (gestores.length !== 0) {
            return res.status(404).json({
                mensaje: "Otro gestor ya tiene ese Login"
            });
        }

        // Si nadie tiene ese login, actualizamos el gestor
        const { data: gestorActualizado, error: errorActualizacion } = await supabase
            .from("gestores")
            .update({
                nombre: datosNuevos.nombre,
                apellidos: datosNuevos.apellidos,
                login: datosNuevos.login
            })
            .eq("id", id)
            .select();

        if (errorActualizacion) {
            console.log("Error al actualizar el gestor", errorActualizacion);

            return res.status(500).json({
                mensaje: "Error al realizar la actualización del gestor"
            });
        }

        if (!gestorActualizado || gestorActualizado.length === 0) {
            return res.status(404).json({
                mensaje: "Gestor no encontrado"
            });
        }

        res.status(200).json("Gestor actualizado");
    });

};

