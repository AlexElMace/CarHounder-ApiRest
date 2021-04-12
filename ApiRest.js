const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const crypto = require('crypto');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
let cors = require('cors');
app.use(cors());
let port = process.env.PORT || 300;
let mysql = require("mysql");
let connection = mysql.createConnection({

    host: "carhounderdb.cimuzljnzpno.us-east-2.rds.amazonaws.com",
    user: "admin",
    password : "carhoundercodenotch",
    database: "carhounder"

});

const conexionFallida = "-1";
const operacionIncorrecta = "-2";
const mensajeContacto = require("./mensaje");

app.post("/contacto", function (request, response){
    mensajeContacto(request.body);
    response.send("mensaje enviado")
});

////////////////////////// APIREST TALLERES //////////////////////////////////

app.post("/registrar/taller", function(request, response){
    let email = request.body.email;
    let password = request.body.password;
    let nombre = request.body.nombre;
    let cif = request.body.cif;
    let direccion = request.body.direccion;
    let cp = request.body.cp;
    let ciudad = request.body.ciudad;
    let provincia = request.body.provincia;
    let telefono = request.body.telefono;
    let foto = request.body.foto;
    let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    let params = new Array(email,passwordHash,nombre,cif,direccion,cp,ciudad,provincia,telefono,foto)
    let sql = "INSERT INTO talleres (email,password,nombre,cif,direccion,cp,ciudad,provincia,telefono,foto) VALUES (?,?,?,?,?,?,?,?,?,?)"
    connection.query(sql, params, function(err, result) {
        if (err) 
            response.send(conexionFallida);
        else {
            if(result.insertId)
                response.send(String(result.insertId));
            else 
                response.send(operacionIncorrecta);
        }
    });
});

app.get("/talleres", function(request,response){
    let cp = request.query.cp;
    if(cp == null){
        let sql = "SELECT talleres.*, ROUND(AVG(nota),1) AS notaMedia FROM talleres LEFT JOIN resenyas_taller ON talleres.id_taller = resenyas_taller.id_taller GROUP BY talleres.id_taller"
        connection.query(sql,function(err,result){
            if(err){ 
                response.send(conexionFallida);
            }    
            else {
                if(result.affectedRows == 0){
                    response.send(operacionIncorrecta);
                }
                else {
                    response.send(result);
                }
            }
        });
    }else{
        let params = cp;
        let sql = "SELECT talleres.*, ROUND(AVG(nota),1) AS notaMedia FROM talleres LEFT JOIN resenyas_taller ON talleres.id_taller = resenyas_taller.id_taller WHERE cp = ? GROUP BY id_taller" 
        connection.query(sql,params,function(err,result){
            if(err){ 
                response.send(conexionFallida);
            }    
            else {
                if(result.affectedRows == 0){
                    response.send(operacionIncorrecta);
                }
                else {
                    response.send(result);
                }
            }
        });
    }
});

