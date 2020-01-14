var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = ["primer mensaje\n", "segundo mensaje\n"];
var users  = { Foreador: '1234',
			  mudito: '1234',
			  troll: '1234',
			  josocxe: '1234'
			};
var subjects = ["Primer tema", "Segundo tema"];

/*app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
*/

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('getData', function(data){
		console.log("the request received:", data)
		if (data == "users"){
			io.emit('data', users);
			console.log("sending back users")
		}});
	socket.on("sendData", function(data){
			console.log("the data received:", data)
			users = data
			console.log("Final users: ", users)
		})
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});
