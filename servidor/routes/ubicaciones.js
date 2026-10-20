
module.exports = function (app,supabase) {



    app.get("/api/ubicaciones", async function (req, res) {

        const { data: ubicaciones, error } = await supabase
            .from("ubicaciones")
            .select("*");

        if (error) {
            console.log("Error al realizar la consulta", error);
            return res.status(500).json("Error al realizar la consulta");
        }

        res.status(200).json(ubicaciones);

    });

};
