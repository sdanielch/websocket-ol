var express = require('express');
var app = express();
//var server = require('https').Server(app);
//var io = require('socket.io').listen(server);

const fs = require('fs');
const fse = require('fs-extra');
var https = require('https');
//const server = app.listen(8080);

app.use(express.static('public'));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.openlove.me');
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});





var server = https.createServer({ 
                key: fs.readFileSync('/opt/psa/var/modules/letsencrypt/etc/live/openlove.me/privkey.pem'),
                cert: fs.readFileSync('/opt/psa/var/modules/letsencrypt/etc/live/openlove.me/fullchain.pem') 
             },app);
const io = require('socket.io').listen(server);
server.listen(8080, function() {
console.log("Ejecutando Servidor en https://www.openlove.me:8080");

});


var conectados;
conectados = 0;
io.on('connection', function(socket) {
  conectados++;
  console.log('El usuario ' + socket.handshake.query.id + " esta conectado al websocket.");
  
  var usuario = socket.handshake.query.id;

 socket.on('disconnect', function () {
     console.log('El usuario ' + socket.handshake.query.id + " se ha desconectado del websocket.");
     conectados = conectados - 1;

  });

console.log('Usuarios conectados -> ' + conectados);

  var filePath = '/var/www/vhosts/mallorcamoves.es/openlove.me/app/webroot/users/'+usuario+'/notificacion.json';
  // Nos aseguramos de que el fichero existe
  fse.ensureFileSync(filePath);

  var file = fs.readFileSync(filePath);
  socket.emit('messages', JSON.parse(file.toString()));

  fs.watch(filePath, function(eventName, filename) {
    if(filename){  
         file = fs.readFileSync(filePath);
	socket.emit('messages',JSON.parse(file.toString()));
    } else {
    console.log('No se ha conseguido acceso al fichero...')
  }
});


});



app.get("/", function(request, res){
   
    console.log("Usuario conectado.");
   // res.status(200).send("Hello World!");
    res.sendFile(__dirname + '/index.html');


});