app.get("/talleresDetalles", function(request,response){
    let id = request.query.id;
    let params = id;
    let sql = "SELECT * FROM talleres WHERE talleres.id_taller = ?"; 
    connection.query(sql,params,function(err,result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.put("/taller", function(request, response) {
    let array = [request.body.email, request.body.nombre, request.body.cif, request.body.direccion, request.body.cp, request.body.ciudad, request.body.provincia, request.body.telefono, request.body.id_taller];
    let putTaller = "UPDATE talleres SET email = COALESCE(?, email), nombre = COALESCE(?, nombre), cif = COALESCE(?, cif), direccion = COALESCE(?, direccion), cp = COALESCE(?, cp), ciudad = COALESCE(?, ciudad), provincia = COALESCE(?, provincia), telefono = COALESCE(?, telefono) WHERE id_taller = ?";
    connection.query(putTaller, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/cambiarFotoTaller", function(request, response) {
    let foto = request.query.foto;
    let id_taller = request.query.id_taller;
    let params = [foto,id_taller];
    let sql = "UPDATE talleres SET foto = COALESCE(?, foto) WHERE id_taller = ?"
    connection.query(sql,params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    })
})


app.get("/passwordAnterior", function(request, response) {
    let password = request.query.password;
    let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    let params = [passwordHash,request.query.id_taller]
    let sql = "SELECT email FROM talleres WHERE password = ? AND id_taller = ?"
    connection.query(sql,params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    }); 
});

app.put("/cambiarPassword", function(request, response) {
    let password = request.body.password
    let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    let array = [passwordHash, request.body.id_taller];
    let putTaller = "UPDATE talleres SET password = COALESCE(?, password) WHERE id_taller = ?";
    connection.query(putTaller, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/borrarTaller", function(request,response){
    let id = request.query.id;
    let params = id;
    let sql = "DELETE FROM talleres WHERE id_taller = ?" 
    connection.query(sql,params,function(err,result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

///////////////////////// APIREST CLIENTES ////////////////////////

app.post("/registrar/usuario", function(request, response){
    let email = request.body.email;
    let password = request.body.password;
    let nombre = request.body.nombre;
    let apellidos = request.body.apellidos;
    let telefono = request.body.telefono;
    let foto = request.body.foto;
    let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    let params = new Array(email,passwordHash,nombre,apellidos,telefono,foto)
    let sql = "INSERT INTO clientes (email,password,nombre,apellidos,telefono,foto) VALUES (?,?,?,?,?,?)"
    connection.query(sql, params, function(err, result) {
        if (err) 
            response.send(conexionFallida);
        else {
            if(result.insertId)
                response.send(String(result.insertId));
            else 
                response.send(operacionIncorrecta);
        }
    });
});

app.get("/cambiarFotoCliente", function(request, response) {
    let foto = request.query.foto;
    let id_cliente = request.query.id_cliente;
    let params = [foto,id_cliente];
    let sql = "UPDATE clientes SET foto = COALESCE(?, foto) WHERE id_cliente= ?"
    connection.query(sql,params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    })
})

app.put("/cliente", function(request, response) {
    let array = [request.body.email, request.body.nombre, request.body.apellidos, request.body.telefono, request.body.id];
    let putCliente = "UPDATE clientes SET email = COALESCE(?, email), nombre = COALESCE(?, nombre), apellidos = COALESCE(?, apellidos), telefono = COALESCE(?, telefono) WHERE id_cliente = ?";
    connection.query(putCliente, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.put("/cambiarPasswordCliente", function(request, response) {
    let array = [request.body.password, request.body.id];
    let putCliente = "UPDATE clientes SET password = COALESCE(?, password) WHERE id_cliente = ?";
    connection.query(putCliente, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/passwordAnteriorCliente", function(request, response) {
    let password = request.query.password;
    let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    let params = [passwordHash,request.query.id_cliente]
    let sql = "SELECT email FROM clientes WHERE password = ? AND id_cliente = ?"
    connection.query(sql,params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    }); 
});

app.delete("/borrarCliente", function(request,response){
    let id = request.query.id;
    let params = id;
    let sql = "DELETE FROM clientes WHERE id_cliente = ?" 
    connection.query(sql,params,function(err,result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

///////////////////////// APIREST LOGIN ////////////////////////////////////

app.get("/login", function(request,response){
    let email = request.query.email;
    let params = [email];
    let sql = "SELECT email FROM usuarios WHERE email = ?";
    connection.query(sql,params,function(err,result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});


app.post("/login", function(request, response){
    let email = request.body.email;
    let password = request.body.password;
    let rol = request.body.rol;
    let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    let params = [email,passwordHash,rol]
    let sql = "INSERT INTO usuarios (email,password,rol) VALUES (?,?,?)"
    connection.query(sql, params, function(err, result) {
        if(err) 
            response.send(conexionFallida);
        else {
            if(result.insertId)
                response.send(String(result.insertId));
            else 
                response.send(operacionIncorrecta);
        }
    });
});

app.get("/talleresLogin", function(request,response){
    let email = request.query.email;
    let params = email;
    let sql = "SELECT * FROM talleres WHERE email = ?" 
    connection.query(sql,params,function(err,result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});
    
app.get("/clientesLogin", function(request,response){
    let email = request.query.email;
    let params = email;
    let sql = "SELECT * FROM clientes WHERE email = ?" 
    connection.query(sql,params,function(err,result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.post("/login/usuario", function(request, response){
    let email = request.body.email;
    let password = request.body.password;
    let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    let params = [email,passwordHash]
    let sql = "SELECT * FROM usuarios  WHERE email = ? AND password = ?"
    connection.query(sql, params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});
    
app.delete("/borrarLogin", function(request,response){
    let email = request.query.email;
    let params = email;
    let sql = "DELETE FROM usuarios WHERE email = ?" 
    connection.query(sql,params,function(err,result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});
    
app.put("/login", function(request, response) {
    let password = request.body.password
    let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    let array = [passwordHash, request.body.email];
    let putCliente = "UPDATE usuarios SET password= COALESCE(?, password) WHERE email = ?";
    connection.query(putCliente, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

////////////////////////////// APIREST OFERTAS ////////////////////////////////////

app.get("/oferta", function(request, response) {
    let sql;
    let id = request.query.id;
    let params = id;
    sql = "SELECT * FROM ofertas WHERE id_taller = ?" ;
    connection.query(sql,params,function (err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
 });

app.post("/oferta", function(request, response){
    let idOferta = request.body.id_oferta;
    let id = request.body.id_taller;
    let oferta = request.body.oferta;
    let params = [idOferta,id,oferta]
    let sql = "INSERT INTO ofertas (id_oferta,id_taller,oferta) VALUES (?,?,?)"
    connection.query(sql, params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.put("/oferta", function(request, response) {
    let params = [request.body.oferta, request.body.id_taller];
    let sql = "UPDATE ofertas SET oferta= COALESCE(?, oferta) WHERE id_taller = ?";
    connection.query(sql, params, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

///////////////////////////// APIREST SERVICIOS //////////////////////////////////

app.get("/servicios", function(request, response) {
    let sql;
    sql = "SELECT * FROM servicios JOIN talleres_servicios ON servicios.id_servicios = talleres_servicios.id_servicios";
    connection.query(sql, function (err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.post("/serviciosTalleres", function(request, response){
    let idTaller = request.body.id_taller;
    let idServicios = request.body.id_servicios;
    let params = [idTaller,idServicios]
    let sql = "INSERT INTO talleres_servicios (id_taller,id_servicios) VALUES (?,?)"
    connection.query(sql, params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/borrarServicio", function(request,response){
    let id_servicios = request.query.id_servicios;
    let id_taller = request.query.id_taller;
    let params = [id_servicios,id_taller];
    let sql = "DELETE FROM talleres_servicios WHERE id_servicios = ? AND id_taller = ?" 
    connection.query(sql,params,function(err,result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/serviciosLogin", function(request, response) {
    let sql;
    let taller = request.query.id_taller
    sql = "SELECT * FROM servicios JOIN talleres_servicios ON servicios.id_servicios = talleres_servicios.id_servicios WHERE id_taller = ?";
    connection.query(sql,taller, function (err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

//////////////////////////// APIREST CHAT ///////////////////////////////

app.get("/chat", function(request, response){
    let array = [request.query.email];
    let chat = "";
    if(request.query.rol == "cliente"){
        chat = "SELECT talleres.nombre, talleres.foto, chats.id_chat, chats.del_cliente FROM talleres JOIN chats ON (chats.id_taller = talleres.id_taller) JOIN clientes ON (chats.id_cliente = clientes.id_cliente) WHERE clientes.email = ? AND del_cliente = false";
    }
    else if(request.query.rol == "taller"){
        chat = "SELECT clientes.nombre, clientes.foto, chats.id_chat, chats.del_taller FROM clientes JOIN chats ON (chats.id_cliente = clientes.id_cliente) JOIN talleres ON (chats.id_taller = talleres.id_taller) WHERE talleres.email = ? AND del_taller = false";
    }
    connection.query(chat, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/comprobarChat", function(request, response){
    let array = [request.query.id_cliente, request.query.id_taller];
    let chat = "SELECT * FROM chats WHERE id_cliente = ? AND id_taller = ?";
    connection.query(chat, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/mensaje", function(request, response){
    let array = [request.query.id_chat];
    let mensaje = "SELECT * FROM mensajes JOIN chats ON (mensajes.id_chat = chats.id_chat) WHERE mensajes.id_chat = ?";
    connection.query(mensaje, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.post("/chat", function(request, response){
    let array = [request.body.id_cliente, request.body.id_taller];
    let chat = "INSERT INTO chats (id_cliente, id_taller, del_taller, del_cliente) VALUES (?,?, false, false)";
    connection.query(chat, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.post("/mensaje", function(request, response){
    let array = [request.body.id_chat, request.body.emisor, request.body.mensaje];
    let mensaje = "INSERT INTO mensajes (id_chat, emisor, mensaje) VALUES (?,?,?)";
    connection.query(mensaje, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/eliminarChatCliente", function(request, response){
    let array = [request.query.del_cliente, request.query.id_chat];
    let chat = "UPDATE chats SET del_cliente = ? WHERE id_chat = ?";
    connection.query(chat, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/eliminarChatTaller", function(request, response){
    let array = [request.query.del_taller, request.query.id_chat];
    let chat = "UPDATE chats SET del_taller = ? WHERE id_chat = ?";
    connection.query(chat, array, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/chat", function(request, response){
    let chat = "DELETE FROM chats WHERE id_chat = " + request.query.id_chat;
    connection.query(chat, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/mensaje", function(request, response){
    let mensaje = "DELETE FROM mensajes WHERE id_chat = " + request.query.id_chat;
    connection.query(mensaje, function(err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

///////////////////// APIREST FAVORITOS /////////////////////////////

app.post("/favoritos", function(request, response){
    let idCliente = request.body.id_cliente;
    let idTaller = request.body.id_taller;
    let params = [idCliente,idTaller]
    let sql = "INSERT INTO favoritos_cliente (id_cliente,id_taller) VALUES (?,?)"
    connection.query(sql, params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});  
  
app.get("/favoritos", function(request, response) {
    let sql;
    let cliente = request.query.id_cliente
    sql = "SELECT id_cliente,favoritos_cliente.id_taller,talleres.nombre FROM favoritos_cliente JOIN talleres ON favoritos_cliente.id_taller = talleres.id_taller WHERE id_cliente = ?";
    connection.query(sql,cliente, function (err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/favoritos", function(request,response){
    let id_cliente = request.query.id_cliente;
    let id_taller = request.query.id_taller;
    let params = [id_cliente,id_taller];
    let sql = "DELETE FROM favoritos_cliente WHERE id_cliente = ? AND id_taller = ?" 
    connection.query(sql, params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

//////////////////////////////////////// APIREST RESEÑAS ///////////////////////////////////////////////////////

app.post("/resenyas", function(request, response){
    let idTaller = request.body.id_taller;
    let idCliente = request.body.id_cliente;
    let comentario = request.body.comentario;
    let nota = request.body.nota;
    let params = [idTaller,idCliente,comentario,nota];
    let sql = "INSERT INTO resenyas_taller (id_taller,id_cliente,comentario,nota) VALUES (?,?,?,?)";
    connection.query(sql, params, function(err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});  

app.get("/resenyasTaller", function(request, response) {
    let sql;
    let taller = request.query.id_taller
    sql = "SELECT resenyas_taller.*,clientes.nombre,clientes.apellidos FROM resenyas_taller JOIN clientes ON resenyas_taller.id_cliente = clientes.id_cliente WHERE id_taller = ?";       
    connection.query(sql,taller, function (err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/ultimasResenyas", function(request, response) {
    let sql;
    let taller = request.query.id_taller;
    sql = "SELECT resenyas_taller.*,clientes.nombre AS clienteNombre,clientes.apellidos,clientes.foto, talleres.nombre AS tallerNombre FROM resenyas_taller JOIN clientes ON resenyas_taller.id_cliente = clientes.id_cliente JOIN talleres ON resenyas_taller.id_taller = talleres.id_taller ORDER BY id_resenya DESC LIMIT 4";      
    connection.query(sql,taller, function (err, result){
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

///////////////////////////////////////////// APIREST FILTROS ///////////////////////////////////////////////////

app.post("/filtrarPorServicio", function(request,response){
    let cp = request.body.cp;
    let params = request.body.params;
    let length = request.body.params.length;
    if(cp == null){
        let sql = "SELECT talleres.*, ROUND(AVG(nota),1) AS notaMedia FROM talleres JOIN talleres_servicios ON talleres.id_taller = talleres_servicios.id_taller LEFT JOIN resenyas_taller ON talleres.id_taller = resenyas_taller.id_taller WHERE id_servicios = ?"
        for(let i=1; i<length;i++){
            sql += " OR id_servicios = ?";
        }
        sql += " GROUP BY id_taller,id_servicios";
        connection.query(sql, params, function(err, result) {
            if (err) 
                response.send(conexionFallida);
            else {
                if(result){
                    let arrayIdsTotales = [];
                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                      }
                    for(let obj of result){
                        arrayIdsTotales.push(obj.id_taller);
                    }
                    let arrayUnicos = arrayIdsTotales.filter(onlyUnique);
                    let arrayFinales = [];
                    for(let id of arrayUnicos){
                        const count = arrayIdsTotales.filter((obj) => obj === id).length;
                        if(count == length){
                            arrayFinales.push(id);
                        }
                    }
                    if(arrayFinales.length == 0){
                        response.send(arrayFinales);
                    }else{
                    let sql2 = "SELECT talleres.*, ROUND(AVG(nota),1) AS notaMedia FROM talleres LEFT JOIN resenyas_taller ON talleres.id_taller = resenyas_taller.id_taller WHERE talleres.id_taller = ?";
                    for(let i=1; i<arrayFinales.length;i++){
                        sql2 += " OR talleres.id_taller = ?";
                    }
                    sql2 += " GROUP BY talleres.id_taller";
                    connection.query(sql2, arrayFinales, function(err, resultado){
                        if(err){
                            console.log(err);
                        }else{
                            response.send(resultado);
                        }
                    })
                }
                }else{ 
                    response.send(operacionIncorrecta);
                }
            }
        });
    }else{
        let sql = "SELECT talleres.*, ROUND(AVG(nota),1) AS notaMedia FROM talleres JOIN talleres_servicios ON talleres.id_taller = talleres_servicios.id_taller LEFT JOIN resenyas_taller ON talleres.id_taller = resenyas_taller.id_taller WHERE talleres.cp =" + cp + " AND id_servicios = ?"
        for(let i=1; i<length;i++){
            sql += " OR id_servicios = ?";
        }
        sql += " GROUP BY id_taller,id_servicios";
        connection.query(sql, params, function(err, result) {
            if (err) 
                response.send(conexionFallida);
            else {
                if(result){
                    let arrayIdsTotales = [];
                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                      }
                    for(let obj of result){
                        arrayIdsTotales.push(obj.id_taller);
                    }
                    let arrayUnicos = arrayIdsTotales.filter(onlyUnique);
                    let arrayFinales = [];
                    for(let id of arrayUnicos){
                        const count = arrayIdsTotales.filter((obj) => obj === id).length;
                        if(count == length){
                            arrayFinales.push(id);
                        }
                    }
                    if(arrayFinales.length == 0){
                        response.send(arrayFinales);
                    }else{
                    let sql2 = "SELECT talleres.*, ROUND(AVG(nota),1) AS notaMedia FROM talleres LEFT JOIN resenyas_taller ON talleres.id_taller = resenyas_taller.id_taller WHERE talleres.cp=" + cp + " AND talleres.id_taller = ?";
                    for(let i=1; i<arrayFinales.length;i++){
                        sql2 += " OR talleres.id_taller = ?";
                    }
                    sql2 += " GROUP BY talleres.id_taller";
                    connection.query(sql2, arrayFinales, function(err, resultado){
                        if(err){
                            response.send(conexionFallida);
                        }else{
                            response.send(resultado);
                        }
                    })
                }
                }else{ 
                    response.send(operacionIncorrecta);
                }
            }
        });
    }
});

app.get("/filtrarPorPuntuacion", function(request,response){
    let cp = request.query.cp;
    let puntuacion = request.query.puntuacion;
    if(cp == null){
        let params = puntuacion;
        let sql = "SELECT talleres.*, ROUND(AVG(nota),1) AS notaMedia FROM talleres LEFT JOIN resenyas_taller ON talleres.id_taller = resenyas_taller.id_taller LEFT JOIN talleres_servicios ON talleres.id_taller = talleres_servicios.id_taller GROUP BY id_taller HAVING notaMedia >= ?";
        connection.query(sql,params,function(err,result){
            if(err){ 
                response.send(conexionFallida);
            }    
            else {
                response.send(result);
            }
        });
    }else{
        let params = [puntuacion,cp];
        let sql = "SELECT talleres.*, ROUND(AVG(nota),1) AS notaMedia FROM talleres LEFT JOIN resenyas_taller ON talleres.id_taller = resenyas_taller.id_taller LEFT JOIN talleres_servicios ON talleres.id_taller = talleres_servicios.id_taller GROUP BY id_taller HAVING notaMedia >= ? AND cp= ?";
        connection.query(sql,params,function(err,result){
            if(err){ 
                response.send(conexionFallida);
            }    
            else {
                response.send(result);
            }
        });
    }
});

////////////////////////////////////////////// APIREST CITAS ///////////////////////////////////////////////

app.post("/citas/cliente", function (req, response) {
    let servicios = req.body.servicios;
    let fecha = req.body.fecha;
    let hora = req.body.hora;
    let taller = req.body.id_taller;
    let cliente = req.body.id_cliente;
    let params = [servicios, fecha, hora, taller, cliente];
    let sql = "INSERT INTO reservas (servicios, fecha, hora, id_taller, id_cliente) VALUES (?, ?, ?, ?, ?)";
    connection.query(sql, params, function (err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/citas/cliente", function (req, response) {
    let sql;
    let id = req.query.id_cliente;
    let params = id;

    sql = "SELECT t.nombre, t.direccion, r.fecha, r.hora, r.id_reservas, t.id_taller, r.servicios FROM reservas AS r JOIN talleres AS t ON t.id_taller = r.id_taller JOIN clientes AS c ON c.id_cliente = r.id_cliente WHERE r.id_cliente = ? ORDER BY r.fecha ASC, r.hora ASC";

    connection.query(sql, params, function (err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/citas/taller", function (req, response) {
    let sql;
    let id = req.query.id_taller;
    let params = id;

    sql = "SELECT c.id_cliente, c.nombre, c.apellidos, c.telefono, t.direccion, r.fecha, r.hora, r.id_reservas, t.id_taller, r.servicios FROM reservas AS r JOIN talleres AS t ON t.id_taller = r.id_taller JOIN clientes AS c ON c.id_cliente = r.id_cliente WHERE r.id_taller = ? ORDER BY r.fecha ASC, r.hora ASC";

    connection.query(sql, params, function (err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/citas/clienteNuevo", function (req, response) {
    let sql;
    let nombre = req.query.nombre;
    let telefono = req.query.telefono;
    let params = [nombre, telefono];
    sql = "SELECT id_cliente FROM clientes WHERE nombre = ? AND telefono = ?";
    connection.query(sql, params, function (err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/citas/cliente", function (req, response) {
    let sql;
    let cliente = req.query.id_cliente;
    let reserva = req.query.id_reservas;
    let params = [cliente, reserva];
    sql = "DELETE FROM reservas WHERE id_cliente = ? AND id_reservas= ?";
    connection.query(sql, params, function (err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.delete("/citas/taller", function (req, response) {
    let sql;
    let taller = req.query.id_taller;
    let reserva = req.query.id_reservas;
    let params = [taller, reserva];
    sql = "DELETE FROM reservas WHERE id_taller= ? AND id_reservas= ?";
    connection.query(sql, params, function (err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.put("/citas/taller", function (req, response) {
    let fecha = req.body.fecha;
    let hora = req.body.hora;
    let idReserva = req.body.id_reservas;
    let params = [fecha, hora, idReserva];
    let sql = "UPDATE reservas SET fecha = ?, hora = ? WHERE id_reservas = ?";
    connection.query(sql, params, function (err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.get("/citas/horas", function (req, response) {
    let sql;
    let id = req.query.id_taller;
    let params = id;
    sql = "SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, hora FROM reservas WHERE id_taller = ?";
    connection.query(sql, params, function (err, result) {
        if(err){ 
            response.send(conexionFallida);
        }    
        else {
            if(result.affectedRows == 0){
                response.send(operacionIncorrecta);
            }
            else {
                response.send(result);
            }
        }
    });
});

app.listen(port);