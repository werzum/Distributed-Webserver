var net = require('net');
var dm = require ('./dm.js');
var zmq = require("zmq");
var responder = zmq.socket("rep");


  /*if listening to dmclient activate the following:
var dmclient = require("./dmclient.js")
let HOST = dmclient.HOST;
let PORT = dmclient.PORT;
*/
//while listening to forum:
var forum = require('./forum.js');
forum.dmserverport;
forum.dmserverhost;

// Create the server socket, on client connections, bind event handlers
//server = net.createServer(function(sock) {

    // Add a 'data' event handler to this instance of socket
    responder.on('data', function(data) {

        console.log('request comes in...' + data);
        var str = data.toString();
        var invo = JSON.parse (str);
        console.log('request is:' + invo.what + ':' + str);

        var reply = {what:invo.what, invoId:invo.invoId};
        switch (invo.what) {
        	case 'get subject list':
        		reply.obj = dm.getSubjectList();
        		break;
          case 'get user list':
        		reply.obj = dm.getUserList();
        		break;
          case 'get public message list':
          	reply.obj = dm.getPublicMessageList (invo.sbj);
          	break;
          case 'get private message list':
          	reply.obj = dm.getPrivateMessageList (invo.u1, invo.u2);
          	break;
          case 'add private message':
          	reply.obj = dm.addPrivateMessage (invo.msg);
          	break;
          case 'add public message':
            reply.obj = dm.addPublicMessage (invo.msg);
            break;
          case 'add subject':
            reply.obj = dm.addSubject (invo.sbj);
            break;
          case 'add user':
            reply.obj = dm.addUser (invo.u, invo.p);
            break;
          case 'login':
            reply.obj = dm.login (invo.u, invo.p);
            break;
        }
        sock.write (JSON.stringify(reply));
    });


    // Add a 'close' event handler to this instance of socket
    responder.on('close', function(data) {
        console.log('Connection closed');
    });


responder.bind("tcp://*:"+forum.dmserverport, function(err){
  if (err) {
    console.log(err)
  } else {
    console.log("Listening on port ", forum.dmserverport);
  }
});

/*
server.listen(PORT, HOST, function () {
    console.log('Server listening on ' + HOST +':'+ PORT);
});
*/
//for control via forum:

server.listen(forum.dmserverport, forum.dmserverhost, function () {
    console.log('Server listening on ' + forum.dmserverport +':'+ forum.dmserverhost);
});
