```javascript
module.exports = function (app) {

    // Importar la conexión de Supabase
    const supabase = require("../conexion_supabase.js");

    app.get("/api/categorias", async function (req, res) {

        const { data: categorias, error } = await supabase
            .from("categorias")
            .select("*");

        if (error) {
            console.log("Error al realizar la select de categorias", error);
            return res.status(500).json({
                error: "Error al realizar la consulta de categorias"
            });
        }

        res.status(200).json(categorias);
    });

};
```
