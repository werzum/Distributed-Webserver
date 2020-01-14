var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dm = require('./dm.js');

var viewsdir = __dirname + '/views';
app.set('views', viewsdir)


// called on connection
function get_page (req, res) {
 	console.log ("Serving request " + req.params.page);
	res.sendFile(viewsdir + '/' + req.params.page);
}

// Called on server startup
function on_startup () {
	console.log("Starting: server current directory:" + __dirname)
}

// serve static css as is
app.use('/css', express.static(__dirname + '/css'));

// serve static html files
app.get('/', function(req, res){
	req.params.page = 'index.html'
	get_page (req, res);
});
app.get('/:page', function(req, res){
	get_page (req, res);
});



io.on('connection', function(sock) {
	console.log("Event: client connected");
	sock.on('disconnect', function(){
    	console.log('Event: client disconnected');
  	});

  	// on messages that come from client, store them, and send them to every 
  	// connected client
  	// TODO: We better optimize message delivery using rooms.
	sock.on('message', function(msgStr){
		console.log("Event: message: " + msgStr);
		var msg = JSON.parse (msgStr);
		msg.ts = new Date(); // timestamp
		if (msg.isPrivate) {
			//dm.addPrivateMessage (msg);
		} else {
			dm.addPublicMessage (msg);
		}
		io.emit('message', JSON.stringify(msg));
  	});

  	// New subject added to storage, and broadcasted
  	sock.on('new subject', function (sbj) {
		var id = dm.addSubject(sbj);
		console.log("Event: new subject: " + sbj + '-->' + id);
  		if (id == -1) {
  			sock.emit ('new subject', 'err', 'El tema ya existe', sbj);
  		} else {
  			sock.emit ('new subject', 'ack', id, sbj);
 			io.emit ('new subject', 'add', id, sbj); 			
  		}
  	});

  	// Client ask for current user list
  	sock.on ('get user list', function () {
		console.log("Event: get user list");  		
  		sock.emit ('user list', dm.getUserList());
  	});

  	// Client ask for current subject list
  	sock.on ('get subject list', function () {
		console.log("Event: get subject list");  		
  		sock.emit ('subject list', dm.getSubjectList());
  	});

  	// Client ask for message list
  	sock.on ('get message list', function (from, to, isPriv) {
		console.log("Event: get message list: " + from + ':' + to + '(' + isPriv + ')');  		
		if (isPriv) {
	  		//sock.emit ('message list', from, to, isPriv, dm.getPrivateMessageList());
	  	} else {
	  		sock.emit ('message list', from, to, isPriv, dm.getPublicMessageList(to));
	  	}
  	});

  	// Client authenticates
  	// TODO: session management and possible single sign on
  	sock.on ('login', function (u,p) {
		console.log("Event: user logs in");  		
  		if (!dm.login (u,p)) {
	  		console.log ("Wrong user credentials: " + u + '(' + p + ')');
  			sock.emit ('login', 'err', 'Credenciales incorrectas');
  		} else {
	  		console.log ("User logs in: " + u + '(' + p + ')');
			sock.emit ('login', 'ack', u);	  			
  		}
  	});
});

// Listen for connections !!
http.listen (10000, on_startup);
