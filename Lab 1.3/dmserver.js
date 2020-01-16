var net = require('net');
var dm = require ('./dm.js');

  /*if listening to dmclient activate the following:
var dmclient = require("./dmclient.js")
let HOST = dmclient.HOST;
let PORT = dmclient.PORT;
*/
//while listening to forum:
var forum = require('./forum.js');

// Create the server socket, on client connections, bind event handlers
server = net.createServer(function(sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('Conected to client: ' + sock.remoteAddress + ':' + sock.remotePort);
});

server.on("connection", function (sock){
  // Add a 'data' event handler to this instance of socket
  sock.on('data', function(data) {

      console.log('request comes in...' + data);
      var str = data.toString();
      var strRounds = str.replace("}{","}*{").split("*");
      strRounds.forEach((part, i) => {

        console.log(part)
        var invo = JSON.parse (part);
        console.log('request is:' + invo.what + ':' + part);

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
      sock.on('close', function(data) {
          console.log('Connection closed');
      });

    })});



//server.listen(9000);


server.listen(9000, function () {
var address = server.address();
var port = address.port;
var family = address.family;
var ipaddr = address.address;
console.log('Server is listening at port' + port);
console.log('Server ip :' + ipaddr);
console.log('Server is IP4/IP6 : ' + family);
});

//for control via forum:


/*server.listen(function () {
  var address = server.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('Server is listening at port' + port);
  console.log('Server ip :' + ipaddr);
  console.log('Server is IP4/IP6 : ' + family);
});*/
