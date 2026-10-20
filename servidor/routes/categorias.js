module.exports = function (app) {

    var conexion = require("../conexion_mysql.js")

    app.get("/api/categorias", function (req, res) {
        var sql = "SELECT * FROM categorias";
        conexion.query(sql, function (err, categorias) {
            if (err) {
                console.log("Error al realizar la select de categorias", err);
                res.status(500).json("Error al realizar la consulta de categorias");
            } else {
                res.status(200).json(categorias); 
            }
        });
    }); 

};
