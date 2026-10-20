
module.exports = function (app) {

    app.get("/api/modelos", async function (req, res) {

        const { data: modelos, error } = await supabase
            .from("modelos")
            .select("*");

        if (error) {
            console.log("Error al realizar la consulta", error);
            return res.status(500).json("Error al realizar la consulta");
        }

        res.status(200).json(modelos);

    });

};
