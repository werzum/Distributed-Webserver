var zmq = require("zeromq");
var requester = zmq.socket("req")

exports.StartReq = function (port) {
	console.log("COnnect to server at", port)
	requester.connect(port);
}

var callbacks = {} // hash of callbacks. Key is invoId
var invoCounter = 0; // current invocation number is key to access "callbacks".

//
// When data comes from server. It is a reply from our previous request
// extract the reply, find the callback, and call it.
// Its useful to study "exports" functions before studying this one.
//
requester.on ('message', function (data) {
	console.log ('data comes in: ' + data);

	//splitting the received JSON data into single commands
	var str = data.toString();
	var strRounds = str.replace("}{","}*{").split("*");
	strRounds.forEach((part, i) => {

		var reply = JSON.parse (part);
		switch (reply.what) {
			// TODO complete list of commands
			case 'get private message list':
				console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
				callbacks [reply.invoId] (reply.obj); // call the stored callback, two arguments
				delete callbacks [reply.invoId]; // remove from hash
				break;
			case 'get public message list':
				console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
				callbacks [reply.invoId] (reply.obj); // call the stored callback, one argument
				delete callbacks [reply.invoId]; // remove from hash
				break;
			case 'get subject list':
				//console.log("data extract:")
				console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
				//originally callbacks [reply.invoId] (reply.obj);
				callbacks [reply.invoId] (reply.obj); // call the stored callback, one argument
				delete callbacks [reply.invoId]; // remove from hash
				break;
			case 'get user list':
				console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
				callbacks [reply.invoId] (reply.obj); // call the stored callback, one argument
				delete callbacks [reply.invoId]; // remove from hash
				break;
			case 'login':
				console.log ('We received a reply for login');
				callbacks [reply.invoId] (reply.obj); // call the stored callback, no arguments
				delete callbacks [reply.invoId]; // remove from hash
				break;
			case 'add private message':
				console.log ('We received a reply for adding private message');
				callbacks [reply.invoId] (reply.obj); // call the stored callback, no arguments
				delete callbacks [reply.invoId]; // remove from hash
				break;
			case 'add public message':
				console.log ('We received a request to add public message');
				callbacks [reply.invoId] (reply.obj); // call the stored callback, no arguments
				delete callbacks [reply.invoId]; // remove from hash
				break;
			case 'add user':
				console.log ('We received a request to add user');
				callbacks [reply.invoId] (reply.obj); // call the stored callback, no arguments
				delete callbacks [reply.invoId]; // remove from hash
				break;
			case 'add subject':
				console.log ('We received a request to add subject');
				callbacks [reply.invoId] (reply.obj); // call the stored callback, no arguments
				delete callbacks [reply.invoId]; // remove from hash
				break;
			default:
				console.log ("Panic: we got this: " + reply.what);
		}
});
});

// Add a 'close' event handler for the client socket
requester.on('close', function() {
    console.log('Connection closed');
});

//
// on each invocation we store the command to execute (what) and the invocation Id (invoId)
// InvoId is used to execute the proper callback when reply comes back.
//
function Invo (str, cb) {
	this.what = str;
	this.invoId = ++invoCounter;
	callbacks[invoCounter] = cb;
}

//
//
// Exported functions as 'dm'
//
//

exports.getPublicMessageList = function  (sbj, cb) {
	var invo = new Invo ('get public message list', cb);
	invo.sbj = sbj;
	requester.send (JSON.stringify(invo));
}

exports.getPrivateMessageList = function (u1, u2, cb) {
	invo = new Invo ('get private message list', cb);
	invo.u1 = u1;
	invo.u2 = u2;
	requester.send (JSON.stringify(invo));
}

exports.getSubjectList = function (cb) {
	console.log("received req for subject list")
	requester.send (JSON.stringify(new Invo ('get subject list', cb)));
}

exports.getUserList = function (cb) {
	console.log("received req for user list")
	requester.send (JSON.stringify(new Invo ('get user list', cb)));
}

exports.addPublicMessage = function  (msg, cb) {
	var invo = new Invo ('add public message', cb);
	invo.msg = msg;
	requester.send (JSON.stringify(invo));
}

exports.addPrivateMessage = function  (msg, cb) {
	var invo = new Invo ('add private message', cb);
	invo.msg = msg;
	requester.send (JSON.stringify(invo));
}

exports.addSubject = function  (sbj, cb) {
	var invo = new Invo ('add subject', cb);
	invo.sbj = sbj;
	requester.send (JSON.stringify(invo));
}

exports.addUser = function  (u, p, cb) {
	var invo = new Invo ('add user', cb);
	invo.u = u;
	invo.p = p;
	requester.send (JSON.stringify(invo));
}

exports.login = function  (u, p, cb) {
	var invo = new Invo ('login', cb);
	invo.u = u;
	invo.p = p;
	requester.send (JSON.stringify(invo));
}
