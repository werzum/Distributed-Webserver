var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dm = require ('./dm_remote.js');
var commands = process.argv;
var viewsdir = __dirname + '/views';
app.set('views', viewsdir)

let reqresport = "tcp://127.0.0.1:"+commands[2].toString();
let pubssubport = "tcp://127.0.0.1:"+commands[3].toString();
let webserverport = commands[4];
console.log("forum ports are", reqresport, "and puport",pubssubport)
dm.StartReq(reqresport);

process.on('uncaughtException', function (err) {
    console.log(err);
});

// Subscriber
var zmq = require("zeromq");
subscriber = zmq.socket("sub");
subscriber.connect(pubssubport);
subscriber.subscribe("forum message");
console.log("Subscriber connected to port", pubssubport);

subscriber.on("message", function(topic, message) {
  //letting the message buffer, converting it to the
  //right format, adding timestamp and finally sending it
//  console.log("forum received message:", message.toString())
  message = message.toString();
  message = JSON.parse(message)
  console.log("forum received parsed message:",message)
  message = message.msg;
  message.ts = new Date();
  io.emit('message', JSON.stringify(message));
});

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


// Subscriber
//var dmserver = require("./dmserver.js")
//var zmq = require("zeromq");
//let subscriber = zmq.socket("sub");
//let dmsubscribeport = "tcp://127.0.0.1:5557";
//console.log("Subscriber connected to port", dmsubscribeport);
/*
//enter addresses here which are passed to startPubSubServers
let addressList = ['tcp://127.0.0.1:5557','tcp://127.0.0.1:5558','tcp://127.0.0.1:5559']
//starting multiple instances of dmserver
const util = require('util');
const exec = util.promisify(require('child_process').exec);
for (var i = 0; i < addressList.length; i++) {
    let address = addressList[i]
    let string = 'node dmserver.js '+address.toString()
    async function spawnServer(string) {
      const { stdout, stderr } = await exec(string);
    }
    spawnServer(string);
    dmserver.startPubSubServers(address, addressList, i);
}
*/
/*subscriber.connect(dmsubscribeport);
subscriber.subscribe("");
subscriber.on("message", function(topic, message) {
  //letting the message buffer, converting it to the
  //right format, adding timestamp and finally sending it
  console.log("forum received message")
  message = message.toString();
  message = JSON.parse(message)
  message = message.msg;
  message.ts = new Date();
  io.emit('message', JSON.stringify(message));
});*/
/*
var zmq = require('zeromq')
var subscriber = zmq.socket('sub')
subscriber.connect("tcp://127.0.0.1:5559")
subscriber.subscribe("")

subscriber.on("message", function(reply) {
    console.log('Received message: ', reply.toString());
})
*/



io.on('connection', function(sock) {

	console.log("Event: client connected");
	sock.on('disconnect', function(){
		console.log('Event: client disconnected');
	});

  	sock.on('message', function(msgStr){
  		console.log("Event: message: " + msgStr);
  		var msg = JSON.parse (msgStr);
		msg.ts = new Date(); // timestamp
		if (msg.isPrivate) {
			dm.addPrivateMessage (msg, function () {
				io.emit('message', JSON.stringify(msg));
			});
		} else {
			dm.addPublicMessage (msg, function () {
          console.log("messages should look like this:",JSON.stringify(msg))
			     io.emit('message', JSON.stringify(msg));
			});
		}
	});

    // New subject added to storage, and broadcasted
    sock.on('new subject', function (sbj) {
    	dm.addSubject(sbj, function (id) {
    		console.log("Event: new subject: " + sbj + '-->' + id);
    		if (id == -1) {
    			sock.emit ('new subject', 'err', 'El tema ya existe', sbj);
    		} else {
    			sock.emit ('new subject', 'ack', id, sbj);
    			io.emit ('new subject', 'add', id, sbj);
    		}
    	});
    });

    // New subject added to storage, and broadcasted
    sock.on('new user', function (usr, pas) {
    	dm.addUser(usr, pas, function (exists) {
    		console.log("Event: new user: " + usr + '(' + pas + ')');
    		if (exists) {
    			sock.emit ('new user', 'err', usr, 'El usuario ya existe');
    		} else {
    			sock.emit ('new user', 'ack', usr);
    			io.emit ('new user', 'add', usr);
    		}
    	});
    });

  	// Client ask for current user list
  	sock.on ('get user list', function () {
  		dm.getUserList (function (list) {
	  		console.log("Event: get user list");
  			sock.emit ('user list', list);
  		});
  	});

   	// Client ask for current subject list
   	sock.on ('get subject list', function () {
   		dm.getSubjectList (function (list) {
	   		console.log("Event: get subject list");
   			sock.emit ('subject list', list);
   		});
   	});

   	// Client ask for message list
   	sock.on ('get message list', function (from, to, isPriv) {
  		console.log("Event: get message list: " + from + ':' + to + '(' + isPriv + ')');
  		if (isPriv) {
  			dm.getPrivateMessageList (from, to, function (list) {
  				sock.emit ('message list', from, to, isPriv, list);
  			});
  		} else {
  			dm.getPublicMessageList (to, function (list) {
	  			sock.emit ('message list', from, to, isPriv, list);
	  		});
  		}
  	});

  	// Client authenticates
  	// TODO: session management and possible single sign on
  	sock.on ('login', function (u,p) {
  		console.log("Event: user logs in");
  		dm.login (u, p, function (ok) {
  			if (!ok) {
  				console.log ("Wrong user credentials: " + u + '(' + p + ')');
  				sock.emit ('login', 'err', 'Credenciales incorrectas');
  			} else {
  				console.log ("User logs in: " + u + '(' + p + ')');
  				sock.emit ('login', 'ack', u);
  			}
  		});
  	});
});

// Listen for connections !!
http.listen (webserverport, on_startup);
