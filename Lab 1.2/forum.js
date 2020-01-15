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
		console.log('Here comes a new message:' + msg);
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

  	// Get all info
  	sock.on ('get user list', function () {
		//getInfo();
    getUserData();
    getSubjectData();
		dm.getMessageList();
	  });

    //async functions to server the info and emit it when done
    getUserData = async function(){
		tempData = await dm.getUserList();
		var userData = JSON.parse(tempData);
		uploadUsers(userData);
	  }

    getSubjectData = async function(){
    tempData = await dm.getSubjectList();
    var subjectData = JSON.parse(tempData);
    uploadSubjects(subjectData);
    }

    //when data has been received we emit the userNames etc.
	  uploadUsers = function(userData){
		userNames = [];
    for (const [key, value] of Object.entries(userData)) {
      userNames.push(key);
    }
      console.log(userNames)
		sock.emit ('user list', userNames);
	  }

	  uploadSubjects = function(subjectData){
		subjects = [];
    for (const [key, value] of Object.entries(subjectData)) {
      subjects.push(value);
    }
		sock.emit ('subject list', subjects);
	  }

  	// Client ask for message list
  	sock.on ('get message list', function (from, to, isPriv) {
		console.log("Event: get message list: " + from + ':' + to + '(' + isPriv + ')');
		allMessages = dm.getMessageList();
		if (isPriv) {
	  		//sock.emit ('message list', from, to, isPriv, dm.getPrivateMessageList());
	  	} else {
			sock.emit ('message list', from, to, isPriv, allMessages);
	  	}
	  });

    sock.on("login", async function(u,p){
    tempData = await dm.getUserList();
    var userData = JSON.parse(tempData);
    checkLogin(userData, u, p);
    });

    //checking the credentials and emitting an ack or err respectively
	  checkLogin = function(userData, u, p){
		userNames = [];
    let lower = u.toLowerCase();
    let valid = false;
  	for (let i in userData) {
  		if (i.toLowerCase() == lower) {valid = (userData[u] == p);}
  	}

  	if (valid){
      sock.emit ('login', 'ack', u);
    } else {
      sock.emit ('login', 'err', 'Credenciales incorrectas');
    }
  };

});

// Listen for connections !!
http.listen (10000, on_startup);
