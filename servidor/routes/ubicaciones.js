module.exports = function (app) {

    var conexion = require("../conexion_mysql.js")

    app.get("/api/ubicaciones", function (req, res) {
        var sql = "SELECT * FROM ubicaciones";
        conexion.query(sql, function(err,ubicaciones){
            if(err){
                res.status(500).json("Error al realizar la consulta");
            }else{
                res.status(200).json(ubicaciones); 
            }
        });
    }); 

};