module.exports = function (app) {

    var conexion = require("../conexion_mysql.js")

    app.get("/api/modelos", function (req, res) {
        var sql = "SELECT * FROM modelos";
        conexion.query(sql, function(err,modelos){
            if(err){
                res.status(500).json("Error al realizar la consulta");
            }else{
                res.status(200).json(modelos); 
            }
        });
    }); 

};