//var net = require('net');
var zmq = require("zeromq");
var responder = zmq.socket("rep")
var dm = require ('./dm.js');

console.log("dmserver alive")
responder.bind("tcp://*:5555", function(err){
  if (err){console.log(err)}else{
    console.log("DMserver listening on 9000")
  }}

)

responder.on('message', function(data) {

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
      responder.send (JSON.stringify(reply));
    });

    // Add a 'close' event handler to this instance of socket
    responder.on('close', function(data) {
        console.log('Connection closed');
    });
  }
)
